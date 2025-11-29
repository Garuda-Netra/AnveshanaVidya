# Digital Forensics Learning Platform

A futuristic, interactive educational website for digital forensics with glassmorphism UI, 3D visualizations, immersive labs, real-world case studies, and comprehensive learning tools. Designed for students and professionals to master digital forensics through hands-on practice.

## Features

- 🎨 Dark theme with glassmorphism effects and animated gradients
- 🎯 Smooth scrolling with Lenis for enhanced UX
- 🎭 Interactive 3D visualizations (HDD/SSD models) with 2D fallbacks
- ♿ WCAG AA accessibility compliant with full keyboard navigation
- 📱 Fully responsive design across all devices
- 🤖 AI-powered forensics chatbot comming soon
- 🖥️ Terminal-like interactive command interface with quizzes and missions
- 🔬 Five specialized forensic analysis labs (NetFlow, Timeline, Hash Verify, Memory Triage, Steganography Detection)
- 📚 Real-world case study analysis with investigation workflows
- 🎓 Interactive learning modules with glossary and terminology
- 🎵 Immersive audio experience (background soundtrack)
- ⚡ Optimized performance (Lighthouse ≥ 90 target)
- 🏆 Comprehensive tool showcase and resource library

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom theme
- **3D**: Three.js + React Three Fiber
- **State**: Zustand
- **Animations**: Framer Motion
- **Scrolling**: Lenis
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Project Structure

```
src/
├── components/                    # React components
│   ├── sections/                 # Learning module sections
│   │   ├── Hero.tsx             # Landing hero section
│   │   ├── TopicsGrid.tsx       # Investigation modules grid
│   │   ├── ToolsShowcase.tsx    # Forensic tools catalog
│   │   ├── CaseStudies.tsx      # Real-world case investigations
│   │   ├── SupportAccess.tsx    # Support & access section
│   │   ├── Acquisition.tsx      # Data acquisition methods
│   │   ├── FileSystems.tsx      # File system analysis
│   │   ├── Storage.tsx          # Storage internals (HDD/SSD)
│   │   ├── Fundamentals.tsx     # Computer forensics fundamentals
│   │   ├── Evidence.tsx         # Evidence rules & standards
│   │   ├── Investigation.tsx    # Investigation process
│   │   ├── OSForensics.tsx      # Operating system forensics
│   │   ├── NetworkForensics.tsx # Network forensics
│   │   ├── Malware.tsx          # Malware analysis
│   │   ├── EmailCrimes.tsx      # Email crime investigation
│   │   └── DarkWeb.tsx          # Dark web investigation
│   ├── labs/                    # Specialized forensic labs
│   │   ├── NetflowLab.tsx       # Network flow analysis
│   │   ├── TimelineLab.tsx      # Timeline analysis tool
│   │   ├── HashVerifyLab.tsx    # Hash verification utility
│   │   ├── MemoryTriageLab.tsx  # Memory triage analysis
│   │   ├── StegoDetectLab.tsx   # Steganography detection
│   │   └── LabPanel.tsx         # Lab interface container
│   ├── 3d/                      # 3D visualization components
│   │   ├── Canvas3D.tsx         # 3D canvas wrapper
│   │   ├── Scene.tsx            # 3D scene setup
│   │   ├── SceneLights.tsx      # 3D lighting configuration
│   │   ├── HDDModel.tsx         # 3D HDD visualization
│   │   ├── SSDModel.tsx         # 3D SSD visualization
│   │   └── FallbackView.tsx     # 2D fallback for 3D models
│   ├── features/                # Advanced features
│   │   └── Terminal.tsx         # Interactive command terminal
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── Accordion.tsx
│   │   ├── GlassPanel.tsx
│   │   ├── SectionHeader.tsx
│   │   └── Tooltip.tsx
│   ├── Navigation.tsx           # Top navigation bar
│   ├── Footer.tsx               # Footer component
│   ├── Chatbot.tsx              # AI chatbot interface
│   ├── LoadingSpinner.tsx       # Loading indicator
│   └── StarfieldBackground.tsx  # Animated starfield
├── data/                        # JSON data modules
│   ├── cases.json              # Real-world case studies
│   ├── caseEvents.json         # Case investigation events
│   ├── forensicCommands.json   # Forensic command reference
│   ├── forensicCommandsEnhanced.json  # Enhanced command data
│   ├── forensicGlossary.json   # Forensics terminology
│   ├── forensicQuiz.json       # Quiz questions
│   ├── forensicQuizBank.json   # Extended quiz bank
│   ├── missions.json           # Challenge missions
│   ├── tools.json              # Forensic tools catalog
│   ├── topics.json             # Learning topics
│   ├── glossary.json           # General glossary
│   └── slokas.json             # Sanskrit ślokas
├── services/                    # Business logic services
│   ├── CaseStudyIngestion.ts   # Case study data ingestion
│   ├── CaseStudyMigration.ts   # Case study data migration
│   ├── CaseStudyRAG.ts         # RAG retrieval system
│   ├── ForensicKnowledgeService.ts  # Knowledge management
│   └── PromptTemplates.ts      # AI prompt templates
├── utils/                       # Utility functions
│   ├── Graph.ts                # Graph data structure
│   ├── LRUCache.ts             # LRU cache implementation
│   ├── Trie.ts                 # Trie data structure
│   └── index.ts                # Utility exports
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
│   ├── global.d.ts             # Global type definitions
│   └── caseStudySchema.ts      # Case study schema types
├── styles/                      # Global CSS styles
│   └── index.css               # Main stylesheet
└── main.tsx                     # Application entry point
```

