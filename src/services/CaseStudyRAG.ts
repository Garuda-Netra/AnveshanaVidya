/**
 * CASE STUDY RAG SERVICE
 * Enhanced RAG system with citation support and multi-mode prompts
 */

import { 
  CaseStudyEnhanced, 
  RAGResponse, 
  Citation, 
  PromptMode 
} from '../types/caseStudySchema';
import { CaseStudyIngestionService, SearchResult } from './CaseStudyIngestion';
import { 
  DIRECT_QA_TEMPLATE, 
  GUIDED_WALKTHROUGH_TEMPLATE, 
  TEACHING_MODE_TEMPLATE,
  REFUSAL_TEMPLATES,
  buildCaseStudyContext,
  extractCitations
} from './PromptTemplates';
import { migrateLegacyCase, LegacyCase } from './CaseStudyMigration';

/**
 * RAG MODE DETECTION
 */
function detectPromptMode(query: string): PromptMode {
  const normalized = query.toLowerCase();
  
  // Guided walkthrough keywords
  const walkthroughKeywords = [
    'how do i', 'step by step', 'guide me', 'walkthrough', 
    'investigate', 'what steps', 'procedure', 'process'
  ];
  
  // Teaching mode keywords
  const teachingKeywords = [
    'explain', 'what is', 'how does', 'teach me', 
    'learn about', 'understand', 'concept', 'why'
  ];
  
  if (walkthroughKeywords.some(kw => normalized.includes(kw))) {
    return 'guided_walkthrough';
  }
  
  if (teachingKeywords.some(kw => normalized.includes(kw))) {
    return 'teaching';
  }
  
  return 'direct_qa';
}

/**
 * SCOPE VALIDATION
 */
function isForensicQuery(query: string): boolean {
  const normalized = query.toLowerCase();
  
  // Allow greetings and help
  const allowedGeneral = ['hello', 'hi', 'help', 'what can you', 'who are you'];
  if (allowedGeneral.some(kw => normalized.includes(kw))) return true;
  
  // Forensic keywords
  const forensicKeywords = [
    'forensic', 'investigation', 'case', 'artifact', 'evidence',
    'malware', 'ransomware', 'breach', 'incident', 'analysis',
    'tool', 'autopsy', 'volatility', 'wireshark', 'memory',
    'disk', 'registry', 'log', 'timeline', 'hash', 'mft',
    'ntfs', 'file system', 'network', 'packet', 'pcap'
  ];
  
  return forensicKeywords.some(kw => normalized.includes(kw));
}

/**
 * CASE STUDY RAG SERVICE
 */
export class CaseStudyRAGService {
  private ingestionService: CaseStudyIngestionService;
  private enhancedCases: Map<string, CaseStudyEnhanced> = new Map();
  
  constructor() {
    this.ingestionService = new CaseStudyIngestionService();
  }
  
  /**
   * Initialize with legacy cases
   */
  public initializeFromLegacy(legacyCases: LegacyCase[]): void {
    const enhancedCases = legacyCases.map(legacy => migrateLegacyCase(legacy));
    this.ingestionService.ingestCases(enhancedCases);
    
    enhancedCases.forEach(caseStudy => {
      this.enhancedCases.set(caseStudy.case_id, caseStudy);
    });
  }
  
  /**
   * Process query and return RAG response
   */
  public processQuery(query: string): RAGResponse {
    // Validate scope
    if (!isForensicQuery(query)) {
      return {
        query,
        mode: 'direct_qa',
        answer: REFUSAL_TEMPLATES.NON_FORENSIC,
        citations: [],
        confidence: 0,
        follow_up_suggestions: [
          'Show me a case study',
          'Explain memory forensics',
          'How to investigate ransomware?'
        ]
      };
    }
    
    // Detect mode
    const mode = detectPromptMode(query);
    
    // Search for relevant cases
    const searchResults = this.ingestionService.search(query, 3);
    
    if (searchResults.length === 0) {
      const availableCases = this.ingestionService.getAllCaseIds()
        .map(id => `• ${id}`)
        .join('\n');
      
      return {
        query,
        mode,
        answer: REFUSAL_TEMPLATES.INSUFFICIENT_CONTEXT.replace('{{available_cases}}', availableCases),
        citations: [],
        confidence: 0,
        follow_up_suggestions: [
          'Tell me about ransomware-investigation',
          'What artifacts are in insider-data-theft case?',
          'List all case studies'
        ]
      };
    }
    
    // Retrieve full cases
    const relevantCases = searchResults
      .map(result => this.enhancedCases.get(result.case_id))
      .filter(Boolean) as CaseStudyEnhanced[];
    
    // Build context
    const context = buildCaseStudyContext(relevantCases, 6000);
    
    // Build citations
    const citations: Citation[] = searchResults.map(result => ({
      case_id: result.case_id,
      artifact_id: result.matched_artifacts[0],
      finding_id: result.matched_findings[0],
      confidence: result.relevance_score
    }));
    
    // Generate response based on mode
    const answer = this.generateResponse(query, mode, context, relevantCases);
    
    // Extract and validate citations from answer
    const answerCitations = extractCitations(answer);
    const validatedCitations = answerCitations
      .filter(cit => this.ingestionService.validateCitation(cit))
      .map(cit => this.parseCitation(cit));
    
    // Generate follow-up suggestions
    const followUpSuggestions = this.generateFollowUps(mode, relevantCases);
    
    return {
      query,
      mode,
      answer,
      citations: validatedCitations.length > 0 ? validatedCitations : citations,
      confidence: searchResults[0]?.relevance_score || 0.5,
      follow_up_suggestions: followUpSuggestions,
      related_topics: this.extractRelatedTopics(relevantCases)
    };
  }
  
