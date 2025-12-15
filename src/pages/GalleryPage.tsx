import { useEffect } from 'react';
import { usePromptStore } from '../state/promptStore';
import PromptCard from '../components/PromptCard';
import GalleryToolbar from '../components/GalleryToolbar';

export default function GalleryPage() {
  const { templates, removeTemplate, duplicateTemplate, filteredTemplates, init } = usePromptStore();
  useEffect(() => {
    init();
  }, [init]);
  const list = filteredTemplates.length ? filteredTemplates : templates;
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Prompt Gallery</h2>
          <p className="text-sm text-gray-400">Save, share, and remix JSON prompt styles.</p>
        </div>
        <GalleryToolbar />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((template) => (
          <PromptCard
            key={template.id}
            template={template}
            onDelete={() => removeTemplate(template.id)}
            onDuplicate={() => duplicateTemplate(template.id)}
          />
        ))}
        {!list.length && (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-gray-400">
            No prompts saved yet. Create one in the editor and save it to appear here.
          </div>
        )}
      </div>
    </div>
  );
}
