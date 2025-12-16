import { useEffect, useMemo, useState } from 'react';

interface JsonPromptEditorProps {
  jsonText: string;
  onChange: (nextJson: string) => void;
  onValidityChange?: (hasError: boolean) => void;
}

interface EditorField {
  path: (string | number)[];
  value: unknown;
}

const isPrimitive = (value: unknown) =>
  value === null || ['string', 'number', 'boolean'].includes(typeof value);

function collectFields(value: unknown, path: (string | number)[] = [], acc: EditorField[] = []): EditorField[] {
  if (isPrimitive(value)) {
    acc.push({ path, value });
    return acc;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectFields(item, [...path, index], acc));
    return acc;
  }

  if (typeof value === 'object' && value) {
    Object.entries(value).forEach(([key, val]) => collectFields(val, [...path, key], acc));
  }

  return acc;
}

function updateValue(current: unknown, path: (string | number)[], nextValue: unknown): unknown {
  if (!path.length) return nextValue;
  const [head, ...rest] = path;

  if (Array.isArray(current)) {
    const cloned = [...current];
    cloned[head as number] = updateValue(cloned[head as number], rest, nextValue);
    return cloned;
  }

  if (typeof current === 'object' && current) {
    return {
      ...(current as Record<string, unknown>),
      [head]: updateValue((current as Record<string, unknown>)[head as string], rest, nextValue)
    };
  }

  return current;
}

export default function JsonPromptEditor({ jsonText, onChange, onValidityChange }: JsonPromptEditorProps) {
  const [draft, setDraft] = useState(jsonText);
  const [parseError, setParseError] = useState<string | null>(() => {
    try {
      JSON.parse(jsonText);
      return null;
    } catch (error) {
      return (error as Error).message;
    }
  });
  const [parsed, setParsed] = useState<unknown | null>(() => {
    try {
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setDraft(jsonText);
  }, [jsonText]);

  useEffect(() => {
    try {
      const data = JSON.parse(draft);
      setParsed(data);
      setParseError(null);
    } catch (error) {
      setParsed(null);
      setParseError((error as Error).message);
    }
  }, [draft]);

  const fields = useMemo(() => (parsed ? collectFields(parsed) : []), [parsed]);

  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(Boolean(parseError));
    }
  }, [parseError, onValidityChange]);

  const handleFieldChange = (path: (string | number)[], value: unknown) => {
    if (parsed === null) return;
    const updated = updateValue(parsed, path, value);
    const pretty = JSON.stringify(updated, null, 2);
    setDraft(pretty);
    onChange(pretty);
  };

  const parseFriendlyValue = (fieldValue: unknown, raw: string) => {
    if (typeof fieldValue === 'number') {
      const numeric = Number(raw);
      return Number.isFinite(numeric) ? numeric : fieldValue;
    }
    if (typeof fieldValue === 'boolean') {
      return raw === 'true';
    }
    if (raw.toLowerCase() === 'null') return null;
    return raw;
  };

  const handleTextareaChange = (value: string) => {
    setDraft(value);
    try {
      const updated = JSON.parse(value);
      setParseError(null);
      onChange(JSON.stringify(updated, null, 2));
    } catch (error) {
      setParseError((error as Error).message);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <p className="uppercase tracking-[0.2em] text-gray-500">Raw JSON</p>
          <span className="text-[11px] text-gray-500">Editable text</span>
        </div>
        <textarea
          className="mt-2 min-h-[200px] w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-[12px] text-amber-50 shadow-inner focus:border-accent focus:outline-none"
          value={draft}
          onChange={(event) => handleTextareaChange(event.target.value)}
        />
        {parseError && <p className="mt-2 text-xs text-rose-300">{parseError}</p>}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <p className="uppercase tracking-[0.2em] text-gray-500">Editable fields</p>
          <span className="text-[11px] text-gray-500">Update values without touching the JSON syntax</span>
        </div>
        <div className="mt-3 grid gap-2">
          {!fields.length && <p className="text-xs text-gray-400">Add valid JSON to unlock field editing.</p>}
          {fields.map((field) => {
            const label = field.path.map(String).join(' › ');
            const value = field.value;
            const isLongString = typeof value === 'string' && value.length > 80;
            return (
              <label key={label} className="space-y-1 rounded border border-slate-800/70 bg-slate-900/40 p-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</span>
                {typeof value === 'boolean' ? (
                  <select
                    value={String(value)}
                    onChange={(event) => handleFieldChange(field.path, parseFriendlyValue(value, event.target.value))}
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-gray-100 focus:border-accent focus:outline-none"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={value === null ? 'null' : String(value)}
                    onChange={(event) => handleFieldChange(field.path, parseFriendlyValue(value, event.target.value))}
                    className={
                      'w-full rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none ' +
                      (isLongString ? 'font-mono text-[12px]' : '')
                    }
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
