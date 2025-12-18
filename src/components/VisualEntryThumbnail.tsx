import { useMemo } from 'react';
import { VisualEntry, VisualJsonContent } from '../types/visual';

interface Props {
  entry: VisualEntry;
  onSelect: () => void;
  onDelete?: () => void;
}

function parseJsonContent(json: string): VisualJsonContent {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}

export default function VisualEntryThumbnail({ entry, onSelect, onDelete }: Props) {
  const content = useMemo(() => parseJsonContent(entry.json), [entry.json]);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 shadow-md transition hover:border-slate-700">
      <button type="button" className="block" onClick={onSelect}>
        <img
          src={entry.imageData}
          alt={entry.title}
          className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </button>
      <div className="flex flex-1 flex-col p-4 text-left">
        <h3 className="mb-1 font-semibold text-white line-clamp-2">{entry.title}</h3>
        <p className="mb-3 text-sm text-gray-400 line-clamp-3">{content.description || 'No description available.'}</p>

        {content.tags && (
          <div className="mb-3 flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
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
    </div>
  );
}
