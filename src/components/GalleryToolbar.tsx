import { useRef } from 'react';
import { usePromptStore } from '../state/promptStore';

export default function GalleryToolbar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { filterTemplates, exportData, importData } = usePromptStore();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importData(JSON.parse(text));
  };

  const handleExport = async () => {
    const payload = await exportData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jsoncraft-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <input
        type="search"
        placeholder="Search prompt or tag"
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
        onChange={(e) => filterTemplates(e.target.value)}
      />
      <button onClick={() => fileRef.current?.click()} className="rounded border border-slate-700 px-3 py-2">
        Import
      </button>
      <button onClick={handleExport} className="rounded border border-slate-700 px-3 py-2">
        Export
      </button>
      <input ref={fileRef} type="file" className="hidden" accept="application/json" onChange={handleImport} />
    </div>
  );
}
