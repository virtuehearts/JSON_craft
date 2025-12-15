import { PromptTemplate } from '../types/prompt';
import { clsx } from 'clsx';
import { usePromptStore } from '../state/promptStore';

interface Props {
  template: PromptTemplate;
  compact?: boolean;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onApply?: () => void;
}

export default function PromptCard({ template, compact, onDelete, onDuplicate, onApply }: Props) {
  const { setActiveTemplate } = usePromptStore();
  const share = async () => {
    await navigator.clipboard.writeText(template.json);
  };
  const handleApply = () => {
    setActiveTemplate(template.id);
    onApply?.();
  };
  return (
    <div
      className={clsx('rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm shadow', {
        'flex items-center justify-between gap-3': compact
      })}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">v{template.version}</p>
            <h4 className="font-semibold text-white">{template.name}</h4>
          </div>
          <div className="text-[10px] text-gray-400">{new Date(template.updatedAt).toLocaleDateString()}</div>
        </div>
        {!compact && (
          <>
            <p className="mt-1 text-xs text-gray-400">{template.description}</p>
            <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-amber-50">
              {template.json}
            </pre>
          </>
        )}
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
          {template.tags.map((tag) => (
            <span key={tag} className="rounded border border-slate-700 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 text-[11px]">
        <button onClick={handleApply} className="rounded bg-accent px-2 py-1 font-semibold text-ink">
          Apply
        </button>
        <button onClick={onDuplicate} className="rounded border border-slate-700 px-2 py-1 text-gray-200">
          Duplicate
        </button>
        <button onClick={share} className="rounded border border-slate-700 px-2 py-1 text-gray-200">
          Copy JSON
        </button>
        <button onClick={onDelete} className="rounded border border-rose-600 px-2 py-1 text-rose-200">
          Delete
        </button>
      </div>
    </div>
  );
}
