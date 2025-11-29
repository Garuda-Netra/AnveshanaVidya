/**
 * CASE STUDY MIGRATION UTILITY
 * Converts existing cases.json to enhanced schema format
 */

import { CaseStudyEnhanced, ForensicArtifact, Finding, TimelineEvent, ToolUsage, InvestigationLesson } from '../types/caseStudySchema';

/**
 * Legacy case format (current cases.json)
 */
export interface LegacyCase {
  id: string;
  scenario: string;
  artifacts: Array<{ type: string; description: string; location: string }>;
  workflow: Array<{ step: number; action: string; tool: string; expectedResult: string }>;
  outcomes: string[];
  legalNotes: string[];
}

/**
 * Convert legacy case to enhanced schema
 */
export function migrateLegacyCase(legacy: LegacyCase): CaseStudyEnhanced {
  // Generate artifact IDs
  const artifacts: ForensicArtifact[] = legacy.artifacts.map((art, idx) => ({
    artifact_id: `${legacy.id}_artifact_${idx + 1}`,
    type: art.type,
    description: art.description,
    location: art.location,
    evidence_value: inferEvidenceValue(art.type)
  }));
  
  // Convert workflow to timeline
  const timeline: TimelineEvent[] = legacy.workflow.map((step, idx) => ({
    timestamp: `Step ${step.step}`, // Placeholder - real cases would have actual timestamps
    event: step.action,
    tool: step.tool,
    artifact_id: artifacts[idx]?.artifact_id,
    significance: inferSignificance(step.action)
  }));
  
  // Extract tools
  const toolsUsed: ToolUsage[] = Array.from(
    new Set(legacy.workflow.map(w => w.tool))
  ).map(tool => ({
    tool_name: tool,
    purpose: extractToolPurpose(tool, legacy.workflow),
    output_summary: extractToolOutput(tool, legacy.workflow)
  }));
  
  // Convert outcomes to findings
  const findings: Finding[] = legacy.outcomes.map((outcome, idx) => ({
    finding_id: `${legacy.id}_finding_${idx + 1}`,
    category: classifyFinding(outcome),
    description: outcome,
    supporting_artifacts: extractRelevantArtifacts(outcome, artifacts),
    confidence: inferConfidence(outcome),
    impact: inferImpact(outcome)
  }));
  
  // Generate lessons from workflow and outcomes
  const lessons: InvestigationLesson[] = generateLessons(legacy);
  
  // Extract keywords
  const keywords = extractKeywords(legacy);
  
  // Classify incident type
  const incidentType = classifyIncidentType(legacy.id, legacy.scenario);
  
  // Infer industry
  const industry = inferIndustry(legacy.scenario);
  
  return {
    case_id: legacy.id,
    title: generateTitle(legacy.id),
    summary: legacy.scenario.substring(0, 200),
    scenario: legacy.scenario,
    incident_date: 'N/A', // Would need real date
    investigation_date: 'N/A',
    industry,
    incident_type: incidentType,
    severity: inferSeverity(legacy.scenario, legacy.outcomes),
    timeline,
    artifacts,
    tools_used: toolsUsed,
    findings,
    conclusions: legacy.outcomes.slice(0, 3), // Top 3 outcomes as conclusions
    root_cause: extractRootCause(legacy.outcomes),
    lessons_learned: lessons,
    recommendations: generateRecommendations(legacy),
    legal_notes: legacy.legalNotes,
    keywords,
    difficulty: inferDifficulty(legacy.workflow.length, artifacts.length),
    references: []
  };
}

/**
 * HELPER FUNCTIONS
 */

function inferEvidenceValue(type: string): 'high' | 'medium' | 'low' {
  const highValue = ['memory dump', 'pcap', 'disk image', 'registry hive', 'edr alerts'];
  const mediumValue = ['logs', 'email', 'browser history', 'usb history'];
  
  const normalized = type.toLowerCase();
  if (highValue.some(v => normalized.includes(v))) return 'high';
  if (mediumValue.some(v => normalized.includes(v))) return 'medium';
  return 'low';
}

