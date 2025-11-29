import toolsData from '../data/tools.json';
import casesData from '../data/cases.json';
import topicsData from '../data/topics.json';
import glossaryData from '../data/glossary.json';
import { Trie } from '../utils/Trie';
import { LRUCache } from '../utils/LRUCache';

export interface Tool {
  name: string;
  category: string;
  useCase: string;
  steps?: string[];
  prosCons?: {
    pros: string[];
    cons: string[];
  };
  example?: {
    scenario: string;
    command: string;
    output: string;
    interpretation: string;
  };
  asset3D?: string | null;
}

export interface Case {
  id: string;
  scenario: string;
  artifacts: Array<{ type: string; description: string; location: string }>;
  workflow: Array<{ step: number; action: string; tool: string; expectedResult: string }>;
  outcomes: string[];
  legalNotes: string[];
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  prerequisites: string[];
  difficulty: string;
  keywords: string[];
  sections: Array<{ heading: string; content: string }>;
  assets3D?: string[] | null;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  related: string[];
  category: string;
}

export interface QueryResult {
  type: 'tool' | 'case' | 'topic' | 'glossary' | 'general' | 'suggestions';
  data: unknown;
  confidence: number;
  suggestions?: string[];
}

export class ForensicKnowledgeService {
  private toolsTrie: Trie;
  private glossaryTrie: Trie;
  private topicTrie: Trie;
  private responseCache: LRUCache<string, string>;
  
  private tools: Tool[];
  private cases: Case[];
  private topics: Topic[];
  private glossary: GlossaryEntry[];

  constructor() {
    this.tools = toolsData as Tool[];
    this.cases = casesData as Case[];
    this.topics = topicsData as Topic[];
    this.glossary = glossaryData as GlossaryEntry[];
    
    // Initialize Trie for autocomplete
    this.toolsTrie = new Trie();
    this.glossaryTrie = new Trie();
    this.topicTrie = new Trie();
    
    // Populate tries
    this.tools.forEach(tool => this.toolsTrie.insert(tool.name.toLowerCase()));
    this.glossary.forEach(entry => this.glossaryTrie.insert(entry.term.toLowerCase()));
    this.topics.forEach(topic => {
      this.topicTrie.insert(topic.title.toLowerCase());
      topic.keywords.forEach(keyword => this.topicTrie.insert(keyword.toLowerCase()));
    });
    
    // Initialize cache (capacity: 100 queries)
    this.responseCache = new LRUCache<string, string>(100);
  }

  /**
   * Main query processing method
   */
  public processQuery(query: string): QueryResult {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check cache first
    const cached = this.responseCache.get(normalizedQuery);
    if (cached) {
      return JSON.parse(cached);
    }

    let result: QueryResult;

    // Intent detection
    if (this.isToolQuery(normalizedQuery)) {
      result = this.handleToolQuery(normalizedQuery);
    } else if (this.isCaseQuery(normalizedQuery)) {
      result = this.handleCaseQuery(normalizedQuery);
    } else if (this.isTopicQuery(normalizedQuery)) {
      result = this.handleTopicQuery(normalizedQuery);
    } else if (this.isGlossaryQuery(normalizedQuery)) {
      result = this.handleGlossaryQuery(normalizedQuery);
    } else if (this.isGreeting(normalizedQuery)) {
      result = this.handleGreeting();
    } else if (this.isHelpQuery(normalizedQuery)) {
      result = this.handleHelpQuery();
    } else {
      result = this.handleGeneralQuery(normalizedQuery);
    }

    // Cache the result
    this.responseCache.put(normalizedQuery, JSON.stringify(result));
    
    return result;
  }

  /**
   * Get autocomplete suggestions for a partial query
   */
  public getAutocompleteSuggestions(partial: string, limit: number = 5): string[] {
    const normalized = partial.toLowerCase();
    const toolSuggestions = this.toolsTrie.autocomplete(normalized, limit);
    const topicSuggestions = this.topicTrie.autocomplete(normalized, Math.max(0, limit - toolSuggestions.length));
    const glossarySuggestions = this.glossaryTrie.autocomplete(normalized, Math.max(0, limit - toolSuggestions.length - topicSuggestions.length));
    
    return [...toolSuggestions, ...topicSuggestions, ...glossarySuggestions].slice(0, limit);
  }

