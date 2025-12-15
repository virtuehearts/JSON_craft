import { useMemo } from 'react';
import { VisualEntry } from '../types/visual';
import { clsx } from 'clsx';

interface Props {
  entry: VisualEntry;
  onDelete?: () => void;
}

export default function VisualEntryCard({ entry, onDelete }: Props) {
  const createdLabel = useMemo(() => new Date(entry.createdAt).toLocaleString(), [entry.createdAt]);

  const copyJson = async () => {
    await navigator.clipboard.writeText(entry.json);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 shadow">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="md:w-1/2">
          <img
            src={entry.imageData}
            alt={entry.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Image · JSON Pair</p>
              <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
              <p className="text-xs text-gray-400">Captured {createdLabel}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={copyJson}
                className="rounded border border-slate-700 px-3 py-2 text-gray-100 transition hover:border-accent"
              >
                Copy JSON
              </button>
              <button
                onClick={onDelete}
                className={clsx('rounded border px-3 py-2 transition', {
                  'border-rose-600 text-rose-200 hover:bg-rose-600/10': !!onDelete,
                  'border-slate-800 text-slate-700': !onDelete
                })}
                disabled={!onDelete}
              >
                Delete
              </button>
            </div>
          </div>
          {entry.notes && <p className="text-sm text-gray-300">{entry.notes}</p>}
          <pre className="scroll-shadow max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs text-amber-50">
            {entry.json}
          </pre>
        </div>
      </div>
    </div>
  );
}