function inferSignificance(action: string): 'critical' | 'major' | 'minor' {
  const critical = ['isolate', 'preserve', 'image', 'memory dump', 'initial compromise'];
  const major = ['analyze', 'identify', 'reconstruct', 'lateral movement'];
  
  const normalized = action.toLowerCase();
  if (critical.some(k => normalized.includes(k))) return 'critical';
  if (major.some(k => normalized.includes(k))) return 'major';
  return 'minor';
}

function extractToolPurpose(tool: string, workflow: LegacyCase['workflow']): string {
  const step = workflow.find(w => w.tool === tool);
  return step ? step.action.substring(0, 100) : 'Analysis';
}

function extractToolOutput(tool: string, workflow: LegacyCase['workflow']): string {
  const step = workflow.find(w => w.tool === tool);
  return step ? step.expectedResult.substring(0, 150) : 'N/A';
}

function classifyFinding(outcome: string): Finding['category'] {
  const normalized = outcome.toLowerCase();
  
  if (normalized.includes('vector') || normalized.includes('entry') || normalized.includes('phishing')) {
    return 'attack_vector';
  }
  if (normalized.includes('lateral') || normalized.includes('movement') || normalized.includes('propagat')) {
    return 'lateral_movement';
  }
  if (normalized.includes('persistence') || normalized.includes('scheduled') || normalized.includes('startup')) {
    return 'persistence';
  }
  if (normalized.includes('exfiltrat') || normalized.includes('steal') || normalized.includes('transfer')) {
    return 'exfiltration';
  }
  if (normalized.includes('encrypt') || normalized.includes('ransom') || normalized.includes('damage')) {
    return 'impact';
  }
  if (normalized.includes('apt') || normalized.includes('actor') || normalized.includes('group')) {
    return 'attribution';
  }
  
  return 'evidence';
}

function extractRelevantArtifacts(outcome: string, artifacts: ForensicArtifact[]): string[] {
  // Simple heuristic: match artifact types mentioned in outcome
  return artifacts
    .filter(art => outcome.toLowerCase().includes(art.type.toLowerCase()))
    .map(art => art.artifact_id)
    .slice(0, 3);
}

function inferConfidence(outcome: string): 'confirmed' | 'probable' | 'possible' {
  const normalized = outcome.toLowerCase();
  
  if (normalized.includes('confirmed') || normalized.includes('identified') || 
      normalized.includes('proved') || normalized.includes('established')) {
    return 'confirmed';
  }
  if (normalized.includes('likely') || normalized.includes('probable') || 
      normalized.includes('appears') || normalized.includes('indicates')) {
    return 'probable';
  }
  
  return 'possible';
}

function inferImpact(outcome: string): 'critical' | 'high' | 'medium' | 'low' {
  const normalized = outcome.toLowerCase();
  
  if (normalized.includes('encrypt') || normalized.includes('breach') || 
      normalized.includes('exfiltrat') || normalized.includes('compromise')) {
    return 'critical';
  }
  if (normalized.includes('access') || normalized.includes('credential') || 
      normalized.includes('malware')) {
    return 'high';
  }
  if (normalized.includes('attempt') || normalized.includes('suspicious')) {
    return 'medium';
  }
  
  return 'low';
}

function generateLessons(legacy: LegacyCase): InvestigationLesson[] {
  const lessons: InvestigationLesson[] = [];
  
  // Technical lessons
  if (legacy.workflow.some(w => w.tool.includes('FTK') || w.tool.includes('Volatility'))) {
    lessons.push({
      lesson_id: `${legacy.id}_lesson_1`,
      category: 'technical',
      description: 'Memory and disk forensics critical for attack reconstruction',
      best_practice: 'Always preserve volatile memory before shutdown'
    });
  }
  
  // Procedural lessons
  if (legacy.workflow.some(w => w.action.toLowerCase().includes('hash') || w.action.toLowerCase().includes('chain'))) {
    lessons.push({
      lesson_id: `${legacy.id}_lesson_2`,
      category: 'procedural',
      description: 'Evidence integrity maintained through proper chain of custody',
      best_practice: 'Document hash values and maintain detailed custody logs'
    });
  }
  
  // Legal lessons
  if (legacy.legalNotes.length > 0) {
    lessons.push({
      lesson_id: `${legacy.id}_lesson_3`,
      category: 'legal',
      description: 'Compliance requirements impact investigation scope',
      best_practice: 'Coordinate with legal team before evidence collection'
    });
  }
  
  return lessons;
}

