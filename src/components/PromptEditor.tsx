import { useEffect, useMemo, useState } from 'react';
import { promptSchema } from '../lib/validators';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PromptEditor({ value, onChange }: Props) {
  const [lint, setLint] = useState<string | null>(null);

  useEffect(() => {
    if (!value.trim()) {
      setLint(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      const validation = promptSchema.safeParse(parsed);
      setLint(validation.success ? 'Valid JSON prompt' : validation.error.errors[0].message);
    } catch (error) {
      setLint((error as Error).message);
    }
  }, [value]);

  const placeholder = useMemo(
    () =>
      JSON.stringify(
        {
          style: 'editor style name',
          subject: { description: 'who/what', expression: 'neutral' },
          background: { layer: 'scene layer' },
          lighting: 'light quality',
          mood: 'tone'
        },
        null,
        2
      ),
    []
  );

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-48 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-amber-50 shadow-inner focus:border-accent focus:outline-none"
      />
      <div className="mt-1 text-xs text-gray-400">
        {lint ? lint : 'Schema-aware JSON editor. Paste presets or import a bundle.'}
      </div>
    </div>
  );
}