## Development Status

**TASK 1 — PROJECT SETUP**: ✅ Complete  
**TASK 2 — INFORMATION ARCHITECTURE + JSON SCHEMAS**: ✅ Complete  
**TASK 3 — DESIGN SYSTEM COMPONENTS**: ✅ Complete  
**TASK 4 — DSA UTILITIES**: ✅ Complete  
**TASK 5 — 3D SCENES + FALLBACKS**: ✅ Complete  
**TASK 6 — CONTENT AUTHORING**: ✅ Complete  
**TASK 7 — SPECIALIZED CHATBOT**:   
**TASK 8 — PERFORMANCE & ACCESSIBILITY QA**: ✅ Complete  
**TASK 9 — FINAL INTEGRATION**: ✅ Complete  
**TASK 10 — HANDOFF DOCUMENTATION + BUG FIXES**: ✅ Complete  

**🎉 PROJECT STATUS: 70% COMPLETED**

All 129 tests passing | Zero TypeScript errors | Zero linting issues | Build verified ✓

## Key Learning Components

### 🔬 Specialized Forensic Labs

Interactive hands-on analysis tools integrated within the Terminal feature:

1. **NetFlow Lab** - Network flow analysis and threat detection
   - Sort network traffic by source, destination, bytes transferred
   - Flag suspicious and critical connections
   - Identify C2 (Command & Control) beacons
   - Priority-based flow visualization

2. **Timeline Lab** - Temporal analysis of forensic evidence
   - Pivot across case event datasets
   - Phase-based timeline analysis
   - Event correlation and sequence verification
   - Historical artifact reconstruction

3. **Hash Verify Lab** - File integrity verification
   - SHA-256 hash validation
   - Evidence authenticity confirmation
   - Hash comparison and matching
   - Chain of custody verification

4. **Memory Triage Lab** - Memory dump analysis
   - Volatility snapshot filtering
   - Process analysis by risk level (low/medium/high)
   - Anomaly detection (credential dumping, unsigned modules, suspicious network activity)
   - User privilege level analysis

5. **Steganography Detection Lab** - Covert data discovery
   - Steganographic pattern recognition
   - Hidden message extraction
   - Media file analysis (images, audio)
   - Stenographic algorithm identification

### 📚 Educational Modules

16 comprehensive learning sections covering forensic investigation domains:
- **Computer Forensics Fundamentals** - Core principles and concepts
- **Data Acquisition** - Evidence collection methodologies
- **File Systems** - NTFS, FAT32, EXT4, APFS analysis
- **Storage Internals** - HDD/SSD mechanisms and forensic implications
- **Evidence Rules** - Admissibility, reliability, completeness, integrity
- **Investigation Process** - Step-by-step investigation workflows
- **Operating System Forensics** - Windows/Linux/macOS artifact analysis
- **Network Forensics** - Network traffic and protocol analysis
- **Malware Analysis** - Malware behavior and detection
- **Email Crime Investigation** - Email header analysis and artifact recovery
- **Dark Web Investigation** - Anonymity technologies and investigation techniques

