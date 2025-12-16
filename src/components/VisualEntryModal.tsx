import { useEffect, useMemo, useState } from 'react';
import { VisualEntry } from '../types/visual';
import JsonPromptEditor from './JsonPromptEditor';

interface Props {
  entry: VisualEntry;
  onClose: () => void;
  onDelete?: () => void;
  onSaveJson: (json: string) => Promise<void> | void;
  onEditViaChat: (json: string) => void;
}

export default function VisualEntryModal({ entry, onClose, onDelete, onSaveJson, onEditViaChat }: Props) {
  const [jsonDraft, setJsonDraft] = useState(entry.json);
  const [isSaving, setIsSaving] = useState(false);
  const [hasParseError, setHasParseError] = useState(false);
  const createdLabel = useMemo(() => new Date(entry.createdAt).toLocaleString(), [entry.createdAt]);

  useEffect(() => {
    setJsonDraft(entry.json);
  }, [entry]);

  const copyJson = async () => {
    await navigator.clipboard.writeText(jsonDraft);
  };

  const handleSave = async () => {
    if (hasParseError) return;
    setIsSaving(true);
    await onSaveJson(jsonDraft);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl lg:flex-row">
        <button
          type="button"
          className="absolute right-4 top-4 rounded border border-slate-700 px-2 py-1 text-xs text-gray-200 hover:border-accent"
          onClick={onClose}
        >
          Close
        </button>

        <div className="flex-1 overflow-auto border-b border-slate-900/60 bg-slate-900/60 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-3 p-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Image</p>
              <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
              <p className="text-xs text-gray-400">Captured {createdLabel}</p>
              {entry.notes && <p className="text-sm text-gray-300">{entry.notes}</p>}
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
              <img src={entry.imageData} alt={entry.title} className="h-full max-h-[520px] w-full object-contain" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-900 pb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">JSON Output</p>
              <h4 className="text-lg font-semibold text-white">Edit this prompt</h4>
              <p className="text-xs text-gray-400">Matches the JSON prompt editor layout.</p>
            </div>
            <button
              type="button"
              className="rounded border border-slate-700 px-3 py-2 text-xs text-gray-100 transition hover:border-accent"
              onClick={copyJson}
            >
              Copy JSON
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <JsonPromptEditor
              jsonText={jsonDraft}
              onChange={setJsonDraft}
              onValidityChange={setHasParseError}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 pt-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-2 font-semibold text-gray-200 transition hover:border-accent disabled:opacity-60"
                onClick={handleSave}
                disabled={isSaving || hasParseError}
              >
                {isSaving ? 'Saving…' : 'Edit JSON'}
              </button>
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-2 font-semibold text-gray-200 transition hover:border-accent"
                onClick={() => onEditViaChat(jsonDraft)}
              >
                Edit via Chat
              </button>
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-2 font-semibold text-gray-200 transition hover:border-accent"
                onClick={copyJson}
              >
                Copy JSON
              </button>
              <button
                type="button"
                className="rounded border border-slate-800 bg-slate-900 px-3 py-2 font-semibold text-gray-500"
                disabled
              >
                Render on FAL.ai
              </button>
            </div>
            <div className="flex gap-2 text-xs">
              {onDelete && (
                <button
                  type="button"
                  className="rounded border border-rose-600 px-3 py-2 font-semibold text-rose-100 transition hover:bg-rose-600/10"
                  onClick={onDelete}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-2 font-semibold text-gray-200 transition hover:border-accent"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