  /**
   * Generate response based on mode
   */
  private generateResponse(
    query: string, 
    mode: PromptMode, 
    context: string, 
    cases: CaseStudyEnhanced[]
  ): string {
    // This is a simplified version - in production, this would call Gemini with the appropriate template
    switch (mode) {
      case 'direct_qa':
        return this.generateDirectQA(query, context, cases);
      case 'guided_walkthrough':
        return this.generateWalkthrough(query, context, cases);
      case 'teaching':
        return this.generateTeaching(query, context, cases);
    }
  }
  
  /**
   * Generate Direct QA response
   */
  private generateDirectQA(query: string, _context: string, cases: CaseStudyEnhanced[]): string {
    const firstCase = cases[0];
    
    if (query.toLowerCase().includes('what tool') || query.toLowerCase().includes('which tool')) {
      const tools = firstCase.tools_used.map(t => t.tool_name).slice(0, 3);
      return `The investigation used: ${tools.join(', ')} [${firstCase.case_id}].\n\n` +
        `For example, ${tools[0]} was used to ${firstCase.tools_used[0].purpose} ` +
        `[${firstCase.case_id}:${firstCase.artifacts[0]?.artifact_id || 'artifact_1'}].`;
    }
    
    if (query.toLowerCase().includes('artifact')) {
      const artifacts = firstCase.artifacts.slice(0, 3);
      return `Key artifacts analyzed:\n` +
        artifacts.map(art => 
          `• **${art.type}** [${firstCase.case_id}:${art.artifact_id}]: ${art.description}`
        ).join('\n') +
        `\n\nThese artifacts provided ${artifacts[0].evidence_value} evidence value for the investigation.`;
    }
    
    if (query.toLowerCase().includes('timeline') || query.toLowerCase().includes('when')) {
      const events = firstCase.timeline.slice(0, 3);
      return `**Timeline of Events** [${firstCase.case_id}]:\n` +
        events.map(evt => 
          `• ${evt.timestamp}: ${evt.event} [Tool: ${evt.tool || 'N/A'}]`
        ).join('\n');
    }
    
    // Default response
    return `**${firstCase.title}** [${firstCase.case_id}]\n\n` +
      `${firstCase.summary}\n\n` +
      `**Incident Type**: ${firstCase.incident_type} (${firstCase.severity} severity)\n` +
      `**Key Finding**: ${firstCase.findings[0]?.description || firstCase.conclusions[0]} ` +
      `[${firstCase.case_id}:${firstCase.findings[0]?.finding_id || 'finding_1'}]`;
  }
  
  /**
   * Generate Guided Walkthrough response
   */
  private generateWalkthrough(_query: string, _context: string, cases: CaseStudyEnhanced[]): string {
    const firstCase = cases[0];
    
    let walkthrough = `**Investigation Walkthrough: ${firstCase.title}**\n\n`;
    
    // Show first 3 workflow steps
    firstCase.timeline.slice(0, 3).forEach((event, idx) => {
      walkthrough += `**Step ${idx + 1}: ${event.event}**\n`;
      walkthrough += `- **Tool**: ${event.tool || 'Manual analysis'}\n`;
      
      // Find matching artifact
      const artifact = firstCase.artifacts.find(a => a.artifact_id === event.artifact_id);
      if (artifact) {
        walkthrough += `- **Artifact**: ${artifact.type} [${firstCase.case_id}:${artifact.artifact_id}]\n`;
        walkthrough += `- **Location**: ${artifact.location}\n`;
      }
      
      walkthrough += `- **Significance**: ${event.significance}\n\n`;
    });
    
    walkthrough += `\n*Cite: [${firstCase.case_id}:workflow]*\n\n`;
    walkthrough += `**Next Steps**: Continue analyzing remaining artifacts or ask about specific tools used.`;
    
    return walkthrough;
  }
  