  /**
   * Get suggested follow-up questions based on context
   */
  public getContextualSuggestions(lastQuery: string): string[] {
    const normalized = lastQuery.toLowerCase();
    
    if (normalized.includes('autopsy')) {
      return [
        'How do I create a case in Autopsy?',
        'What ingest modules should I use?',
        'Compare Autopsy with FTK Imager'
      ];
    }
    
    if (normalized.includes('memory') || normalized.includes('ram')) {
      return [
        'How do I analyze memory dumps?',
        'What is Volatility?',
        'Explain process injection'
      ];
    }
    
    if (normalized.includes('ntfs') || normalized.includes('file system')) {
      return [
        'What is the Master File Table?',
        'How to recover deleted files?',
        'Explain NTFS timestamps'
      ];
    }
    
    if (normalized.includes('malware')) {
      return [
        'What is static analysis?',
        'How to detect rootkits?',
        'Explain process injection'
      ];
    }
    
    return [
      'Tell me about forensic tools',
      'Explain chain of custody',
      'What is memory forensics?',
      'Show me a case study'
    ];
  }

  // Intent detection methods
  private isToolQuery(query: string): boolean {
    const toolKeywords = ['tool', 'software', 'program', 'use', 'how to use', 'compare'];
    return toolKeywords.some(keyword => query.includes(keyword)) || 
           this.tools.some(tool => query.includes(tool.name.toLowerCase()));
  }

  private isCaseQuery(query: string): boolean {
    const caseKeywords = ['case study', 'case', 'example', 'investigation', 'scenario', 'breach'];
    return caseKeywords.some(keyword => query.includes(keyword));
  }

  private isTopicQuery(query: string): boolean {
    const topicKeywords = ['explain', 'what is', 'how does', 'learn', 'teach', 'understand', 'concept'];
    return topicKeywords.some(keyword => query.includes(keyword)) ||
           this.topics.some(topic => query.includes(topic.title.toLowerCase()));
  }

  private isGlossaryQuery(query: string): boolean {
    const glossaryKeywords = ['define', 'definition', 'what does', 'mean', 'term'];
    return glossaryKeywords.some(keyword => query.includes(keyword)) ||
           this.glossary.some(entry => query.includes(entry.term.toLowerCase()));
  }

