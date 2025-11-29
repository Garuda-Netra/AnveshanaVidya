/**
 * CASE STUDY RAG INGESTION ENGINE
 * Parses case studies and builds keyword + Trie index for efficient retrieval
 */

import { Trie } from '../utils/Trie';
import { 
  CaseStudyEnhanced, 
  ForensicArtifact, 
  Finding
} from '../types/caseStudySchema';

/**
 * INGESTION RULES
 */
interface IngestionRule {
  field: string;
  weight: number; // Search relevance weight
  indexed: boolean; // Include in keyword index
  trie_indexed: boolean; // Include in Trie for autocomplete
}

const INGESTION_RULES: IngestionRule[] = [
  { field: 'case_id', weight: 1.0, indexed: true, trie_indexed: true },
  { field: 'title', weight: 0.95, indexed: true, trie_indexed: true },
  { field: 'summary', weight: 0.85, indexed: true, trie_indexed: false },
  { field: 'incident_type', weight: 0.9, indexed: true, trie_indexed: true },
  { field: 'industry', weight: 0.5, indexed: true, trie_indexed: false },
  { field: 'keywords', weight: 0.8, indexed: true, trie_indexed: true },
  { field: 'artifacts.type', weight: 0.75, indexed: true, trie_indexed: true },
  { field: 'findings.category', weight: 0.7, indexed: true, trie_indexed: false },
  { field: 'tools_used.tool_name', weight: 0.65, indexed: true, trie_indexed: true },
  { field: 'lessons_learned.category', weight: 0.5, indexed: true, trie_indexed: false },
];

/**
 * INDEXED CASE STUDY
 * Enhanced case with search metadata
 */
interface IndexedCase {
  case: CaseStudyEnhanced;
  keywords: Set<string>;
  artifact_map: Map<string, ForensicArtifact>;
  finding_map: Map<string, Finding>;
  tool_names: Set<string>;
}

/**
 * SEARCH RESULT
 */
export interface SearchResult {
  case_id: string;
  relevance_score: number;
  matched_keywords: string[];
  matched_artifacts: string[];
  matched_findings: string[];
}

/**
 * CASE STUDY INGESTION SERVICE
 */
export class CaseStudyIngestionService {
  private indexedCases: Map<string, IndexedCase> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map(); // keyword -> case_ids
  private artifactTrie: Trie = new Trie();
  private toolTrie: Trie = new Trie();
  private caseTrie: Trie = new Trie();
  
  /**
   * Ingest a single case study
   */
  public ingestCase(caseStudy: CaseStudyEnhanced): void {
    const keywords = new Set<string>();
    const artifact_map = new Map<string, ForensicArtifact>();
    const finding_map = new Map<string, Finding>();
    const tool_names = new Set<string>();
    
    // Extract keywords based on ingestion rules
    this.extractKeywords(caseStudy, keywords);
    
    // Build artifact map
    caseStudy.artifacts.forEach(artifact => {
      artifact_map.set(artifact.artifact_id, artifact);
      this.artifactTrie.insert(artifact.type.toLowerCase());
      keywords.add(artifact.type.toLowerCase());
    });
    
    // Build finding map
    caseStudy.findings.forEach(finding => {
      finding_map.set(finding.finding_id, finding);
      keywords.add(finding.category);
    });
    
    // Index tools
    caseStudy.tools_used.forEach(tool => {
      tool_names.add(tool.tool_name);
      this.toolTrie.insert(tool.tool_name.toLowerCase());
      keywords.add(tool.tool_name.toLowerCase());
    });
    
    // Index case identifiers
    this.caseTrie.insert(caseStudy.case_id.toLowerCase());
    this.caseTrie.insert(caseStudy.title.toLowerCase());
    keywords.add(caseStudy.case_id.toLowerCase());
    keywords.add(caseStudy.incident_type.toLowerCase());
    
    // Index keywords
    caseStudy.keywords.forEach(keyword => {
      const normalized = keyword.toLowerCase();
      keywords.add(normalized);
      
      if (!this.keywordIndex.has(normalized)) {
        this.keywordIndex.set(normalized, new Set());
      }
      this.keywordIndex.get(normalized)!.add(caseStudy.case_id);
    });
    
    // Store indexed case
    this.indexedCases.set(caseStudy.case_id, {
      case: caseStudy,
      keywords,
      artifact_map,
      finding_map,
      tool_names
    });
  }
  
  /**
   * Ingest multiple cases
   */
  public ingestCases(cases: CaseStudyEnhanced[]): void {
    cases.forEach(caseStudy => this.ingestCase(caseStudy));
  }
  
