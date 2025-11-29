# 🤖 AI-Powered Forensic Chatbot

## Overview

The **Forensic AI Assistant** is an intelligent chatbot that provides expert guidance on digital forensics topics. It combines Google Gemini AI with a local knowledge base (RAG-lite) to deliver accurate, contextual answers strictly scoped to digital forensics.

---

## 🎯 Key Features

### 1. **Strict Digital Forensics Scope**
- **Guardrails**: Politely refuses non-forensic queries
- **Domain Expertise**: Only responds to questions about:
  - Forensic tools (Autopsy, Volatility, Wireshark, FTK, EnCase, etc.)
  - Investigation methodologies and workflows
  - Evidence handling and chain of custody
  - File systems, memory analysis, network forensics
  - Case studies and real-world scenarios
  - Forensic terminology and concepts

### 2. **RAG-lite Retrieval System**
- **Local JSON Knowledge Base**: 
  - `tools.json` - 15+ forensic tools with detailed usage
  - `cases.json` - Real-world investigation scenarios
  - `topics.json` - Educational content on forensic concepts
  - `glossary.json` - Technical terminology definitions
  
- **Efficient Indexing**:
  - **Trie data structure** for fast autocomplete and keyword matching
  - **LRUCache** for response caching (100 query capacity)
  - **Keyword-based retrieval** for relevant context extraction

### 3. **AI-Powered Responses**
- **Google Gemini API Integration** (`gemini-pro` model)
- **Token-wise Streaming**: Real-time response generation with visual streaming indicator
- **Context-Aware**: Uses retrieved knowledge base content to ground AI responses
- **Source Citations**: Every response includes references to internal KB sections

### 4. **Smart Query Processing**
```typescript
Query Flow:
1. Scope Validation → Is query forensic-related?
2. Knowledge Retrieval → Extract relevant context from JSON modules
3. Prompt Construction → Build system prompt with KB context
4. AI Generation → Stream response token-by-token
5. Source Attribution → Cite tools, cases, topics referenced
```

### 5. **Professional UI/UX**
- **Glassmorphism Design**: Semi-transparent backdrop with blur effects
- **Streaming Animation**: Visual cursor during AI response generation
- **Source Display**: Inline citations with shield icon
- **Contextual Suggestions**: Smart follow-up questions based on query context
- **3D Model Integration**: View 3D forensic tool models when available

---

## 🔧 Technical Architecture

### API Configuration

**Environment Setup**:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Gemini API key to `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Get your API key from: https://ai.google.dev/

**Code Implementation**:
```typescript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

**Security Note**: The API key is stored in `.env` which is excluded from version control via `.gitignore`.

### Message Interface
```typescript
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'structured';
  data?: unknown;
  isStreaming?: boolean;      // Real-time generation indicator
  sources?: string[];         // KB citations
}
```

### Knowledge Service Integration
```typescript
// Retrieve relevant context from local JSON
const knowledgeResult = forensicKnowledge.processQuery(query);
const context = buildContextFromKnowledge(knowledgeResult);
const sources = extractSources(knowledgeResult);

// Build prompt with forensic scope and KB context
const systemPrompt = buildForensicSystemPrompt(context);
const userPrompt = `User Query: ${query}\n\nProvide answer based on forensic KB...`;

// Stream AI response
const result = await model.generateContentStream([systemPrompt, userPrompt]);
for await (const chunk of result.stream) {
  fullText += chunk.text();
  // Update message state in real-time
}
```

---

## 📊 Knowledge Base Structure

### Tools (15+ entries)
```json
{
  "name": "Autopsy",
  "category": "Suite/Platform",
  "useCase": "Comprehensive digital forensics platform...",
  "steps": ["Install...", "Create case...", "Add data source..."],
  "prosCons": { "pros": [...], "cons": [...] },
  "example": { "scenario": "...", "command": "...", "output": "..." },
  "asset3D": "autopsy-forensic-suite"
}
```