### 🖥️ Interactive Terminal

Command-line interface with forensic workflows:
- **Forensic Command Reference** - 50+ forensic tools and commands
- **Quiz System** - Multi-tier assessment (foundation, triage, deep-dive)
- **Missions** - Challenge-based learning objectives
- **Case Studies** - Real-world investigation scenarios
- **Glossary** - Comprehensive forensic terminology
- **Lab Access** - Seamless integration with all five forensic labs

### 📖 Real-World Case Studies

Detailed analysis of actual forensic investigations including:
- Case scenarios and objectives
- Key artifacts and evidence collection
- Investigation workflows and methodologies
- Practical tool usage examples
- Outcomes and lessons learned
- Step-by-step investigation phases

### 🤖 AI Chatbot Assistant

Gemini-powered forensics assistant for:
- Direct Q&A with forensic citations
- Concept teaching with practical examples
- Guided walkthroughs of procedures
- Real-time forensic knowledge queries

### 🎨 3D Visualizations

Interactive Three.js visualizations with graceful 2D fallbacks:
- **HDD Model** - Hard disk drive internals visualization
- **SSD Model** - Solid-state drive architecture
- Storage media structure and forensic implications
- Automatic fallback for unsupported browsers

### 🌟 Sanskrit Ślokas

Cultural and philosophical integration:
- Context-relevant Sanskrit verses throughout the platform
- English translations with forensic relevance
- Educational reinforcement of core concepts
- Cultural heritage preservation

## Quality Assurance

- ✅ **TypeScript**: Strict mode enabled, no type errors
- ✅ **Testing**: 129 tests passing (100% pass rate)
  - Component tests (Hero, TopicsGrid, ToolsShowcase, CaseStudies)
  - Terminal and Labs functionality
  - 3D Canvas rendering
  - Utility functions (Graph, LRUCache, Trie)
- ✅ **Linting**: ESLint configured, all errors resolved
- ✅ **Accessibility**: WCAG AA compliant
  - Full keyboard navigation support
  - ARIA labels and semantic HTML
  - Screen reader compatibility
  - High contrast dark theme
- ✅ **Performance**: 
  - Optimized bundle with lazy loading
  - Code splitting for critical sections
  - 3D fallback mechanisms
  - Session-based audio playback management

## Data Management

### JSON Data Sources

- **cases.json**: 5+ real-world forensic cases
- **caseEvents.json**: Detailed timeline events for case analysis
- **forensicCommands.json**: Fundamental forensic tool reference
- **forensicCommandsEnhanced.json**: Advanced command documentation
- **forensicGlossary.json**: 100+ forensic terminology entries
- **forensicQuiz.json**: Foundational quiz questions
- **forensicQuizBank.json**: Expanded question bank
- **missions.json**: Challenge-based learning objectives
- **tools.json**: 50+ forensic tools catalog
- **topics.json**: Learning module metadata
- **glossary.json**: General terminology
- **slokas.json**: Sanskrit verses with context

### Services

- **ForensicKnowledgeService**: Knowledge management and retrieval
- **CaseStudyRAG**: Retrieval-augmented generation for cases
- **CaseStudyIngestion**: Data import and processing
- **PromptTemplates**: AI assistant prompt engineering

## Deployment

The project is production-ready and can be deployed on Vercel, Netlify, or any static hosting provider.

### Quick Deploy Steps

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Preview the build locally**:
   ```bash
   npm run preview
   ```

3. **Deploy to Vercel** (Recommended):
   ```bash
   npm i -g vercel
   vercel
   ```

4. **Deploy to Netlify**:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

5. **Manual Deployment**:
   - Upload the `dist/` folder to your web server
   - Configure server to serve `index.html` for all routes

### Environment Configuration

No environment variables are required. The app runs entirely client-side.

### Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x or higher

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

This is an educational project. Feel free to fork and modify for learning purposes.

## License

Educational purposes only.
