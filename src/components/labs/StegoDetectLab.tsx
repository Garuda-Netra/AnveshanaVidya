export type StepStatus = 'pending' | 'running' | 'complete';

export interface StegoStep {
  id: string;
  label: string;
  detail: string;
  status: StepStatus;
  result?: string;
}

export interface StegoDetectState {
  steps: StegoStep[];
  status: 'idle' | 'running' | 'complete';
  lastRunAt?: string;
}

export interface StegoDetectLabProps {
  state: StegoDetectState;
  onRun: () => void;
}

export function StegoDetectLab({ state, onRun }: StegoDetectLabProps) {
  const disabled = state.status === 'running';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-text-secondary text-sm">Mock pipeline: LSB scan → Chi-square → Metadata audit</p>
          {state.lastRunAt && <p className="text-xs text-text-tertiary">Last run: {state.lastRunAt}</p>}
        </div>
        <button onClick={onRun} disabled={disabled} className={`px-4 py-2 rounded border text-sm ${disabled ? 'border-border-glass text-text-tertiary cursor-not-allowed' : 'border-accent-neon text-accent-neon hover:bg-accent-neon/10 transition-colors'}`}>
          {state.status === 'complete' ? 'Re-run detection' : 'Run detection'}
        </button>
      </div>

      <ol className="space-y-3" aria-live="polite">
        {state.steps.map(step => (
          <li key={step.id} className={`glass-panel p-4 border-l-4 ${step.status === 'complete' ? 'border-l-accent-neon' : step.status === 'running' ? 'border-l-accent-warning' : 'border-l-border-glass'}`}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-text-primary font-semibold">{step.label}</p>
              <span className={`text-xs uppercase tracking-wide ${step.status === 'complete' ? 'text-accent-neon' : step.status === 'running' ? 'text-accent-warning' : 'text-text-tertiary'}`}>
                {step.status}
              </span>
            </div>
            <p className="text-text-secondary text-sm mt-1">{step.detail}</p>
            {step.result && <p className="text-accent-purple text-sm mt-2">Result: {step.result}</p>}
          </li>
        ))}
      </ol>
      {state.status === 'complete' && (
        <div className="glass-panel p-4 border border-accent-neon/40">
          <p className="text-text-primary font-semibold">Summary</p>
          <p className="text-text-secondary text-sm mt-1">Carrier PNG contains staged ZIP archive fragments embedded via LSB. Extraction password derived from EXIF Creator field.</p>
        </div>
      )}
    </div>
  );
}
