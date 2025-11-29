import { useMemo } from 'react';

export type RiskFilter = 'all' | 'medium' | 'high';

export interface MemoryProcess {
  pid: number;
  name: string;
  user: string;
  integrity: 'low' | 'medium' | 'high' | 'system';
  anomaly: 'none' | 'credential-dump' | 'unsigned-module' | 'suspicious-network';
  note: string;
  risk: 'low' | 'medium' | 'high';
}

export interface MemoryTriageLabProps {
  processes: MemoryProcess[];
  riskFilter: RiskFilter;
  showOnlyAnomalies: boolean;
  onRiskChange: (risk: RiskFilter) => void;
  onToggleAnomalyFilter: () => void;
}

const riskColor: Record<MemoryProcess['risk'], string> = {
  low: 'text-text-tertiary',
  medium: 'text-accent-warning',
  high: 'text-red-400'
};

export function MemoryTriageLab({ processes, riskFilter, showOnlyAnomalies, onRiskChange, onToggleAnomalyFilter }: MemoryTriageLabProps) {
  const filtered = useMemo(() => processes.filter(proc => {
    if (showOnlyAnomalies && proc.anomaly === 'none') return false;
    if (riskFilter === 'all') return true;
    return proc.risk === riskFilter;
  }), [processes, riskFilter, showOnlyAnomalies]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Risk filter</legend>
          {(['all', 'medium', 'high'] as RiskFilter[]).map(risk => (
            <button
              key={risk}
              onClick={() => onRiskChange(risk)}
              className={`px-3 py-1 rounded-full border text-xs uppercase tracking-wide ${riskFilter === risk ? 'border-accent-neon text-accent-neon' : 'border-border-glass text-text-secondary hover:text-accent-neon'}`}
            >
              {risk === 'all' ? 'All' : `${risk} risk`}
            </button>
          ))}
        </fieldset>
        <button onClick={onToggleAnomalyFilter} className={`px-3 py-1 rounded-full border text-xs ${showOnlyAnomalies ? 'border-red-400 text-red-400' : 'border-border-glass text-text-secondary hover:text-accent-neon'}`}>
          {showOnlyAnomalies ? 'Showing anomalies only' : 'Show anomalies only'}
        </button>
        <span className="text-text-tertiary text-xs">Snapshot: Volatility pslist / malfind fusion.</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-glass">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-dark/70 text-text-secondary">
            <tr>
              <th className="px-3 py-2 text-left">PID</th>
              <th className="px-3 py-2 text-left">Process</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Integrity</th>
              <th className="px-3 py-2 text-left">Risk</th>
              <th className="px-3 py-2 text-left">Findings</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(proc => (
              <tr key={proc.pid} className="border-t border-border-glass/40">
                <td className="px-3 py-2 font-mono text-xs">{proc.pid}</td>
                <td className="px-3 py-2 font-semibold text-text-primary">{proc.name}</td>
                <td className="px-3 py-2 text-text-secondary">{proc.user}</td>
                <td className="px-3 py-2 text-text-secondary capitalize">{proc.integrity}</td>
                <td className={`px-3 py-2 font-semibold ${riskColor[proc.risk]}`}>{proc.risk}</td>
                <td className="px-3 py-2 text-text-secondary text-sm">{proc.anomaly === 'none' ? 'No anomaly' : proc.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-text-tertiary text-sm py-6">No processes match current filters.</p>
        )}
      </div>
    </div>
  );
}
