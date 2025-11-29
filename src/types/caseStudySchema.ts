/**
 * CASE STUDY RAG SCHEMA
 * Comprehensive schema for forensic case study knowledge base
 * Supports structured investigation data with full citation capabilities
 */

export interface TimelineEvent {
  timestamp: string; // ISO 8601 format
  event: string;
  actor?: string; // User, process, IP, etc.
  artifact_id?: string; // Reference to related artifact
  tool?: string;
  significance: 'critical' | 'major' | 'minor';
}

export interface ForensicArtifact {
  artifact_id: string; // Unique identifier for citation
  type: string; // MFT, Registry, Log, PCAP, Prefetch, Memory, etc.
  description: string;
  location: string; // File path, registry key, log file, etc.
  timestamp?: string; // When artifact was created/modified
  hash?: {
    md5?: string;
    sha1?: string;
    sha256?: string;
  };
  size?: number; // Size in bytes
  tool_used?: string; // Tool used to extract/analyze
  findings?: string[]; // Key findings from this artifact
  evidence_value: 'high' | 'medium' | 'low';
}

export interface ToolUsage {
  tool_name: string;
  purpose: string;
  command?: string;
  output_summary: string;
  limitations?: string;
}

export interface Finding {
  finding_id: string; // Unique identifier for citation
  category: 'attack_vector' | 'lateral_movement' | 'persistence' | 'exfiltration' | 'impact' | 'attribution' | 'evidence';
  description: string;
  supporting_artifacts: string[]; // Array of artifact_ids
  confidence: 'confirmed' | 'probable' | 'possible';
  impact: 'critical' | 'high' | 'medium' | 'low';
}

export interface InvestigationLesson {
  lesson_id: string;
  category: 'technical' | 'procedural' | 'legal' | 'communication';
  description: string;
  best_practice: string;
  common_mistake?: string;
}

export interface CaseStudyEnhanced {
  // Core identification
  case_id: string;
  title: string;
  case_number?: string; // Legal case number if applicable
  
  // Case metadata
  summary: string; // Brief overview (100-200 words)
  scenario: string; // Detailed scenario description
  incident_date: string; // ISO 8601
  investigation_date: string; // ISO 8601
  industry: string; // Healthcare, Finance, Tech, Government, etc.
  incident_type: string; // Ransomware, Insider Threat, APT, Data Breach, etc.
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  // Investigation data
  timeline: TimelineEvent[];
  artifacts: ForensicArtifact[];
  tools_used: ToolUsage[];
  
  // Analysis results
  findings: Finding[];
  conclusions: string[];
  attribution?: string; // Threat actor, insider, etc.
  root_cause: string;
  
  // Learning outcomes
  lessons_learned: InvestigationLesson[];
  recommendations: string[];
  
  // Legal/compliance
  legal_notes: string[];
  compliance_considerations?: string[]; // HIPAA, GDPR, PCI-DSS, etc.
  
  // Knowledge graph metadata
  keywords: string[]; // For search indexing
  related_cases?: string[]; // Array of case_ids
  related_modules?: string[]; // Module IDs from topics
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // References
  references: {
    type: 'article' | 'report' | 'cve' | 'mitre_att&ck' | 'tool_doc';
    title: string;
    url?: string;
    identifier?: string; // CVE-2024-1234, T1055, etc.
  }[];
}

/**
 * CITATION SCHEMA
 * Structured citations for RAG responses
 */
export interface Citation {
  case_id: string;
  artifact_id?: string;
  finding_id?: string;
  lesson_id?: string;
  module_id?: string; // Reference to topic module
  section?: string; // Specific section within case
  confidence: number; // 0-1 relevance score
}

/**
 * RAG QUERY RESPONSE
 * Enhanced response structure with citations
 */
export interface RAGResponse {
  query: string;
  mode: 'direct_qa' | 'guided_walkthrough' | 'teaching';
  answer: string;
  citations: Citation[];
  confidence: number;
  follow_up_suggestions: string[];
  related_topics?: string[];
}

/**
 * PROMPT TEMPLATE TYPE
 */
export type PromptMode = 'direct_qa' | 'guided_walkthrough' | 'teaching';

export interface PromptTemplate {
  mode: PromptMode;
  system_prompt: string;
  user_prompt_template: string;
  citation_format: string;
  example_response?: string;
}