  private isGreeting(query: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => query.includes(greeting));
  }

  private isHelpQuery(query: string): boolean {
    const helpKeywords = ['help', 'assist', 'support', 'guide', 'can you', 'how can'];
    return helpKeywords.some(keyword => query.includes(keyword));
  }

  // Query handlers
  private handleToolQuery(query: string): QueryResult {
    // Find mentioned tool
    const mentionedTool = this.tools.find(tool => 
      query.includes(tool.name.toLowerCase())
    );

    if (mentionedTool) {
      return {
        type: 'tool',
        data: mentionedTool,
        confidence: 0.9,
        suggestions: [
          `Show me an example of ${mentionedTool.name}`,
          'What are the pros and cons?',
          'Compare with other tools'
        ]
      };
    }

    // Check if asking for comparison
    if (query.includes('compare') || query.includes('vs') || query.includes('versus')) {
      return {
        type: 'tool',
        data: {
          message: 'Tool comparison',
          tools: this.tools.slice(0, 3) // Return first 3 tools as examples
        },
        confidence: 0.7,
        suggestions: ['Tell me about Autopsy', 'What is FTK Imager?', 'Explain Volatility']
      };
    }

    // General tool inquiry
    return {
      type: 'tool',
      data: {
        message: 'Here are some popular forensic tools:',
        tools: this.tools.slice(0, 5).map(t => ({ name: t.name, category: t.category, useCase: t.useCase }))
      },
      confidence: 0.6,
      suggestions: ['Tell me about Autopsy', 'What is Wireshark?', 'Show me acquisition tools']
    };
  }

  private handleCaseQuery(query: string): QueryResult {
    // Find specific case
    const mentionedCase = this.cases.find(c => 
      query.includes(c.id) || query.includes(c.scenario.toLowerCase().substring(0, 30))
    );

    if (mentionedCase) {
      return {
        type: 'case',
        data: mentionedCase,
        confidence: 0.9,
        suggestions: [
          'Show me another case study',
          'What tools were used?',
          'Explain the investigation workflow'
        ]
      };
    }

    // Check for case type
    if (query.includes('ransomware')) {
      const ransomwareCase = this.cases.find(c => c.scenario.toLowerCase().includes('ransomware'));
      if (ransomwareCase) {
        return { type: 'case', data: ransomwareCase, confidence: 0.8, suggestions: ['Show me another case'] };
      }
    }

    // General case inquiry
    return {
      type: 'case',
      data: {
        message: 'Here are some forensic case studies:',
        cases: this.cases.map(c => ({ id: c.id, scenario: c.scenario.substring(0, 100) + '...' }))
      },
      confidence: 0.7,
      suggestions: ['Ransomware investigation', 'Insider threat case', 'Mobile forensics example']
    };
  }

  private handleTopicQuery(query: string): QueryResult {
    // Find specific topic
    const mentionedTopic = this.topics.find(topic => 
      query.includes(topic.title.toLowerCase()) ||
      topic.keywords.some(keyword => query.includes(keyword.toLowerCase()))
    );

    if (mentionedTopic) {
      return {
        type: 'topic',
        data: mentionedTopic,
        confidence: 0.9,
        suggestions: [
          'Show me related topics',
          'Give me an example',
          'What tools are used for this?'
        ]
      };
    }

    // General topic inquiry
    return {
      type: 'topic',
      data: {
        message: 'Here are some forensic topics you can learn about:',
        topics: this.topics.slice(0, 5).map(t => ({ title: t.title, summary: t.summary, difficulty: t.difficulty }))
      },
      confidence: 0.6,
      suggestions: ['Explain memory forensics', 'What is NTFS?', 'Tell me about Windows forensics']
    };
  }

  private handleGlossaryQuery(query: string): QueryResult {
    // Find specific term
    const mentionedTerm = this.glossary.find(entry => 
      query.includes(entry.term.toLowerCase())
    );

    if (mentionedTerm) {
      return {
        type: 'glossary',
        data: mentionedTerm,
        confidence: 0.95,
        suggestions: mentionedTerm.related.map(term => `What is ${term}?`)
      };
    }

    // General glossary inquiry
    return {
      type: 'glossary',
      data: {
        message: 'Browse forensic terminology:',
        terms: this.glossary.slice(0, 10).map(e => ({ term: e.term, category: e.category }))
      },
      confidence: 0.5,
      suggestions: ['Define chain of custody', 'What is a hash function?', 'Explain MFT']
    };
  }

  private handleGreeting(): QueryResult {
    return {
      type: 'general',
      data: {
        message: "Hello! I'm your Digital Forensics Assistant. I can help you with:\n• Forensic tools and software\n• Investigation case studies\n• Forensic concepts and techniques\n• Technical terminology\n\nWhat would you like to learn about?"
      },
      confidence: 1.0,
      suggestions: [
        'Tell me about forensic tools',
        'Show me a case study',
        'Explain memory forensics',
        'What is NTFS?'
      ]
    };
  }

  private handleHelpQuery(): QueryResult {
    return {
      type: 'general',
      data: {
        message: "I can assist you with:\n\n**Tools**: Ask about specific forensic software (Autopsy, Wireshark, Volatility, etc.)\n**Case Studies**: Learn from real investigation scenarios\n**Concepts**: Understand forensic techniques and methodologies\n**Glossary**: Get definitions of technical terms\n\nTry asking questions like:\n• 'What is Autopsy?'\n• 'Show me a ransomware case'\n• 'Explain memory forensics'\n• 'Define chain of custody'"
      },
      confidence: 1.0,
      suggestions: [
        'Tell me about Volatility',
        'Show me a case study',
        'What is the MFT?',
        'Explain file carving'
      ]
    };
  }

  private handleGeneralQuery(query: string): QueryResult {
    // Try fuzzy matching with Trie
    const toolMatches = this.toolsTrie.autocomplete(query.split(' ')[0], 3);
    const topicMatches = this.topicTrie.autocomplete(query.split(' ')[0], 3);
    const glossaryMatches = this.glossaryTrie.autocomplete(query.split(' ')[0], 3);

    if (toolMatches.length > 0 || topicMatches.length > 0 || glossaryMatches.length > 0) {
      return {
        type: 'suggestions',
        data: {
          message: "I'm not sure I understood that. Did you mean one of these?",
          suggestions: [...toolMatches, ...topicMatches, ...glossaryMatches].slice(0, 5)
        },
        confidence: 0.3,
        suggestions: [
          'Show me all tools',
          'List case studies',
          'Browse topics',
          'Help'
        ]
      };
    }

    return {
      type: 'general',
      data: {
        message: "I'm still learning! Try asking about:\n• Specific forensic tools (Autopsy, Wireshark, Volatility)\n• Investigation case studies\n• Forensic concepts (memory forensics, file systems)\n• Technical terms (MFT, hash function, chain of custody)"
      },
      confidence: 0.2,
      suggestions: [
        'What is Autopsy?',
        'Show me a case study',
        'Explain NTFS',
        'Define rootkit'
      ]
    };
  }

  /**
   * Get 3D model ID for a given entity name (tool or topic)
   */
  public get3DModelForEntity(name: string): string | null {
    // Check tools
    const tool = this.tools.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (tool && tool.asset3D) {
      return tool.asset3D;
    }

    // Check topics
    const topic = this.topics.find(t => t.title.toLowerCase() === name.toLowerCase() || t.id === name.toLowerCase());
    if (topic && topic.assets3D && topic.assets3D.length > 0) {
      return topic.assets3D[0];
    }

    return null;
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return this.responseCache.getStats();
  }
}

// Export singleton instance
export const forensicKnowledge = new ForensicKnowledgeService();
