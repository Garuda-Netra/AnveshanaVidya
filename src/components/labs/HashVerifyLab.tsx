import { FormEvent } from 'react';

export interface HashVerifyState {
  knownSha256: string;
  referenceLabel: string;
  userInput: string;
  lastResult: 'match' | 'mismatch' | 'idle';
}

export interface HashVerifyLabProps {
  state: HashVerifyState;
  onInputChange: (value: string) => void;
  onVerify: () => void;
}

export function HashVerifyLab({ state, onInputChange, onVerify }: HashVerifyLabProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onVerify();
  };

  const hint = state.lastResult === 'match'
    ? '✔ Hashes match. Evidence maintains integrity.'
    : state.lastResult === 'mismatch'
      ? '⚠ Hash mismatch detected. Re-acquire image.'
      : 'Provide SHA-256 hash to compare against baseline.';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
      <div className="glass-panel p-4 space-y-1">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Reference artifact</p>
        <p className="text-text-primary font-semibold">{state.referenceLabel}</p>
        <p className="text-xs font-mono text-accent-neon break-all">SHA-256: {state.knownSha256}</p>
      </div>
      <label className="flex flex-col gap-2 text-sm text-text-secondary" htmlFor="hash-input">
        Provide examiner hash
        <input
          id="hash-input"
          type="text"
          value={state.userInput}
          onChange={(event) => onInputChange(event.target.value)}
          className="w-full bg-bg-dark border border-border-glass rounded px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-neon"
          placeholder="Paste SHA-256 string"
          aria-describedby="hash-hint"
        />
      </label>
      <button type="submit" className="px-4 py-2 rounded bg-accent-neon/20 text-accent-neon border border-accent-neon/50 hover:bg-accent-neon/30 transition-colors">
        Verify hash
      </button>
      <p id="hash-hint" className={`text-sm ${state.lastResult === 'mismatch' ? 'text-red-400' : 'text-text-secondary'}`}>{hint}</p>
    </form>
  );
}
