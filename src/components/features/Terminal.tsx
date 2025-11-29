import { useState, useRef, useEffect, useMemo, useId, useCallback, lazy, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import {
  X, Minus, Square, Terminal as TerminalIcon,
  Search, Command, ChevronRight, Download, Copy,
  Activity, Cpu, Shield, Wifi, Database, FileText,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import forensicGlossary from '../../data/forensicGlossary.json';
import forensicQuiz from '../../data/forensicQuiz.json';
import forensicQuizBank from '../../data/forensicQuizBank.json';
import missions from '../../data/missions.json';
import cases from '../../data/cases.json';
import caseEvents from '../../data/caseEvents.json';
import type { NetflowRecord, NetflowSortKey } from '../labs/NetflowLab';
import type { TimelineDataset } from '../labs/TimelineLab';
import type { HashVerifyState } from '../labs/HashVerifyLab';
import type { MemoryProcess, RiskFilter } from '../labs/MemoryTriageLab';
import type { StegoDetectState, StegoStep } from '../labs/StegoDetectLab';

const LabPanel = lazy(() => import('../labs/LabPanel').then(mod => ({ default: mod.LabPanel })));
const NetflowLab = lazy(() => import('../labs/NetflowLab').then(mod => ({ default: mod.NetflowLab })));
const TimelineLab = lazy(() => import('../labs/TimelineLab').then(mod => ({ default: mod.TimelineLab })));
const HashVerifyLab = lazy(() => import('../labs/HashVerifyLab').then(mod => ({ default: mod.HashVerifyLab })));
const MemoryTriageLab = lazy(() => import('../labs/MemoryTriageLab').then(mod => ({ default: mod.MemoryTriageLab })));
const StegoDetectLab = lazy(() => import('../labs/StegoDetectLab').then(mod => ({ default: mod.StegoDetectLab })));

// --- Error Boundary ---

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[telemetry] boundary-error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// --- Types ---

interface CommandEntry {
  input: string;
  output: string | JSX.Element;
  timestamp: number;
  status: 'success' | 'error' | 'info';
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface BasicCommandEntry {
  command: string;
  category: string;
  description: string;
  simulatedOutput?: string;
  forensicUse?: string;
}

interface EnhancedCommandEntry {
  name: string;
  category: string;
  description: string;
  output_example?: string;
  explain?: string;
  simulatedOutput?: string;
  forensicUse?: string;
}

interface CommandHelpData {
  categories: Record<string, string>;
  help_index: Record<string, string[]>;
  common_workflows: Record<string, string[]>;
}

interface CommandRegistryState {
  commands: BasicCommandEntry[];
  commandsEnhanced: EnhancedCommandEntry[];
  commandHelp: CommandHelpData | null;
}

interface QuizBankQuestion {
  id: number;
  tier: 'foundation' | 'triage' | 'deep-dive';
  question: string;
  options: string[];
  correct: number;
  rationale: string;
  references: {
    module_id: string;
    case_id: string | null;
  };
}

interface MissionStep {
  id: string;
  instruction: string;
  requiredCommand: string;
  validationPattern: string;
  successMessage: string;
  hint: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'foundation' | 'triage' | 'deep-dive';
  estimatedTime: string;
  prerequisites: string[];
  references: {
    module_ids: string[];
    case_id: string | null;
  };
  steps: MissionStep[];
  completionMessage: string;
  reward: {
    badge: string;
    xp: number;
  };
}

interface MissionProgress {
  missionId: string;
  currentStep: number;
  startedAt: number;
  completedSteps: string[];
}

type LabView = 'netflow' | 'timeline' | 'hash' | 'memory' | 'stego';

interface LabSessions {
  netflow: {
    sortKey: NetflowSortKey;
    sortDirection: 'asc' | 'desc';
    showOnlyFlagged: boolean;
  };
  timeline: {
    activeCaseId: string;
  };
  hash: HashVerifyState;
  memory: {
    riskFilter: RiskFilter;
    showOnlyAnomalies: boolean;
  };
  stego: StegoDetectState;
}

const LAB_INTRO_COPY: Record<LabView, string> = {
  netflow: 'NetFlow trace lab armed. Sort flows, review priority flags, and note C2 beacons.',
  timeline: 'Timeline visualization ready. Pivot across case.events datasets for phase analysis.',
  hash: 'Hash verification module loaded. Paste SHA-256 values to compare integrity.',
  memory: 'Memory triage console online. Filter Volatility snapshot by risk and anomaly.',
  stego: 'Stego detection pipeline staged. Run deterministic extraction to review findings.'
};

const LAB_METADATA: Record<LabView, { title: string; subtitle: string }> = {
  netflow: { title: 'NetFlow Trace Lab', subtitle: 'Sortable flows + anomaly flags' },
  timeline: { title: 'Case Timeline Graph', subtitle: 'Visualize case.events dataset' },
  hash: { title: 'Hash Verification Station', subtitle: 'Compare SHA-256 strings' },
  memory: { title: 'Memory Triage Console', subtitle: 'Volatility snapshot filters' },
  stego: { title: 'Stego Detect Pipeline', subtitle: 'Deterministic extraction run' }
};

// --- Fixtures ---

const TIMELINE_DATASETS = caseEvents as TimelineDataset[];

const NETFLOW_FIXTURE: NetflowRecord[] = [
  { id: 'flow-1', time: '11:20:14', source: '10.10.24.7:443', destination: '203.0.113.87:8443', bytes: 18765432, protocol: 'TLS', flags: 'critical', note: 'Bulk exfiltration to C2 node' },
  { id: 'flow-2', time: '11:11:02', source: '10.10.33.12:5985', destination: '10.10.45.5:5985', bytes: 35673, protocol: 'WinRM', flags: 'suspicious', note: 'PsExec lateral movement (admin$)' },
  { id: 'flow-3', time: '11:05:44', source: '10.10.24.7:53', destination: '198.51.100.24:53', bytes: 1248, protocol: 'DNS', flags: 'benign', note: 'Baseline DNS noise' },
  { id: 'flow-4', time: '10:59:03', source: '10.10.24.7:49812', destination: '203.0.113.87:53', bytes: 94731, protocol: 'UDP', flags: 'suspicious', note: 'DNS tunneling beacon (TXT payload)' },
  { id: 'flow-5', time: '10:47:28', source: '10.10.19.4:445', destination: '10.10.33.12:445', bytes: 563421, protocol: 'SMB', flags: 'benign', note: 'File server replication window' }
];

const MEMORY_FIXTURE: MemoryProcess[] = [
  { pid: 1180, name: 'lsass.exe', user: 'NT AUTHORITY', integrity: 'system', anomaly: 'credential-dump', note: 'Mimikatz signature detected in memory region 0x1f000', risk: 'high' },
  { pid: 2336, name: 'powershell.exe', user: 'FINANCE\\svc_admin', integrity: 'high', anomaly: 'suspicious-network', note: 'Encoded command launching Invoke-PSExec', risk: 'high' },
  { pid: 3104, name: 'cscript.exe', user: 'FINANCE\\hr-analyst', integrity: 'medium', anomaly: 'unsigned-module', note: 'Unsigned DLL injected (C:\\Temp\\update.dll)', risk: 'medium' },
  { pid: 420, name: 'explorer.exe', user: 'FINANCE\\hr-analyst', integrity: 'medium', anomaly: 'none', note: 'No findings', risk: 'low' },
  { pid: 5120, name: 'svchost.exe', user: 'NT AUTHORITY', integrity: 'system', anomaly: 'none', note: 'Service host baseline', risk: 'low' }
];

const STEGO_TEMPLATE: StegoStep[] = [
  { id: 'ingest', label: 'Ingest Carrier', detail: 'Parse PNG container, confirm IHDR/IDAT integrity', status: 'pending' },
  { id: 'lsb', label: 'LSB Differential Scan', detail: 'Compare RGB bit planes for entropy spikes', status: 'pending' },
  { id: 'extract', label: 'Payload Extraction', detail: 'Assemble detected bitstream into archive', status: 'pending' },
  { id: 'report', label: 'Result Packaging', detail: 'Document findings and carve output ZIP', status: 'pending' }
];

const STEGO_RESULTS: Record<string, string> = {
  ingest: 'Carrier hash matches evidence (sha256 7d0d...).',
  lsb: 'Located 3 anomalous regions (blocks 14, 27, 42).',
  extract: 'Recovered zip fragment (32KB) – requires password.',
  report: 'Derived passphrase from EXIF Creator → full ZIP rebuilt.'
};

const HASH_BASELINE: HashVerifyState = {
  knownSha256: '4f6e2d4b39f708ad56df833c0b1e580b0c219c2c2bc0a3106b572f5b5f7b1f4d',
  referenceLabel: 'FTK image – patient-zero memory dump (287GB E01)',
  userInput: '',
  lastResult: 'idle'
};

const LAB_COMMANDS = ['trace', 'timeline', 'hash verify', 'mem scan', 'stego detect'];
const LEARNING_COMMANDS = ['quiz', 'quiz foundation', 'quiz triage', 'quiz deep-dive', 'mission', 'mission list', 'mission start', 'mission status', 'mission hint', 'mission abandon', 'case'];

// --- Helper Components ---

const StreamingText = ({ text, speed = 15, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  const index = useRef(0);

  useEffect(() => {
    index.current = 0;
    setDisplayed('');
    
    const interval = setInterval(() => {
      if (index.current < text.length) {
        setDisplayed((prev) => prev + text.charAt(index.current));
        index.current++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{displayed}</span>;
};

// --- Main Component ---

export default function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandEntry[]>([
    { 
      input: '', 
      output: (
        <div className="space-y-1 animate-fade-in">
          <p className="text-accent-neon font-bold text-lg">╔════════════════════════════════════════════════════╗</p>
          <p className="text-accent-neon font-bold text-lg">║  FORENSEC COMMAND CENTER - TERMINAL v3.0          ║</p>
          <p className="text-accent-neon font-bold text-lg">║  Enhanced Forensic Arsenal - 200+ Commands        ║</p>
          <p className="text-accent-neon font-bold text-lg">╚════════════════════════════════════════════════════╝</p>
          <p className="text-text-secondary mt-2">Interactive forensic investigation simulator with comprehensive command registry</p>
          <div className="mt-3 space-y-1">
            <p className="text-accent-purple">▸ <span className="text-accent-neon font-bold">help</span> - View command categories & quick reference</p>
            <p className="text-accent-purple">▸ <span className="text-accent-neon font-bold">helpcat [category]</span> - Browse commands by domain</p>
            <p className="text-accent-purple">▸ <span className="text-accent-neon font-bold">glossary [term]</span> - Forensic terminology & acronyms</p>
            <p className="text-accent-purple">▸ <span className="text-accent-neon font-bold">workflow [type]</span> - Investigation workflows</p>
            <p className="text-accent-purple">▸ <span className="text-accent-neon font-bold">quiz [tier]</span> - Test your knowledge (foundation|triage|deep-dive)</p>
            <p className="text-accent-purple">▸ <span className="text-accent-neon font-bold">mission</span> - Challenge missions with step-by-step objectives</p>
            <p className="text-accent-purple">▸ <span className="text-accent-neon font-bold">case</span> - Explore real-world investigations</p>
          </div>
        </div>
      ),
      timestamp: Date.now(),
      status: 'info'
    }
  ]);
  const [commandRegistry, setCommandRegistry] = useState<CommandRegistryState>({
    commands: [],
    commandsEnhanced: [],
    commandHelp: null
  });
  const [registryLoading, setRegistryLoading] = useState(true);
  const [registryError, setRegistryError] = useState<Error | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [currentQuizBank, setCurrentQuizBank] = useState<QuizBankQuestion | null>(null);
  const [activeMission, setActiveMission] = useState<MissionProgress | null>(null);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [paletteActiveIndex, setPaletteActiveIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalState, setTerminalState] = useState<'idle' | 'processing' | 'error' | 'success'>('idle');
  const [executedCategories, setExecutedCategories] = useState<Set<string>>(new Set());
  const [activeLab, setActiveLab] = useState<LabView | null>(null);
  const [labSessions, setLabSessions] = useState<LabSessions>({
    netflow: {
      sortKey: 'bytes',
      sortDirection: 'desc',
      showOnlyFlagged: true
    },
    timeline: {
      activeCaseId: TIMELINE_DATASETS[0]?.caseId ?? 'ransomware-investigation'
    },
    hash: { ...HASH_BASELINE },
    memory: {
      riskFilter: 'all',
      showOnlyAnomalies: false
    },
    stego: {
      steps: STEGO_TEMPLATE.map(step => ({ ...step })),
      status: 'idle'
    }
  });
  const [supportsBackdrop, setSupportsBackdrop] = useState(false);
  const stegoTimers = useRef<number[]>([]);
  const suggestionListId = `${useId()}-suggestions`;
  const paletteListId = `${useId()}-palette`;
  const sessionId = useMemo(() => Math.floor(Math.random() * 9000) + 1000, []);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Derived Data
  const allCommands = useMemo(() => {
    const enhancedNames = commandRegistry.commandsEnhanced.map(c => c.name);
    const basicNames = commandRegistry.commands.map(c => c.command);
    const combined = new Set([...enhancedNames, ...basicNames, ...LAB_COMMANDS, ...LEARNING_COMMANDS]);
    return Array.from(combined).sort();
  }, [commandRegistry]);

  const filteredCommands = useMemo(() => {
    if (!paletteSearch) return allCommands;
    return allCommands.filter(c => c.toLowerCase().includes(paletteSearch.toLowerCase()));
  }, [allCommands, paletteSearch]);

  const now = () => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());

  // Effects
  
  // Detect backdrop-filter support for blur fallback
  useEffect(() => {
    const testBackdrop = CSS.supports('backdrop-filter', 'blur(10px)') || CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
    setSupportsBackdrop(testBackdrop);
    console.log('[Terminal] Backdrop-filter support:', testBackdrop);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const loadRegistry = async () => {
      const start = now();
      try {
        const basicStart = now();
        const basic = await import('../../data/forensicCommands.json');
        if (cancelled) return;
        setCommandRegistry(prev => ({ ...prev, commands: basic.default as BasicCommandEntry[] }));
        console.info(`[telemetry] registry-basic loaded in ${(now() - basicStart).toFixed(1)}ms`);

        await delay(40);

        const enhancedStart = now();
        const enhanced = await import('../../data/forensicCommandsEnhanced.json');
        if (cancelled) return;
        setCommandRegistry(prev => ({ ...prev, commandsEnhanced: enhanced.default as EnhancedCommandEntry[] }));
        console.info(`[telemetry] registry-advanced loaded in ${(now() - enhancedStart).toFixed(1)}ms`);

        await delay(40);

        const helpStart = now();
        const help = await import('../../data/commandHelp.json');
        if (cancelled) return;
        setCommandRegistry(prev => ({ ...prev, commandHelp: help.default as CommandHelpData }));
        console.info(`[telemetry] registry-help loaded in ${(now() - helpStart).toFixed(1)}ms`);

        console.info(`[telemetry] registry-hydration complete ${(now() - start).toFixed(1)}ms`);
      } catch (error) {
        if (cancelled) return;
        console.error('[telemetry] registry-load-error', error);
        setRegistryError(error as Error);
      } finally {
        if (!cancelled) {
          setRegistryLoading(false);
        }
      }
    };

    loadRegistry();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isPaletteOpen) {
      setTimeout(() => paletteInputRef.current?.focus(), 50);
    } else {
      inputRef.current?.focus();
    }
  }, [isPaletteOpen]);

  useEffect(() => {
    if (input.trim()) {
      const needle = input.toLowerCase();
      const matches = allCommands.filter(c => c.toLowerCase().startsWith(needle)).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
    setActiveSuggestionIndex(-1);
  }, [input, allCommands]);

  const clearStegoTimers = useCallback(() => {
    stegoTimers.current.forEach(timer => window.clearTimeout(timer));
    stegoTimers.current = [];
  }, []);

  useEffect(() => () => clearStegoTimers(), [clearStegoTimers]);

  // Scroll Isolation Effect - Prevent terminal scroll from propagating to body/Lenis
  useEffect(() => {
    const terminalBody = terminalBodyRef.current;
    if (!terminalBody) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = terminalBody;
      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

      // Only prevent default if we're not at scroll boundaries
      // This keeps scroll contained within terminal
      if ((isScrollingUp && !isAtTop) || (isScrollingDown && !isAtBottom)) {
        e.stopPropagation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Stop touch events from propagating to prevent background scroll
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = terminalBody;
      const isAtTop = scrollTop === 0;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

      // Prevent background scroll when terminal can still scroll
      if (!isAtTop || !isAtBottom) {
        e.stopPropagation();
      }
    };

    // Attach listeners with { passive: false } to allow preventDefault if needed
    terminalBody.addEventListener('wheel', handleWheel, { passive: false });
    terminalBody.addEventListener('touchstart', handleTouchStart, { passive: false });
    terminalBody.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      terminalBody.removeEventListener('wheel', handleWheel);
      terminalBody.removeEventListener('touchstart', handleTouchStart);
      terminalBody.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Handlers
  const focusInput = () => {
    if (!isPaletteOpen) inputRef.current?.focus();
  };

  const addToHistory = (cmd: string, output: string | JSX.Element, status: 'success' | 'error' | 'info' = 'success') => {
    setHistory(prev => [...prev, { input: cmd, output, timestamp: Date.now(), status }]);
    setTerminalState(status === 'error' ? 'error' : 'success');
    setTimeout(() => setTerminalState('idle'), 1000);
  };

  const updateNetflowSort = useCallback((key: NetflowSortKey, direction: 'asc' | 'desc') => {
    setLabSessions(prev => ({
      ...prev,
      netflow: { ...prev.netflow, sortKey: key, sortDirection: direction }
    }));
  }, []);

  const toggleNetflowFlag = useCallback(() => {
    setLabSessions(prev => ({
      ...prev,
      netflow: { ...prev.netflow, showOnlyFlagged: !prev.netflow.showOnlyFlagged }
    }));
  }, []);

  const changeTimelineCase = useCallback((caseId: string) => {
    setLabSessions(prev => ({
      ...prev,
      timeline: { activeCaseId: caseId }
    }));
  }, []);

  const handleHashInputChange = useCallback((value: string) => {
    setLabSessions(prev => ({
      ...prev,
      hash: { ...prev.hash, userInput: value }
    }));
  }, []);

  const handleHashVerify = useCallback(() => {
    setLabSessions(prev => {
      const normalizedInput = prev.hash.userInput.trim().toLowerCase();
      const normalizedKnown = prev.hash.knownSha256.toLowerCase();
      const matches = normalizedInput.length > 0 && normalizedInput === normalizedKnown;
      return {
        ...prev,
        hash: {
          ...prev.hash,
          lastResult: matches ? 'match' : 'mismatch'
        }
      };
    });
  }, []);

  const changeRiskFilter = useCallback((risk: RiskFilter) => {
    setLabSessions(prev => ({
      ...prev,
      memory: { ...prev.memory, riskFilter: risk }
    }));
  }, []);

  const toggleAnomalyFilter = useCallback(() => {
    setLabSessions(prev => ({
      ...prev,
      memory: { ...prev.memory, showOnlyAnomalies: !prev.memory.showOnlyAnomalies }
    }));
  }, []);

  const runStegoPipeline = useCallback(() => {
    clearStegoTimers();
    setLabSessions(prev => ({
      ...prev,
      stego: {
        status: 'running',
        lastRunAt: prev.stego.lastRunAt,
        steps: STEGO_TEMPLATE.map((step, index) => ({
          ...step,
          status: (index === 0 ? 'running' : 'pending') as StegoStep['status'],
          result: undefined
        }))
      }
    }));

    STEGO_TEMPLATE.forEach((step, index) => {
      const timer = window.setTimeout(() => {
        setLabSessions(prev => {
          const steps = prev.stego.steps.map((existing, idx) => {
            if (existing.id === step.id) {
              return { ...existing, status: 'complete' as const, result: STEGO_RESULTS[existing.id] };
            }
            if (idx === index + 1 && existing.status === 'pending') {
              return { ...existing, status: 'running' as const };
            }
            return existing;
          });
          const status: StegoDetectState['status'] = index === STEGO_TEMPLATE.length - 1 ? 'complete' : 'running';
          return {
            ...prev,
            stego: {
              ...prev.stego,
              steps,
              status,
              lastRunAt: status === 'complete' ? new Date().toLocaleTimeString() : prev.stego.lastRunAt
            }
          };
        });
      }, 800 * (index + 1));
      stegoTimers.current.push(timer);
    });
  }, [clearStegoTimers]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const mainCmd = parts[0];
    const args = parts.slice(1);

    // Log command usage pattern (anonymized - command name and arg count only)
    console.log(`[telemetry] terminal command: ${mainCmd} (${args.length} args)`);

    const resolveLab = (): LabView | null => {
      if (trimmed === 'trace') return 'netflow';
      if (trimmed.startsWith('timeline')) return 'timeline';
      if (trimmed.startsWith('hash verify')) return 'hash';
      if (trimmed.startsWith('mem scan')) return 'memory';
      if (trimmed.startsWith('stego detect')) return 'stego';
      return null;
    };

    const maybeLab = resolveLab();
    if (maybeLab) {
      if (maybeLab === 'timeline' && args[0]) {
        const caseId = args[0];
        const dataset = TIMELINE_DATASETS.find(entry => entry.caseId === caseId);
        if (dataset) changeTimelineCase(dataset.caseId);
      }
      if (maybeLab === 'hash' && args[0]) {
        handleHashInputChange(args[0]);
      }
      setActiveLab(maybeLab);
      addToHistory(cmd, <p className="text-text-secondary">{LAB_INTRO_COPY[maybeLab]}</p>, 'info');
      return;
    }

    let output: string | JSX.Element = '';
    let status: 'success' | 'error' | 'info' = 'success';

    // Quiz Logic - Legacy Quiz
    if (currentQuiz && ['a', 'b', 'c', 'd'].includes(mainCmd)) {
      const answerIndex = mainCmd.charCodeAt(0) - 97;
      const isCorrect = answerIndex === currentQuiz.correct;
      
      output = (
        <div className="space-y-2">
          <p className={isCorrect ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
            {isCorrect ? "✓ CORRECT!" : "✗ INCORRECT"}
          </p>
          <p className="text-text-secondary">{currentQuiz.explanation}</p>
          <p className="text-accent-purple mt-2">Type <span className="text-accent-neon">quiz</span> for another question</p>
        </div>
      );
      setCurrentQuiz(null);
      addToHistory(cmd, output, isCorrect ? 'success' : 'error');
      return;
    }

    // Quiz Logic - Tiered Quiz Bank
    if (currentQuizBank && ['a', 'b', 'c', 'd'].includes(mainCmd)) {
      const answerIndex = mainCmd.charCodeAt(0) - 97;
      const isCorrect = answerIndex === currentQuizBank.correct;
      
      const tierColors: Record<string, string> = {
        'foundation': 'text-green-400',
        'triage': 'text-yellow-400',
        'deep-dive': 'text-red-400'
      };
      
      output = (
        <div className="space-y-2">
          <p className={isCorrect ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
            {isCorrect ? "✓ CORRECT!" : "✗ INCORRECT"}
          </p>
          <p className={`${tierColors[currentQuizBank.tier]} text-xs uppercase font-bold`}>
            {currentQuizBank.tier.replace('-', ' ')} tier
          </p>
          <p className="text-text-secondary mt-2">{currentQuizBank.rationale}</p>
          {currentQuizBank.references.case_id && (
            <p className="text-accent-cyan text-sm mt-1">
              📁 Related case: <span className="text-accent-neon">{currentQuizBank.references.case_id}</span>
            </p>
          )}
          {currentQuizBank.references.module_id && (
            <p className="text-accent-purple text-sm">
              📚 Module: <span className="text-accent-neon">{currentQuizBank.references.module_id}</span>
            </p>
          )}
          <p className="text-accent-purple mt-2">
            Type <span className="text-accent-neon">quiz {currentQuizBank.tier}</span> for another {currentQuizBank.tier} question
          </p>
        </div>
      );
      setCurrentQuizBank(null);
      addToHistory(cmd, output, isCorrect ? 'success' : 'error');
      return;
    }

    // Mission Step Validation
    if (activeMission && !['a', 'b', 'c', 'd'].includes(mainCmd)) {
      const missionData = (missions as Mission[]).find(m => m.id === activeMission.missionId);
      if (missionData) {
        const currentStep = missionData.steps[activeMission.currentStep];
        if (currentStep) {
          const pattern = new RegExp(currentStep.validationPattern, 'i');
          if (pattern.test(trimmed)) {
            // Step completed successfully
            const isLastStep = activeMission.currentStep >= missionData.steps.length - 1;
            
            if (isLastStep) {
              // Mission complete!
              setCompletedMissions(prev => new Set(prev).add(activeMission.missionId));
              setActiveMission(null);
              
              output = (
                <div className="space-y-2">
                  <p className="text-green-400 font-bold text-lg">🎉 MISSION COMPLETE!</p>
                  <p className="text-accent-neon font-bold">{missionData.title}</p>
                  <p className="text-text-secondary">{currentStep.successMessage}</p>
                  <div className="mt-3 p-3 bg-green-900/30 border border-green-500/50 rounded">
                    <p className="text-green-400">{missionData.completionMessage}</p>
                    <p className="text-accent-cyan mt-2">
                      🏆 Badge earned: <span className="text-accent-neon font-bold">{missionData.reward.badge}</span>
                    </p>
                    <p className="text-accent-purple">
                      ⭐ XP gained: <span className="text-accent-neon font-bold">+{missionData.reward.xp}</span>
                    </p>
                  </div>
                </div>
              );
              addToHistory(cmd, output, 'success');
              return;
            } else {
              // Move to next step
              const nextStep = missionData.steps[activeMission.currentStep + 1];
              setActiveMission(prev => prev ? {
                ...prev,
                currentStep: prev.currentStep + 1,
                completedSteps: [...prev.completedSteps, currentStep.id]
              } : null);
              
              output = (
                <div className="space-y-2">
                  <p className="text-green-400 font-bold">✓ Step {activeMission.currentStep + 1}/{missionData.steps.length} Complete</p>
                  <p className="text-text-secondary">{currentStep.successMessage}</p>
                  <div className="mt-3 p-2 bg-surface-elevated/50 border-l-2 border-accent-neon">
                    <p className="text-accent-cyan text-sm font-bold">NEXT OBJECTIVE:</p>
                    <p className="text-text-primary">{nextStep.instruction}</p>
                  </div>
                </div>
              );
              addToHistory(cmd, output, 'success');
              // Don't return - let the command also execute normally
            }
          }
        }
      }
    }

    // Command Routing
    switch (mainCmd) {
      case 'help':
        if (!commandRegistry.commandHelp) {
          output = registryLoading
            ? 'Command registry loading… please wait a moment.'
            : 'Command registry unavailable. Try reloading the terminal.';
          status = registryLoading ? 'info' : 'error';
        } else {
          const categories = commandRegistry.commandHelp.categories;
          output = (
            <div className="space-y-3">
              <p className="text-accent-neon font-bold text-lg border-b border-accent-neon pb-1">
                ═══ FORENSIC ARSENAL ═══
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm" role="list">
                {Object.entries(categories).map(([cat, desc]) => (
                  <p key={cat} role="listitem" className="text-text-secondary">
                    <span className="text-accent-cyan font-mono">{cat}</span> - {desc as string}
                  </p>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-border-glass space-y-1">
                <p className="text-accent-purple">💡 <span className="text-accent-neon">helpcat &lt;category&gt;</span> - View commands by category</p>
                <p className="text-accent-purple">💡 <span className="text-accent-neon">explain &lt;command&gt;</span> - Detailed forensic context</p>
                <p className="text-accent-purple">💡 <span className="text-accent-neon">glossary [term]</span> - Forensic terminology</p>
                <p className="text-accent-purple">💡 <span className="text-accent-neon">workflow &lt;type&gt;</span> - Investigation workflows</p>
              </div>
              <div className="mt-2 text-xs text-text-tertiary">
                <p>📚 Source: [module:command_center]</p>
              </div>
            </div>
          );
        }
        break;

      case 'helpcat':
        if (!commandRegistry.commandHelp) {
          output = registryLoading
            ? 'Command registry loading…'
            : 'Command help unavailable.';
          status = registryLoading ? 'info' : 'error';
        } else if (args.length === 0) {
          output = 'Usage: helpcat <category>\nAvailable categories: ' + Object.keys(commandRegistry.commandHelp.categories).join(', ');
          status = 'error';
        } else {
          const category = args[0];
          const cmds = commandRegistry.commandsEnhanced.filter(c => c.category === category || c.category?.toLowerCase() === category.toLowerCase());
          if (cmds.length > 0) {
            const description = commandRegistry.commandHelp.categories[category as keyof typeof commandRegistry.commandHelp.categories];
            output = (
              <div className="space-y-2">
                <p className="text-accent-neon font-bold">═══ {category.toUpperCase()} COMMANDS ═══</p>
                {description && <p className="text-text-secondary text-sm">{description}</p>}
                <div className="space-y-1 mt-2" role="list">
                  {cmds.map(command => (
                    <div key={command.name} role="listitem" className="border border-border-glass/50 rounded-lg p-3 hover:border-accent-neon/40 transition-colors">
                      <p className="text-accent-neon font-mono">{command.name}</p>
                      <p className="text-text-secondary text-sm mt-1">{command.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          } else {
            output = `Category '${category}' not found. Type 'help' for available categories.`;
            status = 'error';
          }
        }
        break;

      case 'glossary':
        if (args.length === 0) {
          const terms = Object.keys(forensicGlossary.terms).slice(0, 15);
          output = (
            <div className="space-y-2">
              <p className="text-accent-neon font-bold">═══ FORENSIC GLOSSARY (Top Terms) ═══</p>
              {terms.map(term => (
                <p key={term} className="text-sm">
                  <span className="text-accent-cyan font-bold">{term}</span>: {forensicGlossary.terms[term as keyof typeof forensicGlossary.terms].definition}
                </p>
              ))}
              <p className="text-accent-purple mt-2">💡 Use <span className="text-accent-neon">glossary &lt;term&gt;</span> for detailed definition</p>
            </div>
          );
        } else {
          const term = args[0].toLowerCase().replace(/-/g, '_');
          const termData = forensicGlossary.terms[term as keyof typeof forensicGlossary.terms];
          const acronym = forensicGlossary.acronyms[args[0].toUpperCase() as keyof typeof forensicGlossary.acronyms];
          if (termData) {
            output = (
              <div className="space-y-2">
                <p className="text-accent-neon font-bold text-lg">{term.toUpperCase()}</p>
                <p className="text-text-primary"><span className="text-accent-purple font-bold">Definition:</span> {termData.definition}</p>
                <p className="text-text-secondary"><span className="text-accent-purple font-bold">Context:</span> {termData.context}</p>
              </div>
            );
          } else if (acronym) {
            output = (
              <div className="space-y-1">
                <p className="text-accent-neon font-bold">{args[0].toUpperCase()}</p>
                <p className="text-text-secondary">{acronym}</p>
              </div>
            );
          } else {
            output = `Term '${args[0]}' not found in glossary.`;
            status = 'error';
          }
        }
        break;

      case 'workflow':
        if (!commandRegistry.commandHelp) {
          output = registryLoading
            ? 'Loading workflow registry…'
            : 'Workflow registry unavailable.';
          status = registryLoading ? 'info' : 'error';
        } else if (args.length === 0) {
          output = (
            <div className="space-y-2">
              <p className="text-accent-neon font-bold">═══ INVESTIGATION WORKFLOWS ═══</p>
              <p className="text-text-secondary">Available workflows: {Object.keys(commandRegistry.commandHelp.common_workflows).join(', ')}</p>
              <p className="text-accent-purple">Usage: workflow &lt;type&gt;</p>
            </div>
          );
        } else {
          const workflowType = args.join('_');
          const workflow = commandRegistry.commandHelp.common_workflows[workflowType as keyof typeof commandRegistry.commandHelp.common_workflows];
          if (workflow) {
            output = (
              <div className="space-y-2">
                <p className="text-accent-neon font-bold">═══ {workflowType.toUpperCase().replace(/_/g, ' ')} WORKFLOW ═══</p>
                <div className="space-y-1" role="list">
                  {workflow.map((step: string, idx: number) => (
                    <p key={idx} role="listitem" className="text-text-secondary text-sm pl-2">{step}</p>
                  ))}
                </div>
              </div>
            );
          } else {
            output = `Workflow '${workflowType}' not found.`;
            status = 'error';
          }
        }
        break;

      case 'clear':
        setHistory([]);
        setCurrentQuiz(null);
        return;

      case 'explain':
        if (args.length === 0) {
          output = 'Usage: explain <command>';
          status = 'error';
        } else {
          let cmdData: EnhancedCommandEntry | BasicCommandEntry | undefined = commandRegistry.commandsEnhanced.find(c => c.name === args[0]);
          const isEnhanced = !!cmdData;
          if (!cmdData) {
            cmdData = commandRegistry.commands.find(c => c.command === args[0]);
          }
          if (cmdData) {
            const title = isEnhanced
              ? (cmdData as EnhancedCommandEntry).name
              : (cmdData as BasicCommandEntry).command;
            const context = isEnhanced
              ? (cmdData as EnhancedCommandEntry).explain
              : (cmdData as BasicCommandEntry).forensicUse;
            output = (
              <div className="space-y-2">
                <p className="text-accent-neon font-bold text-lg">═══ {title.toUpperCase()} ═══</p>
                <p className="text-text-primary"><span className="text-accent-purple font-bold">Category:</span> {cmdData.category}</p>
                <p className="text-text-secondary mt-2">{cmdData.description}</p>
                <p className="text-text-primary mt-2">
                  <span className="text-accent-purple font-bold">Forensic Context:</span><br/>
                  <span className="text-text-secondary">{context || 'Context unavailable.'}</span>
                </p>
                <div className="mt-2 text-xs text-text-tertiary">
                  <p>📚 Source: [tool:{title.toLowerCase().replace(/\s+/g, '_')}]</p>
                </div>
              </div>
            );
          } else {
            output = `Command '${args[0]}' not found.`;
            status = 'error';
          }
        }
        break;

      case 'quiz':
        // Check for tier argument
        const tier = args[0]?.toLowerCase() as 'foundation' | 'triage' | 'deep-dive' | undefined;
        const validTiers = ['foundation', 'triage', 'deep-dive'];
        
        if (tier && validTiers.includes(tier)) {
          // Use tiered quiz bank
          const tieredQuestions = (forensicQuizBank as QuizBankQuestion[]).filter(q => q.tier === tier);
          const randomTieredQuiz = tieredQuestions[Math.floor(Math.random() * tieredQuestions.length)];
          setCurrentQuizBank(randomTieredQuiz);
          setCurrentQuiz(null);
          
          const tierColors: Record<string, string> = {
            'foundation': 'text-green-400',
            'triage': 'text-yellow-400',
            'deep-dive': 'text-red-400'
          };
          
          output = (
            <div className="space-y-2">
              <p className="text-accent-neon font-bold">═══ FORENSIC KNOWLEDGE TEST ═══</p>
              <p className={`${tierColors[tier]} text-sm font-bold uppercase`}>
                ◆ {tier.replace('-', ' ')} TIER
              </p>
              <p className="text-text-primary mt-2">{randomTieredQuiz.question}</p>
              <div className="mt-2 space-y-1">
                {randomTieredQuiz.options.map((opt, idx) => (
                  <p key={idx} className="text-text-secondary pl-2">{opt}</p>
                ))}
              </div>
              <p className="text-accent-purple mt-3">
                Type your answer: <span className="text-accent-neon">a</span>, <span className="text-accent-neon">b</span>, <span className="text-accent-neon">c</span>, or <span className="text-accent-neon">d</span>
              </p>
            </div>
          );
        } else if (args.length > 0 && !validTiers.includes(args[0]?.toLowerCase())) {
          // Invalid tier specified
          output = (
            <div className="space-y-2">
              <p className="text-red-400">Invalid tier: {args[0]}</p>
              <p className="text-text-secondary">Available tiers:</p>
              <p className="text-green-400 pl-2">• foundation - Core concepts and terminology</p>
              <p className="text-yellow-400 pl-2">• triage - Incident response and analysis</p>
              <p className="text-red-400 pl-2">• deep-dive - Advanced techniques and internals</p>
              <p className="text-accent-purple mt-2">Usage: <span className="text-accent-neon">quiz [foundation|triage|deep-dive]</span></p>
            </div>
          );
          status = 'error';
        } else {
          // No tier specified - use legacy quiz
          const randomQuiz = forensicQuiz[Math.floor(Math.random() * forensicQuiz.length)];
          setCurrentQuiz(randomQuiz);
          setCurrentQuizBank(null);
          output = (
            <div className="space-y-2">
              <p className="text-accent-neon font-bold">═══ FORENSIC KNOWLEDGE TEST ═══</p>
              <p className="text-text-secondary text-sm">💡 Tip: Use <span className="text-accent-neon">quiz [foundation|triage|deep-dive]</span> for tiered challenges</p>
              <p className="text-text-primary mt-2">{randomQuiz.question}</p>
              <div className="mt-2 space-y-1">
                {randomQuiz.options.map((opt, idx) => (
                  <p key={idx} className="text-text-secondary pl-2">{opt}</p>
                ))}
              </div>
              <p className="text-accent-purple mt-3">
                Type your answer: <span className="text-accent-neon">a</span>, <span className="text-accent-neon">b</span>, <span className="text-accent-neon">c</span>, or <span className="text-accent-neon">d</span>
              </p>
            </div>
          );
        }
        break;

      case 'case':
        let caseData;
        if (args.length > 0) {
          caseData = cases.find(c => c.id === args[0]);
        } else {
          caseData = cases[Math.floor(Math.random() * cases.length)];
        }
        
        if (caseData) {
          output = (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <p className="text-accent-neon font-bold text-lg">═══ CASE FILE: {caseData.id.toUpperCase()} ═══</p>
              <p className="text-text-primary"><span className="text-accent-purple font-bold">Scenario:</span><br/>{caseData.scenario}</p>
              <p className="text-accent-purple font-bold mt-3">▸ Evidence Collected:</p>
              {caseData.artifacts.slice(0, 3).map((artifact, idx) => (
                <p key={idx} className="text-text-secondary text-sm pl-4">• {artifact.type}: {artifact.description}</p>
              ))}
            </div>
          );
        } else {
          output = 'Case not found.';
          status = 'error';
        }
        break;

      case 'mission':
        const missionSubCmd = args[0]?.toLowerCase();
        const missionsList = missions as Mission[];
        
        if (!missionSubCmd || missionSubCmd === 'list') {
          // List all missions with status
          output = (
            <div className="space-y-3">
              <p className="text-accent-neon font-bold text-lg">═══ CHALLENGE MISSIONS ═══</p>
              <p className="text-text-secondary text-sm">Complete missions to earn badges and XP</p>
              <div className="mt-2 space-y-2">
                {missionsList.map(m => {
                  const isComplete = completedMissions.has(m.id);
                  const isActive = activeMission?.missionId === m.id;
                  const diffColors: Record<string, string> = {
                    'foundation': 'text-green-400',
                    'triage': 'text-yellow-400',
                    'deep-dive': 'text-red-400'
                  };
                  return (
                    <div key={m.id} className={`p-2 rounded border ${isActive ? 'border-accent-neon bg-accent-neon/10' : isComplete ? 'border-green-500/50 bg-green-900/20' : 'border-border-glass'}`}>
                      <div className="flex items-center gap-2">
                        <span className={isComplete ? 'text-green-400' : isActive ? 'text-accent-neon' : 'text-text-secondary'}>
                          {isComplete ? '✓' : isActive ? '▸' : '○'}
                        </span>
                        <span className={`font-bold ${isComplete ? 'text-green-400' : 'text-text-primary'}`}>{m.title}</span>
                        <span className={`text-xs uppercase ${diffColors[m.difficulty]}`}>({m.difficulty})</span>
                      </div>
                      <p className="text-text-secondary text-sm pl-5 mt-1">{m.description}</p>
                      <p className="text-accent-purple text-xs pl-5">⏱ {m.estimatedTime} • {m.steps.length} steps • {m.reward.xp} XP</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-accent-purple mt-3">
                Start a mission: <span className="text-accent-neon">mission start &lt;id&gt;</span>
              </p>
            </div>
          );
        } else if (missionSubCmd === 'start') {
          const missionId = args[1];
          if (!missionId) {
            output = (
              <div className="space-y-1">
                <p className="text-red-400">Specify a mission ID</p>
                <p className="text-text-secondary">Usage: <span className="text-accent-neon">mission start mission-1</span></p>
                <p className="text-text-secondary">Available: {missionsList.map(m => m.id).join(', ')}</p>
              </div>
            );
            status = 'error';
          } else if (activeMission) {
            const currentMission = missionsList.find(m => m.id === activeMission.missionId);
            output = (
              <div className="space-y-1">
                <p className="text-yellow-400">⚠ Mission already in progress</p>
                <p className="text-text-secondary">Current: {currentMission?.title}</p>
                <p className="text-accent-purple">Use <span className="text-accent-neon">mission abandon</span> to quit current mission</p>
              </div>
            );
            status = 'error';
          } else {
            const mission = missionsList.find(m => m.id === missionId);
            if (mission) {
              // Check prerequisites
              const missingPrereqs = mission.prerequisites.filter(p => !completedMissions.has(p));
              if (missingPrereqs.length > 0) {
                output = (
                  <div className="space-y-1">
                    <p className="text-yellow-400">⚠ Prerequisites not met</p>
                    <p className="text-text-secondary">Complete these missions first:</p>
                    {missingPrereqs.map(p => {
                      const prereqMission = missionsList.find(m => m.id === p);
                      return <p key={p} className="text-accent-purple pl-2">• {prereqMission?.title || p}</p>;
                    })}
                  </div>
                );
                status = 'error';
              } else {
                setActiveMission({
                  missionId: mission.id,
                  currentStep: 0,
                  startedAt: Date.now(),
                  completedSteps: []
                });
                
                const firstStep = mission.steps[0];
                output = (
                  <div className="space-y-2">
                    <p className="text-accent-neon font-bold text-lg">═══ MISSION STARTED ═══</p>
                    <p className="text-accent-cyan font-bold">{mission.title}</p>
                    <p className="text-text-secondary">{mission.description}</p>
                    <div className="mt-3 p-3 bg-surface-elevated/50 border-l-2 border-accent-neon">
                      <p className="text-accent-cyan text-sm font-bold">OBJECTIVE 1/{mission.steps.length}:</p>
                      <p className="text-text-primary mt-1">{firstStep.instruction}</p>
                    </div>
                    <p className="text-accent-purple mt-2 text-sm">
                      💡 Type <span className="text-accent-neon">mission hint</span> if you need help
                    </p>
                  </div>
                );
              }
            } else {
              output = `Mission '${missionId}' not found.`;
              status = 'error';
            }
          }
        } else if (missionSubCmd === 'status') {
          if (!activeMission) {
            output = (
              <div className="space-y-1">
                <p className="text-text-secondary">No active mission</p>
                <p className="text-accent-purple">Use <span className="text-accent-neon">mission list</span> to see available missions</p>
              </div>
            );
            status = 'info';
          } else {
            const mission = missionsList.find(m => m.id === activeMission.missionId);
            if (mission) {
              const currentStep = mission.steps[activeMission.currentStep];
              const elapsed = Math.round((Date.now() - activeMission.startedAt) / 60000);
              output = (
                <div className="space-y-2">
                  <p className="text-accent-neon font-bold">═══ MISSION STATUS ═══</p>
                  <p className="text-accent-cyan font-bold">{mission.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-border-glass rounded-full h-2">
                      <div 
                        className="bg-accent-neon h-2 rounded-full transition-all"
                        style={{ width: `${(activeMission.currentStep / mission.steps.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-accent-neon text-sm">
                      {activeMission.currentStep}/{mission.steps.length}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">⏱ Time elapsed: {elapsed} min</p>
                  <div className="mt-3 p-2 bg-surface-elevated/50 border-l-2 border-accent-neon">
                    <p className="text-accent-cyan text-sm font-bold">CURRENT OBJECTIVE:</p>
                    <p className="text-text-primary">{currentStep.instruction}</p>
                  </div>
                </div>
              );
            }
          }
        } else if (missionSubCmd === 'hint') {
          if (!activeMission) {
            output = 'No active mission. Start one with: mission start <id>';
            status = 'error';
          } else {
            const mission = missionsList.find(m => m.id === activeMission.missionId);
            if (mission) {
              const currentStep = mission.steps[activeMission.currentStep];
              output = (
                <div className="space-y-2">
                  <p className="text-accent-cyan font-bold">💡 HINT</p>
                  <p className="text-text-secondary">{currentStep.hint}</p>
                  <p className="text-accent-purple text-sm mt-2">
                    Required command pattern: <span className="text-accent-neon">{currentStep.requiredCommand}</span>
                  </p>
                </div>
              );
              status = 'info';
            }
          }
        } else if (missionSubCmd === 'abandon') {
          if (!activeMission) {
            output = 'No active mission to abandon.';
            status = 'error';
          } else {
            const mission = missionsList.find(m => m.id === activeMission.missionId);
            setActiveMission(null);
            output = (
              <div className="space-y-1">
                <p className="text-yellow-400">Mission abandoned: {mission?.title}</p>
                <p className="text-text-secondary">Progress has been lost.</p>
              </div>
            );
            status = 'info';
          }
        } else {
          output = (
            <div className="space-y-1">
              <p className="text-red-400">Unknown mission command: {missionSubCmd}</p>
              <p className="text-text-secondary">Available: list, start, status, hint, abandon</p>
            </div>
          );
          status = 'error';
        }
        break;

      default:
        // Check if it's a forensic command
        const enhancedMatch = commandRegistry.commandsEnhanced.find((c) => c.name === mainCmd);
        const basicMatch = commandRegistry.commands.find((c) => c.command === mainCmd);
        const cmdData = (enhancedMatch ?? basicMatch) as (EnhancedCommandEntry | BasicCommandEntry | undefined);
        const isEnhanced = Boolean(enhancedMatch);

        if (cmdData) {
          setExecutedCategories((prev) => new Set(prev).add(cmdData.category));

          const outputText = isEnhanced
            ? enhancedMatch?.output_example
            : (basicMatch as BasicCommandEntry | undefined)?.simulatedOutput;

          if (outputText) {
            setHistory((prev) => [
              ...prev,
              {
                input: cmd,
                output: (
                  <div className="space-y-2">
                    <p className="text-accent-purple">▸ {cmdData.description}</p>
                    <div className="text-text-secondary font-mono text-sm mt-2 whitespace-pre-wrap">
                      <StreamingText text={outputText} speed={5} />
                    </div>
                    <p className="text-accent-purple text-sm mt-3 animate-fade-in" style={{ animationDelay: '1s' }}>
                      💡 Type <span className="text-accent-neon">explain {mainCmd}</span> for forensic context
                    </p>
                  </div>
                ),
                timestamp: Date.now(),
                status: 'success',
              },
            ]);
            setTerminalState('success');
            setTimeout(() => setTerminalState('idle'), 1000);
            return;
          }

          output = `Command '${mainCmd}' recognized but has no simulation.`;
          status = 'info';
        } else {
          output = (
            <div className="space-y-1">
              <p className="text-red-400">⚠ Command not found: <span className="text-accent-neon">{mainCmd}</span></p>
              <p className="text-text-secondary">Type <span className="text-accent-neon">help</span> for available forensic commands</p>
            </div>
          );
          status = 'error';
        }
    }

    addToHistory(cmd, output, status);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions.length > 0) {
        setInput(suggestions[activeSuggestionIndex]);
        setActiveSuggestionIndex(-1);
        setSuggestions([]);
      } else {
        handleCommand(input);
        setInput('');
        setHistoryIndex(-1);
        setSuggestions([]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveSuggestionIndex(prev => Math.max(0, prev - 1));
      } else {
        // History navigation
        const cmds = history.filter(h => h.input).map(h => h.input);
        if (cmds.length > 0) {
          const newIndex = historyIndex === -1 ? cmds.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(cmds[newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveSuggestionIndex(prev => Math.min(suggestions.length - 1, prev + 1));
      } else {
        // History navigation
        const cmds = history.filter(h => h.input).map(h => h.input);
        if (historyIndex !== -1) {
          const newIndex = Math.min(cmds.length - 1, historyIndex + 1);
          setHistoryIndex(newIndex);
          setInput(cmds[newIndex]);
          if (newIndex === cmds.length - 1) {
             // If at end, maybe clear? But standard terminal behavior keeps last
          }
        } else {
          setInput('');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0]);
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  const exportSession = (format: 'copy' | 'download') => {
    const text = history.map(h => {
      // Simple text extraction (imperfect for JSX but works for basic logs)
      return `[${new Date(h.timestamp).toLocaleTimeString()}] $ ${h.input}\n${typeof h.output === 'string' ? h.output : '[Rich Output]'}\n`;
    }).join('\n');

    if (format === 'copy') {
      navigator.clipboard.writeText(text);
      // Could add toast here
    } else {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forensic-session-${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
    }
  };

  // Render Helpers
  const getCategoryIcon = (cat: string) => {
    switch(cat.toLowerCase()) {
      case 'network': return <Wifi className="w-4 h-4" />;
      case 'disk': return <Database className="w-4 h-4" />;
      case 'memory': return <Cpu className="w-4 h-4" />;
      case 'malware': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const renderLabContent = () => {
    if (!activeLab) return null;
    switch (activeLab) {
      case 'netflow':
        return (
          <NetflowLab
            records={NETFLOW_FIXTURE}
            sortKey={labSessions.netflow.sortKey}
            sortDirection={labSessions.netflow.sortDirection}
            showOnlyFlagged={labSessions.netflow.showOnlyFlagged}
            onSortChange={updateNetflowSort}
            onToggleFlagFilter={toggleNetflowFlag}
          />
        );
      case 'timeline':
        return (
          <TimelineLab
            datasets={TIMELINE_DATASETS}
            activeCaseId={labSessions.timeline.activeCaseId}
            onCaseChange={changeTimelineCase}
          />
        );
      case 'hash':
        return (
          <HashVerifyLab
            state={labSessions.hash}
            onInputChange={handleHashInputChange}
            onVerify={handleHashVerify}
          />
        );
      case 'memory':
        return (
          <MemoryTriageLab
            processes={MEMORY_FIXTURE}
            riskFilter={labSessions.memory.riskFilter}
            showOnlyAnomalies={labSessions.memory.showOnlyAnomalies}
            onRiskChange={changeRiskFilter}
            onToggleAnomalyFilter={toggleAnomalyFilter}
          />
        );
      case 'stego':
        return (
          <StegoDetectLab
            state={labSessions.stego}
            onRun={runStegoPipeline}
          />
        );
      default:
        return null;
    }
  };

  const closeLab = useCallback(() => setActiveLab(null), []);

  return (
    <div className="w-full max-w-6xl mx-auto h-[700px] flex gap-4 font-mono text-sm">
      
      {/* Sidebar - Stats & Badges */}
      <div className="hidden md:flex w-64 flex-col gap-4">
        {/* System Status */}
        <div className="glass-panel p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-accent-neon border-b border-border-glass pb-2">
            <Activity className="w-4 h-4" />
            <span className="font-bold">SYSTEM STATUS</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Connection</span>
              <span className="text-green-400">SECURE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Encryption</span>
              <span className="text-accent-neon">AES-256</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Session ID</span>
              <span className="text-text-primary font-mono">#{sessionId}</span>
            </div>
          </div>
        </div>

        {/* Active Modules (Badges) */}
        <div className="glass-panel p-4 flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-accent-purple border-b border-border-glass pb-2">
            <Cpu className="w-4 h-4" />
            <span className="font-bold">ACTIVE MODULES</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(executedCategories).map(cat => (
              <div key={cat} className="flex items-center gap-1 bg-accent-neon/10 border border-accent-neon/30 px-2 py-1 rounded text-xs text-accent-neon animate-fade-in">
                {getCategoryIcon(cat)}
                <span>{cat.toUpperCase()}</span>
              </div>
            ))}
            {executedCategories.size === 0 && (
              <span className="text-text-tertiary text-xs italic">No modules active...</span>
            )}
          </div>
        </div>

        {/* Session Controls */}
        <div className="glass-panel p-4 flex flex-col gap-2">
          <button onClick={() => exportSession('copy')} className="flex items-center gap-2 text-text-secondary hover:text-accent-neon transition-colors text-xs p-2 hover:bg-white/5 rounded">
            <Copy className="w-4 h-4" /> Copy Session Log
          </button>
          <button onClick={() => exportSession('download')} className="flex items-center gap-2 text-text-secondary hover:text-accent-neon transition-colors text-xs p-2 hover:bg-white/5 rounded">
            <Download className="w-4 h-4" /> Export Transcript
          </button>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className={`flex-1 flex flex-col overflow-hidden shadow-2xl border rounded-lg transition-all duration-300 relative
        ${terminalState === 'error' ? 'border-red-500/50 terminal-glow-error' : 
          terminalState === 'success' ? 'border-accent-neon/50 terminal-glow-active' : 
          'border-accent-neon/30 terminal-glow'}
      `} style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(10, 14, 26, 0.85)' }}>
        
        {/* Scanlines Overlay */}
        <div className="scanline pointer-events-none"></div>
        <div className="scanline-moving pointer-events-none"></div>

        {/* Registry Error Banner */}
        {registryError && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/20 border-b border-red-500 p-2 text-center text-red-200 text-xs z-30 backdrop-blur-sm">
            ⚠ Command registry failed to load. Some commands may be unavailable.
          </div>
        )}

        {/* Terminal Header */}
        <div className="bg-bg-darker/90 p-3 flex items-center justify-between border-b border-accent-neon/30 z-20">
          <div className="flex items-center gap-3 text-text-secondary">
            <TerminalIcon className="w-5 h-5 text-accent-neon" />
            <span className="text-accent-neon font-bold">root@forensec</span>
            <span className="text-accent-purple">~/investigation</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-text-tertiary bg-bg-dark px-2 py-1 rounded border border-border-glass">
              <Command className="w-3 h-3" />
              <span>CMD+K</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 cursor-pointer hover:text-accent-neon transition-colors" />
              <Square className="w-3 h-3 cursor-pointer hover:text-accent-purple transition-colors" />
              <X className="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          ref={(el) => {
            if (el) {
              (messagesRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              (terminalBodyRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          tabIndex={0}
          className="flex-1 p-4 md:p-6 overflow-y-auto bg-transparent text-text-primary scrollbar-thin scrollbar-thumb-accent-neon/30 scrollbar-track-transparent cursor-text z-10 relative"
          onClick={focusInput}
          style={{
            overscrollBehavior: 'contain',
            touchAction: 'auto',
            WebkitOverflowScrolling: 'touch'
          } as React.CSSProperties}
        >
          {history.map((entry, i) => (
            <div key={i} className="mb-4 group">
              {entry.input && (
                <div className="flex gap-2 text-accent-neon/90 items-center">
                  <span className="font-bold text-xs opacity-50">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
                  <span className="font-bold">$</span>
                  <span className="flex-1 font-semibold">{entry.input}</span>
                  {entry.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  {entry.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              )}
              <div className={`whitespace-pre-wrap mt-1 pl-4 border-l-2 ${entry.status === 'error' ? 'border-red-500/30 text-red-200' : 'border-accent-neon/10 text-text-secondary'}`}>
                {entry.output}
              </div>
            </div>
          ))}
          
          {/* Input Area */}
          <div className="flex gap-2 items-center text-accent-neon relative">
            <span className="font-bold animate-pulse">$</span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none text-text-primary caret-accent-neon font-bold"
                placeholder="Type a command..."
                spellCheck={false}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls={suggestions.length > 0 ? suggestionListId : undefined}
                aria-activedescendant={activeSuggestionIndex >= 0 ? `${suggestionListId}-${activeSuggestionIndex}` : undefined}
              />
              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <div 
                  id={suggestionListId}
                  role="listbox"
                  aria-label="Command suggestions"
                  className="absolute bottom-full left-0 mb-2 w-64 bg-bg-darker border border-accent-neon/30 rounded shadow-glass overflow-hidden z-50"
                >
                  {suggestions.map((s, idx) => (
                    <div 
                      key={s}
                      role="option"
                      aria-selected={idx === activeSuggestionIndex}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between ${idx === activeSuggestionIndex ? 'bg-accent-neon/20 text-accent-neon' : 'text-text-secondary hover:bg-white/5'}`}
                      onClick={() => {
                        setInput(s);
                        setSuggestions([]);
                        inputRef.current?.focus();
                      }}
                    >
                      <span>{s}</span>
                      {idx === activeSuggestionIndex && <ChevronRight className="w-3 h-3" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Command Palette Modal */}
      {isPaletteOpen && (
        <div 
          className={`fixed inset-0 z-[100] flex items-start justify-center pt-32 bg-black/60 ${supportsBackdrop ? 'backdrop-blur-sm' : 'bg-black/80'}`}
          onClick={() => setIsPaletteOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-bg-darker border border-accent-neon/50 rounded-lg shadow-neon-strong overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border-glass flex items-center gap-3">
              <Search className="w-5 h-5 text-accent-neon" />
              <input
                ref={paletteInputRef}
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-lg text-text-primary placeholder-text-tertiary"
                placeholder="Search commands..."
                aria-autocomplete="list"
                aria-controls={paletteListId}
                aria-activedescendant={paletteActiveIndex >= 0 ? `${paletteListId}-${paletteActiveIndex}` : undefined}
                value={paletteSearch}
                onChange={e => {
                  setPaletteSearch(e.target.value);
                  setPaletteActiveIndex(0);
                }}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setIsPaletteOpen(false);
                    setPaletteActiveIndex(0);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPaletteActiveIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPaletteActiveIndex(prev => Math.max(0, prev - 1));
                  } else if (e.key === 'Enter' && filteredCommands.length > 0) {
                    e.preventDefault();
                    const targetCmd = paletteActiveIndex >= 0 ? filteredCommands[paletteActiveIndex] : filteredCommands[0];
                    handleCommand(targetCmd);
                    setIsPaletteOpen(false);
                    setPaletteSearch('');
                    setPaletteActiveIndex(0);
                  }
                }}
              />
              <div className="text-xs text-text-tertiary border border-border-glass px-2 py-1 rounded">ESC</div>
            </div>
            <div id={paletteListId} role="listbox" aria-label="Command palette" className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-text-tertiary">No commands found</div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd}
                    id={`${paletteListId}-${idx}`}
                    role="option"
                    aria-selected={idx === paletteActiveIndex}
                    className={`w-full text-left px-4 py-3 rounded flex items-center justify-between group hover:bg-accent-neon/10 transition-colors ${idx === paletteActiveIndex ? 'bg-accent-neon/20 text-accent-neon' : 'bg-white/5'}`}
                    onClick={() => {
                      handleCommand(cmd);
                      setIsPaletteOpen(false);
                      setPaletteSearch('');
                      setPaletteActiveIndex(0);
                    }}
                  >
                    <span className={`font-mono ${idx === paletteActiveIndex ? 'text-accent-neon' : 'text-text-primary group-hover:text-accent-neon'}`}>{cmd}</span>
                    <span className="text-xs text-text-tertiary group-hover:text-accent-neon/70">Run Command</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <ErrorBoundary fallback={<div className="text-red-400 p-4 text-center">Lab failed to load. Please try again.</div>}>
        <Suspense fallback={<div className="text-accent-neon p-4 text-center animate-pulse">Loading lab...</div>}>
          <LabPanel
            isOpen={!!activeLab}
            title={activeLab ? LAB_METADATA[activeLab].title : ''}
            subtitle={activeLab ? LAB_METADATA[activeLab].subtitle : ''}
            onClose={closeLab}
          >
            {renderLabContent()}
          </LabPanel>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}