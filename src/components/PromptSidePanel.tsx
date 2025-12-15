import { useEffect, useState } from 'react';
import { usePromptStore } from '../state/promptStore';
import PromptEditor from './PromptEditor';
import PromptCard from './PromptCard';

export default function PromptSidePanel() {
  const { templates, activeTemplate, setActiveTemplate, saveTemplate, init } = usePromptStore();
  const [name, setName] = useState('Custom template');
  const [json, setJson] = useState('');
  const [tags, setTags] = useState('session');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (activeTemplate) {
      setJson(activeTemplate.json);
      setName(activeTemplate.name);
      setTags(activeTemplate.tags.join(','));
    }
  }, [activeTemplate]);

  const handleSave = async () => {
    await saveTemplate({ name, json, tags: tags.split(',').map((t) => t.trim()), description: 'Custom session style' });
    setName('Custom template');
  };

  return (
    <div className="sticky top-4 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Prompt style</p>
          <h3 className="text-lg font-semibold text-white">JSON schema assistant</h3>
        </div>
        <div className="text-xs text-gray-500">Active: {activeTemplate?.name || 'none'}</div>
      </div>
      <PromptEditor value={json} onChange={setJson} />
      <div className="flex gap-2 text-xs text-gray-400">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-1/2 rounded border border-slate-700 bg-slate-900 px-2 py-1"
          placeholder="Template name"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-1/2 rounded border border-slate-700 bg-slate-900 px-2 py-1"
          placeholder="tags"
        />
      </div>
      <button
        onClick={handleSave}
        className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-ink transition hover:brightness-95"
      >
        Save template
      </button>
      <div className="border-t border-slate-800 pt-3">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-400">Quick presets</p>
        <div className="flex flex-col gap-2">
          {templates.slice(0, 3).map((template) => (
            <PromptCard
              key={template.id}
              template={template}
              compact
              onDelete={() => setActiveTemplate(null)}
              onDuplicate={() => setActiveTemplate(template.id)}
              onApply={() => setActiveTemplate(template.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