### Cases (10+ scenarios)
```json
{
  "id": "ransomware-breach",
  "scenario": "Healthcare provider hit by ransomware...",
  "artifacts": [{ "type": "Memory Dump", "description": "...", "location": "..." }],
  "workflow": [{ "step": 1, "action": "...", "tool": "Volatility", "expectedResult": "..." }],
  "outcomes": ["Identified malware family...", "Recovered encryption keys..."]
}
```

### Topics (20+ educational modules)
```json
{
  "id": "memory-forensics",
  "title": "Memory Forensics",
  "summary": "Analysis of RAM to extract artifacts...",
  "difficulty": "intermediate",
  "keywords": ["memory", "RAM", "volatility", "process injection"],
  "sections": [{ "heading": "What is Memory Forensics?", "content": "..." }],
  "assets3D": ["memory-chip-3d"]
}
```

### Glossary (50+ terms)
```json
{
  "term": "Chain of Custody",
  "definition": "Documentation trail showing seizure, custody...",
  "related": ["Evidence Handling", "Legal Admissibility"],
  "category": "Legal"
}
```

---

## 🚀 Usage Examples

### Example 1: Tool Query
**User**: "What is Autopsy?"  
**Bot Response**:
```
**Autopsy** is a comprehensive digital forensics platform for analyzing hard drives 
and mobile devices. It's ideal for case management and automated analysis.

**Key Features:**
• Free and open-source
• User-friendly GUI with timeline analysis
• Extensive plugin ecosystem
• Supports multiple evidence formats (E01, DD, AFF)

**Use Cases:**
• Disk image analysis
• Keyword searching across large datasets
• Timeline reconstruction of user activity
• Hash matching against known file databases

**Sources:**
• Tool: Autopsy
```

### Example 2: Case Study
**User**: "Show me a ransomware case"  
**Bot Response**:
```
**Case Study: ransomware-breach**

A healthcare provider was hit by ransomware, encrypting patient records. The investigation 
involved memory analysis to identify the malware family and network forensics to trace 
the attack vector.

**Key Outcomes:**
• Identified malware family (Ryuk ransomware)
• Recovered encryption keys from memory artifacts
• Traced initial access via phishing email
• Implemented security recommendations to prevent future attacks

**Tools Used:**
• Volatility for memory analysis
• Wireshark for network traffic examination
• Autopsy for disk forensics

**Sources:**
• Case Study: ransomware-breach
```

### Example 3: Conceptual Query
**User**: "Explain memory forensics"  
**Bot Response**:
```
**Memory Forensics** is the analysis of volatile memory (RAM) to extract digital artifacts 
that exist only during system runtime.

**Why Memory Forensics?**
• Captures running processes, network connections, and decrypted data
• Reveals malware that operates only in memory (fileless attacks)
• Recovers encryption keys and passwords from RAM

**Key Techniques:**
1. **Memory Acquisition**: Creating a snapshot of physical RAM
2. **Process Analysis**: Identifying running processes and their memory spaces
3. **Network Analysis**: Extracting active connections and sockets
4. **Malware Detection**: Scanning for code injection and rootkits

**Primary Tool**: Volatility Framework

**Sources:**
• Topic: Memory Forensics
• Tool: Volatility
```

---

## 🛡️ Scope Guardrails

### Valid Queries (Accepted)
✅ "What is Autopsy?"  
✅ "Show me a case study"  
✅ "Explain memory forensics"  
✅ "How to recover deleted files?"  
✅ "Define chain of custody"  
✅ "Compare Volatility and Rekall"  
✅ "What is the Master File Table?"  

### Invalid Queries (Rejected)
❌ "What's the weather today?"  
❌ "Help me with Python programming"  
❌ "Recommend a good movie"  
❌ "How to cook pasta?"  

**Refusal Response**:
```
I apologize, but I can only assist with digital forensics topics. I specialize in 
forensic tools, investigation methodologies, evidence handling, analysis techniques, 
and related concepts. Please ask a question related to digital forensics.
```

