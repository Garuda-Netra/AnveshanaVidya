import { ChangeEvent } from 'react';

export interface CaseEvent {
  time: string;
  label: string;
  detail: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface TimelineDataset {
  caseId: string;
  events: CaseEvent[];
}

export interface TimelineLabProps {
  datasets: TimelineDataset[];
  activeCaseId: string;
  onCaseChange: (caseId: string) => void;
}

const severityColors: Record<CaseEvent['severity'], string> = {
  low: 'bg-text-tertiary',
  medium: 'bg-accent-warning',
  high: 'bg-accent-purple',
  critical: 'bg-red-500'
};

export function TimelineLab({ datasets, activeCaseId, onCaseChange }: TimelineLabProps) {
  const activeData = datasets.find(d => d.caseId === activeCaseId) ?? datasets[0];

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onCaseChange(event.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="timeline-case" className="text-sm text-text-secondary">Case context</label>
        <select
          id="timeline-case"
          value={activeData.caseId}
          onChange={handleChange}
          className="bg-bg-dark border border-border-glass rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-neon"
        >
          {datasets.map(dataset => (
            <option key={dataset.caseId} value={dataset.caseId}>{dataset.caseId.replace(/-/g, ' ')}</option>
          ))}
        </select>
        <span className="text-text-tertiary text-xs">Events sourced from case.events (deterministic)</span>
      </div>

      <div className="relative pl-4">
        <div className="absolute top-4 bottom-4 left-[12px] w-px bg-border-glass" aria-hidden="true" />
        <ol className="space-y-6" aria-live="polite">
          {activeData.events.map((event, index) => (
            <li key={`${activeData.caseId}-${event.time}-${index}`} className="relative flex gap-4">
              <div className="flex flex-col items-center" aria-hidden="true">
                <span className={`w-3 h-3 rounded-full ${severityColors[event.severity]} shadow-neon`} />
                {index < activeData.events.length - 1 && <span className="flex-1 w-px bg-border-glass" />}
              </div>
              <div className="flex-1 glass-panel p-4">
                <p className="text-xs font-mono text-text-tertiary">{event.time} UTC</p>
                <p className="text-text-primary font-semibold">{event.label}</p>
                <p className="text-text-secondary text-sm mt-1">{event.detail}</p>
                <span className="text-xs uppercase tracking-wide text-text-tertiary">Severity: {event.severity}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
