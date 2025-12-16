import { VisualEntry } from '../types/visual';

interface Props {
  entry: VisualEntry;
  onSelect: () => void;
  onDelete?: () => void;
}

export default function VisualEntryThumbnail({ entry, onSelect, onDelete }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 shadow-md">
      <button type="button" className="block h-full w-full" onClick={onSelect}>
        <img
          src={entry.imageData}
          alt={entry.title}
          className="aspect-[4/5] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </button>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent opacity-90" />
      <div className="absolute inset-x-0 bottom-0 flex items-start justify-between gap-2 p-3 text-left">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Capture</p>
          <p className="text-sm font-semibold text-white line-clamp-2">{entry.title}</p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="pointer-events-auto rounded border border-rose-600/60 bg-slate-950/80 px-2 py-1 text-[11px] text-rose-100 opacity-0 transition focus:opacity-100 focus:outline-none group-hover:opacity-100"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