  /**
   * Generate Teaching Mode response
   */
  private generateTeaching(query: string, _context: string, cases: CaseStudyEnhanced[]): string {
    const firstCase = cases[0];
    
    let teaching = `**Forensic Concept: Illustrated by ${firstCase.title}**\n\n`;
    
    // Identify concept from query
    const normalized = query.toLowerCase();
    
    if (normalized.includes('artifact') || normalized.includes('evidence')) {
      const artifact = firstCase.artifacts[0];
      teaching += `**Understanding Forensic Artifacts**\n\n`;
      teaching += `Artifacts are digital traces left by system activity. For example:\n\n`;
      teaching += `**${artifact.type}** [${firstCase.case_id}:${artifact.artifact_id}]\n`;
      teaching += `- **What it is**: ${artifact.description}\n`;
      teaching += `- **Where found**: ${artifact.location}\n`;
      teaching += `- **Evidence value**: ${artifact.evidence_value}\n\n`;
      teaching += `In this case, this artifact was ${artifact.evidence_value === 'high' ? 'critical' : 'important'} `;
      teaching += `for establishing the investigation timeline.`;
    } else if (normalized.includes('timeline') || normalized.includes('sequence')) {
      teaching += `**Timeline Analysis in Forensics**\n\n`;
      teaching += `Timeline reconstruction helps investigators understand the sequence of events. `;
      teaching += `In [${firstCase.case_id}], the timeline revealed:\n\n`;
      firstCase.timeline.slice(0, 3).forEach(evt => {
        teaching += `• ${evt.timestamp}: ${evt.event}\n`;
      });
      teaching += `\nThis sequential analysis identified the attack progression and attribution.`;
    } else {
      teaching += `**Case Overview**: ${firstCase.summary}\n\n`;
      teaching += `**Key Learning Points**:\n`;
      firstCase.lessons_learned.slice(0, 3).forEach(lesson => {
        teaching += `\n**${lesson.category.toUpperCase()}**: ${lesson.description}\n`;
        teaching += `*Best Practice*: ${lesson.best_practice}\n`;
      });
    }
    
    return teaching;
  }
  
  /**
   * Parse citation string to Citation object
   */
  private parseCitation(citationStr: string): Citation {
    const parts = citationStr.split(':');
    
    return {
      case_id: parts[0],
      artifact_id: parts[1],
      finding_id: parts[2],
      confidence: 0.8
    };
  }
  
  /**
   * Generate follow-up suggestions
   */
  private generateFollowUps(mode: PromptMode, cases: CaseStudyEnhanced[]): string[] {
    const firstCase = cases[0];
    
    switch (mode) {
      case 'direct_qa':
        return [
          `What tools were used in ${firstCase.case_id}?`,
          `Show me the timeline for ${firstCase.case_id}`,
          `What were the key findings?`
        ];
      case 'guided_walkthrough':
        return [
          'Show me the next investigation steps',
          'How do I analyze similar artifacts?',
          'What tools should I use?'
        ];
      case 'teaching':
        return [
          'Explain another forensic concept',
          'Show me a practical example',
          'What are the best practices?'
        ];
    }
  }
  
  /**
   * Extract related topics from cases
   */
  private extractRelatedTopics(cases: CaseStudyEnhanced[]): string[] {
    const topics = new Set<string>();
    
    cases.forEach(caseStudy => {
      topics.add(caseStudy.incident_type);
      caseStudy.keywords.slice(0, 3).forEach(kw => topics.add(kw));
    });
    
    return Array.from(topics).slice(0, 5);
  }
  
  /**
   * Get case by ID
   */
  public getCaseById(caseId: string): CaseStudyEnhanced | null {
    return this.enhancedCases.get(caseId) || null;
  }
  
  /**
   * Get all cases
   */
  public getAllCases(): CaseStudyEnhanced[] {
    return Array.from(this.enhancedCases.values());
  }
  
  /**
   * Get autocomplete suggestions
   */
  public getAutocompleteSuggestions(partial: string): string[] {
    return this.ingestionService.getAutocompleteSuggestions(partial);
  }
  
  /**
   * Get statistics
   */
  public getStats() {
    return {
      ...this.ingestionService.getStats(),
      enhanced_cases: this.enhancedCases.size
    };
  }

  /**
   * Search cases using ingestion index (type-safe helper)
   */
  public searchCases(query: string, limit: number = 5): SearchResult[] {
    return this.ingestionService.search(query, limit);
  }
  
  /**
   * Build prompt for external LLM (Gemini)
   */
  public buildPromptForLLM(query: string, mode: PromptMode, context: string): { system: string; user: string } {
    let template;
    
    switch (mode) {
      case 'direct_qa':
        template = DIRECT_QA_TEMPLATE;
        break;
      case 'guided_walkthrough':
        template = GUIDED_WALKTHROUGH_TEMPLATE;
        break;
      case 'teaching':
        template = TEACHING_MODE_TEMPLATE;
        break;
    }
    
    return {
      system: template.system_prompt,
      user: template.user_prompt_template
        .replace('{{query}}', query)
        .replace('{{context}}', context)
    };
  }
}

// Export singleton
export const caseStudyRAG = new CaseStudyRAGService();
