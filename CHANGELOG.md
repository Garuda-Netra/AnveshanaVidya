# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-29

### Added
- **Global Type Definitions**: Created `src/types/global.d.ts` for `window.__lenis` typing to eliminate `as any` casts.
- **RAG Service Public API**: Added `searchCases()` method to `CaseStudyRAG` for type-safe case lookups.
- **CSS Utility Classes**: Introduced `.custom-scroll` and `.chatbot-messages-container` utilities for consistent scroll styling.
- **Mode Validation**: Added `safeMode` validation layer in Chatbot to ensure `selectedMode` is always valid.
- **Exponential Backoff**: Gemini API retry logic now uses exponential backoff (1s × retry count).

### Changed
- **Terminal Lazy Loading**: `Terminal` component is now lazy-loaded in `App.tsx` to reduce initial bundle size.
- **Memoized Callbacks**: Lab handlers in `Terminal.tsx` (`updateNetflowSort`, `toggleNetflowFlag`, `changeTimelineCase`, etc.) wrapped with `useCallback`.
- **Hoisted Constants**: `LAB_INTRO_COPY` and `LAB_METADATA` moved to module scope to prevent recreation on each render.
- **Stable Session ID**: Terminal session ID is now memoized with `useMemo` instead of regenerating each render.
- **RAG Initialization**: Updated `initializeFromLegacy` to accept typed `LegacyCase[]` parameter.
- **Modal Scroll Container**: Replaced inline styles with `.custom-scroll` class for maintainability.

### Fixed
- **TypeScript Strict Mode**: Removed all `as any` casts for `window.__lenis` access across `App.tsx`, `Modal.tsx`, and `Chatbot.tsx`.
- **Null Safety**: Added null checks for `ragResponse.citations` and `ragResponse.follow_up_suggestions`.
- **Stream Validation**: Added chunk validation before calling `chunk.text()` in Gemini streaming loop.
- **CSS Variable Definitions**: Added missing `--surface-light` and `--border-light` variables to `index.css`.
- **Tailwind Config**: Added `surface-light` and `border-light` to theme colors.

### Removed
- **Deleted Files**:
  - `src/components/features/Terminal.tsx.bak` (backup file)
  - `src/data/forensicCommands.backup.json` (backup data)
  - `src/utils/dataLoader.ts` (unused utility)
  - `src/components/sections/WebAttacks.tsx` (unused component)
  - `src/types/index.ts` (redundant type definitions)

### Security
- **API Resilience**: Enhanced error handling for Gemini API with structured error messages and retry logic.

### Performance
- **Code Splitting**: Heavy components (Terminal, TopicsGrid, ToolsShowcase, CaseStudies, SupportAccess, Chatbot) are lazy-loaded.
- **Reduced Re-renders**: Memoized callbacks and stable references prevent unnecessary child component updates.
- **Bundle Optimization**: Removed unused files reducing overall bundle size.

---

## [1.0.0] - Initial Release

### Added
- Digital Forensics Learning Platform with glassmorphism UI
- Interactive Terminal with 200+ forensic commands
- Case Study RAG system with citation support
- AI-powered Chatbot with three modes (Direct QA, Teaching, Walkthrough)
- 3D visualizations with React Three Fiber
- Smooth scrolling with Lenis
- Responsive design with Tailwind CSS
- WCAG AA accessibility compliance
