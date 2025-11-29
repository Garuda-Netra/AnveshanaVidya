import { useMemo } from 'react';

export type NetflowSortKey = 'time' | 'source' | 'destination' | 'bytes' | 'flags';

export interface NetflowRecord {
  id: string;
  time: string;
  source: string;
  destination: string;
  bytes: number;
  protocol: string;
  flags: 'benign' | 'suspicious' | 'critical';
  note: string;
}

export interface NetflowLabProps {
  records: NetflowRecord[];
  sortKey: NetflowSortKey;
  sortDirection: 'asc' | 'desc';
  showOnlyFlagged: boolean;
  onSortChange: (key: NetflowSortKey, direction: 'asc' | 'desc') => void;
  onToggleFlagFilter: () => void;
}

const flagColors: Record<NetflowRecord['flags'], string> = {
  benign: 'text-text-secondary border-text-tertiary',
  suspicious: 'text-accent-warning border-accent-warning',
  critical: 'text-red-400 border-red-500'
};

export function NetflowLab({ records, sortKey, sortDirection, showOnlyFlagged, onSortChange, onToggleFlagFilter }: NetflowLabProps) {
  const sorted = useMemo(() => {
    const filtered = showOnlyFlagged ? records.filter(r => r.flags !== 'benign') : records;
    return [...filtered].sort((a, b) => {
      let first: string | number = a[sortKey];
      let second: string | number = b[sortKey];

      if (sortKey === 'bytes') {
        first = a.bytes;
        second = b.bytes;
      }

      if (first < second) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (first > second) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [records, showOnlyFlagged, sortKey, sortDirection]);

  const handleSort = (key: NetflowSortKey) => {
    const nextDirection: 'asc' | 'desc' = key === sortKey ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    onSortChange(key, nextDirection);
  };

  const headers: { key: NetflowSortKey; label: string }[] = [
    { key: 'time', label: 'Time' },
    { key: 'source', label: 'Source' },
    { key: 'destination', label: 'Destination' },
    { key: 'bytes', label: 'Bytes' },
    { key: 'flags', label: 'Flag' }
  ];

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onToggleFlagFilter} className={`px-3 py-1 text-xs rounded-full border transition ${showOnlyFlagged ? 'border-accent-neon text-accent-neon' : 'border-border-glass text-text-secondary hover:text-accent-neon'}`}>
          {showOnlyFlagged ? 'Showing flagged only' : 'Show flagged only'}
        </button>
        <p className="text-text-tertiary text-sm">Deterministic capture: Palo Alto NetFlow export (UTC).</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border-glass">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-dark/80 text-text-secondary">
            <tr>
              {headers.map(({ key, label }) => (
                <th key={key} className="px-4 py-2 text-left font-semibold">
                  <button onClick={() => handleSort(key)} className="inline-flex items-center gap-1 text-left">
                    {label}
                    {sortKey === key && <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                </th>
              ))}
              <th className="px-4 py-2 text-left font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(record => (
              <tr key={record.id} className="border-t border-border-glass/40">
                <td className="px-4 py-2 font-mono text-xs text-text-secondary">{record.time}</td>
                <td className="px-4 py-2 font-mono text-xs">{record.source}</td>
                <td className="px-4 py-2 font-mono text-xs">{record.destination}</td>
                <td className="px-4 py-2 font-mono text-xs">{record.bytes.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full border text-xs uppercase tracking-wide ${flagColors[record.flags]}`}>
                    {record.flags}
                  </span>
                </td>
                <td className="px-4 py-2 text-text-secondary">{record.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