---

## 🎨 UI Components

### Header
- **Gradient Avatar**: Cyan-to-purple gradient with Bot icon
- **Title**: "Forensic AI Assistant" with "BETA" badge
- **Status**: "AI-Powered • Verified KB" with pulsing green indicator

### Messages
- **User Messages**: Cyan background, right-aligned
- **Bot Messages**: Dark glassmorphic background, left-aligned
- **Streaming Indicator**: Animated cyan cursor during generation
- **Source Citations**: Shield icon with inline references

### Suggestions
- **Contextual**: Dynamically updated based on conversation
- **Quick Actions**: One-click buttons for common queries
- **Examples**: "What is Autopsy?", "Show me a case study", "Explain memory forensics"

---

## 📦 Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",  // Gemini API client
  "framer-motion": "^11.x",             // Animations
  "lucide-react": "^0.x",               // Icons
  "react": "^18.x"                      // Core framework
}
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI responses | Yes |

**Setup Instructions**:
1. Create `.env` file in project root
2. Add: `VITE_GEMINI_API_KEY=your_api_key`
3. Restart dev server if running
4. Never commit `.env` to version control

---

## 🔍 Search & Retrieval

### Intent Detection
```typescript
const isToolQuery = (query: string) => 
  ['tool', 'software', 'use', 'compare'].some(kw => query.includes(kw));

const isCaseQuery = (query: string) => 
  ['case study', 'investigation', 'scenario', 'breach'].some(kw => query.includes(kw));

const isTopicQuery = (query: string) => 
  ['explain', 'what is', 'how does', 'learn'].some(kw => query.includes(kw));

const isGlossaryQuery = (query: string) => 
  ['define', 'definition', 'what does', 'mean'].some(kw => query.includes(kw));
```

### Context Building
```typescript
// Extract relevant context from KB query result
const buildContextFromKnowledge = (result: QueryResult): string => {
  switch (result.type) {
    case 'tool': return `Tool: ${tool.name}\nUse Case: ${tool.useCase}\n...`;
    case 'case': return `Case: ${case.id}\nScenario: ${case.scenario}\n...`;
    case 'topic': return `Topic: ${topic.title}\nSummary: ${topic.summary}\n...`;
    case 'glossary': return `Term: ${term.term}\nDefinition: ${term.definition}\n...`;
  }
};
```

---

## 🧪 Testing

All 129 tests pass, including chatbot-specific tests:
- ✅ Renders toggle button
- ✅ Opens chat window on click
- ✅ Displays contextual suggestions
- ✅ Sends messages and receives responses
- ✅ Handles tool queries with knowledge service
- ✅ Closes chat window properly

Run tests: `npm test`

---

## 🚧 Future Enhancements

1. **Multi-turn Conversations**: Maintain conversation history context
2. **Advanced RAG**: Vector embeddings for semantic search
3. **Export Conversations**: Save chat history as PDF/Markdown
4. **Voice Input**: Speech-to-text for hands-free queries
5. **Multilingual Support**: Translate forensic content to other languages
6. **Custom Knowledge Bases**: Allow users to upload custom JSON modules
7. **Rate Limiting**: Implement API usage throttling for production

---

## 📄 License

This chatbot uses the Google Gemini API. Ensure compliance with [Google's Terms of Service](https://ai.google.dev/terms).

---

## 🤝 Contributing

To add new knowledge base entries:

1. Edit JSON files in `src/data/`:
   - `tools.json` - Add forensic tools
   - `cases.json` - Add investigation scenarios
   - `topics.json` - Add educational content
   - `glossary.json` - Add terminology

2. Rebuild Trie indices automatically on app restart

3. Test with chatbot to ensure proper retrieval

---

## 📞 Support

For issues or questions:
- Open an issue in the repository
- Ensure queries are strictly forensic-related
- Check console logs for API errors

**Happy Investigating! 🔍**