  /**
   * Extract keywords from case study based on ingestion rules
   */
  private extractKeywords(caseStudy: any, keywords: Set<string>): void {
    INGESTION_RULES.forEach(rule => {
      if (!rule.indexed) return;
      
      const value = this.getNestedValue(caseStudy, rule.field);
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (typeof v === 'string') {
            keywords.add(v.toLowerCase());
          }
        });
      } else if (typeof value === 'string') {
        keywords.add(value.toLowerCase());
      }
    });
  }
  
  /**
   * Get nested object value by path (e.g., "artifacts.type")
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (Array.isArray(current)) {
        return current.map(item => item[part]).filter(Boolean);
      }
      current = current?.[part];
      if (current === undefined) return null;
    }
    
    return current;
  }
  
  /**
   * Search cases by query
   */
  public search(query: string, limit: number = 5): SearchResult[] {
    const queryTerms = this.tokenize(query);
    const results = new Map<string, SearchResult>();
    
    // Search keyword index
    queryTerms.forEach(term => {
      const matchingCaseIds = this.keywordIndex.get(term) || new Set();
      
      matchingCaseIds.forEach(caseId => {
        if (!results.has(caseId)) {
          results.set(caseId, {
            case_id: caseId,
            relevance_score: 0,
            matched_keywords: [],
            matched_artifacts: [],
            matched_findings: []
          });
        }
        
        const result = results.get(caseId)!;
        result.relevance_score += this.calculateTermWeight(term);
        result.matched_keywords.push(term);
        
        // Check for artifact matches
        const indexedCase = this.indexedCases.get(caseId)!;
        indexedCase.artifact_map.forEach((artifact, artifactId) => {
          if (artifact.type.toLowerCase().includes(term) || 
              artifact.description.toLowerCase().includes(term)) {
            result.matched_artifacts.push(artifactId);
            result.relevance_score += 0.3;
          }
        });
        
        // Check for finding matches
        indexedCase.finding_map.forEach((finding, findingId) => {
          if (finding.description.toLowerCase().includes(term)) {
            result.matched_findings.push(findingId);
            result.relevance_score += 0.25;
          }
        });
      });
    });
    
    // Sort by relevance and return top N
    return Array.from(results.values())
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);
  }
  
  /**
   * Get case by ID
   */
  public getCaseById(caseId: string): CaseStudyEnhanced | null {
    return this.indexedCases.get(caseId)?.case || null;
  }
  
  /**
   * Get artifact by ID
   */
  public getArtifact(caseId: string, artifactId: string): ForensicArtifact | null {
    return this.indexedCases.get(caseId)?.artifact_map.get(artifactId) || null;
  }
  
  /**
   * Get finding by ID
   */
  public getFinding(caseId: string, findingId: string): Finding | null {
    return this.indexedCases.get(caseId)?.finding_map.get(findingId) || null;
  }
  
  /**
   * Get cases by artifact type
   */
  public getCasesByArtifactType(artifactType: string): CaseStudyEnhanced[] {
    const results: CaseStudyEnhanced[] = [];
    const normalized = artifactType.toLowerCase();
    
    this.indexedCases.forEach(indexed => {
      const hasArtifact = Array.from(indexed.artifact_map.values())
        .some(artifact => artifact.type.toLowerCase() === normalized);
      
      if (hasArtifact) {
        results.push(indexed.case);
      }
    });
    
    return results;
  }
  
  /**
   * Get cases by tool
   */
  public getCasesByTool(toolName: string): CaseStudyEnhanced[] {
    const results: CaseStudyEnhanced[] = [];
    const normalized = toolName.toLowerCase();
    
    this.indexedCases.forEach(indexed => {
      if (Array.from(indexed.tool_names).some(tool => tool.toLowerCase() === normalized)) {
        results.push(indexed.case);
      }
    });
    
    return results;
  }
  
  /**
   * Get autocomplete suggestions
   */
  public getAutocompleteSuggestions(partial: string): string[] {
    const caseSuggestions = this.caseTrie.autocomplete(partial.toLowerCase(), 3);
    const artifactSuggestions = this.artifactTrie.autocomplete(partial.toLowerCase(), 3);
    const toolSuggestions = this.toolTrie.autocomplete(partial.toLowerCase(), 3);
    
    return [...caseSuggestions, ...artifactSuggestions, ...toolSuggestions].slice(0, 8);
  }
  
  /**
   * Tokenize query into search terms
   */
  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter(term => term.length > 2);
  }
  
  /**
   * Calculate weight for a search term
   */
  private calculateTermWeight(term: string): number {
    // Find matching ingestion rule
    const rule = INGESTION_RULES.find(r => r.field.includes(term));
    return rule?.weight || 0.5;
  }
  
  /**
   * Validate citation exists
   */
  public validateCitation(citation: string): boolean {
    const parts = citation.split(':');
    
    if (parts.length === 1) {
      // Case ID only
      return this.indexedCases.has(parts[0]);
    }
    
    if (parts.length === 2) {
      // case_id:artifact_id or case_id:finding_id
      const [caseId, itemId] = parts;
      const indexed = this.indexedCases.get(caseId);
      if (!indexed) return false;
      
      return indexed.artifact_map.has(itemId) || indexed.finding_map.has(itemId);
    }
    
    return false;
  }
  
  /**
   * Get all case IDs
   */
  public getAllCaseIds(): string[] {
    return Array.from(this.indexedCases.keys());
  }
  
  /**
   * Get statistics
   */
  public getStats() {
    return {
      total_cases: this.indexedCases.size,
      total_keywords: this.keywordIndex.size,
      total_artifacts: Array.from(this.indexedCases.values())
        .reduce((sum, indexed) => sum + indexed.artifact_map.size, 0),
      total_findings: Array.from(this.indexedCases.values())
        .reduce((sum, indexed) => sum + indexed.finding_map.size, 0),
      unique_tools: new Set(
        Array.from(this.indexedCases.values())
          .flatMap(indexed => Array.from(indexed.tool_names))
      ).size
    };
  }
}
