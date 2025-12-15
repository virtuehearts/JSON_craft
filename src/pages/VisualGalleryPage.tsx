import { useEffect } from 'react';
import VisualEntryForm from '../components/VisualEntryForm';
import VisualEntryCard from '../components/VisualEntryCard';
import { useVisualStore } from '../state/visualStore';

export default function VisualGalleryPage() {
  const { entries, init, removeEntry } = useVisualStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Visual Gallery</h2>
          <p className="text-sm text-gray-400">
            Pair uploaded photos with the JSON responses you generated so you can reference them later.
          </p>
        </div>
      </div>

      <VisualEntryForm />

      <div className="grid gap-4">
        {entries.map((entry) => (
          <VisualEntryCard key={entry.id} entry={entry} onDelete={() => removeEntry(entry.id)} />
        ))}
        {!entries.length && (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-gray-400">
            No captures saved yet. Upload an image and paste the JSON output from the assistant to archive it here.
          </div>
        )}
      </div>
    </div>
  );
}