function extractKeywords(legacy: LegacyCase): string[] {
  const keywords = new Set<string>();
  
  // From ID
  legacy.id.split('-').forEach(k => keywords.add(k));
  
  // From artifact types
  legacy.artifacts.forEach(art => {
    art.type.split(' ').forEach(word => {
      if (word.length > 3) keywords.add(word.toLowerCase());
    });
  });
  
  // From tools
  legacy.workflow.forEach(w => keywords.add(w.tool.toLowerCase()));
  
  // From scenario
  const scenarioWords = legacy.scenario.toLowerCase().match(/\b\w{4,}\b/g) || [];
  scenarioWords.slice(0, 10).forEach(w => keywords.add(w));
  
  return Array.from(keywords).slice(0, 20);
}

function classifyIncidentType(id: string, scenario: string): string {
  const normalized = (id + ' ' + scenario).toLowerCase();
  
  if (normalized.includes('ransom')) return 'Ransomware';
  if (normalized.includes('insider')) return 'Insider Threat';
  if (normalized.includes('apt') || normalized.includes('advanced')) return 'APT';
  if (normalized.includes('breach') || normalized.includes('exfiltrat')) return 'Data Breach';
  if (normalized.includes('malware')) return 'Malware';
  if (normalized.includes('ddos')) return 'DDoS';
  if (normalized.includes('mobile')) return 'Mobile';
  
  return 'Incident';
}

function inferIndustry(scenario: string): string {
  const normalized = scenario.toLowerCase();
  
  if (normalized.includes('healthcare') || normalized.includes('hospital') || normalized.includes('patient')) {
    return 'Healthcare';
  }
  if (normalized.includes('financial') || normalized.includes('bank')) {
    return 'Finance';
  }
  if (normalized.includes('retail') || normalized.includes('customer')) {
    return 'Retail';
  }
  if (normalized.includes('government')) {
    return 'Government';
  }
  
  return 'Technology';
}

function inferSeverity(scenario: string, outcomes: string[]): 'critical' | 'high' | 'medium' | 'low' {
  const text = (scenario + ' ' + outcomes.join(' ')).toLowerCase();
  
  if (text.includes('encrypt') || text.includes('breach') || text.includes('exfiltrat')) {
    return 'critical';
  }
  if (text.includes('compromise') || text.includes('access')) {
    return 'high';
  }
  
  return 'medium';
}

function extractRootCause(outcomes: string[]): string {
  // Try to find outcome that describes the root cause
  const rootCauseIndicators = ['vector', 'entry', 'initial', 'phishing', 'vulnerability'];
  
  const rootCause = outcomes.find(outcome => 
    rootCauseIndicators.some(indicator => outcome.toLowerCase().includes(indicator))
  );
  
  return rootCause || outcomes[0] || 'Under investigation';
}

function generateRecommendations(legacy: LegacyCase): string[] {
  const recommendations: string[] = [];
  
  if (legacy.scenario.toLowerCase().includes('phishing')) {
    recommendations.push('Implement email security training and phishing simulations');
    recommendations.push('Deploy email gateway with attachment sandboxing');
  }
  
  if (legacy.outcomes.some(o => o.toLowerCase().includes('lateral'))) {
    recommendations.push('Implement network segmentation and zero trust architecture');
    recommendations.push('Enable MFA for all privileged accounts');
  }
  
  if (legacy.outcomes.some(o => o.toLowerCase().includes('encrypt'))) {
    recommendations.push('Maintain offline backups with regular restore testing');
    recommendations.push('Deploy EDR with ransomware detection capabilities');
  }
  
  return recommendations.length > 0 ? recommendations : ['Conduct post-incident review', 'Update incident response playbook'];
}

function inferDifficulty(workflowSteps: number, artifactCount: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const complexity = workflowSteps + artifactCount;
  
  if (complexity <= 8) return 'beginner';
  if (complexity <= 15) return 'intermediate';
  if (complexity <= 20) return 'advanced';
  return 'expert';
}

function generateTitle(id: string): string {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
