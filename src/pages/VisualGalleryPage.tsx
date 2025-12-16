import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VisualEntryForm from '../components/VisualEntryForm';
import VisualEntryThumbnail from '../components/VisualEntryThumbnail';
import VisualEntryModal from '../components/VisualEntryModal';
import { useVisualStore } from '../state/visualStore';
import { useUiStore } from '../state/uiStore';
import { VisualEntry } from '../types/visual';

export default function VisualGalleryPage() {
  const navigate = useNavigate();
  const { entries, init, removeEntry, updateEntry } = useVisualStore();
  const setComposerPrefill = useUiStore((state) => state.setComposerPrefill);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedEntry = useMemo<VisualEntry | null>(() => {
    return entries.find((entry) => entry.id === selectedId) || null;
  }, [entries, selectedId]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) {
      return entries;
    }
    const searchTermLower = searchTerm.toLowerCase();
    return entries.filter((entry) =>
      entry.searchableText ? entry.searchableText.includes(searchTermLower) : false
    );
  }, [entries, searchTerm]);

  useEffect(() => {
    init();
  }, [init]);

  const openChatWithJson = (json: string) => {
    setComposerPrefill(
      `Help me edit this JSON prompt. Ask me what to change (camera angle, setting, theme, style, etc.) and then return the updated JSON.\n\nCurrent JSON:\n${json}`
    );
    navigate('/');
  };

  const handleSaveJson = async (json: string) => {
    if (!selectedEntry) return;
    await updateEntry(selectedEntry.id, { json });
  };

  const handleDelete = async (id: string) => {
    await removeEntry(id);
    setSelectedId(null);
  };

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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search entries..."
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <VisualEntryForm />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEntries.map((entry) => (
          <VisualEntryThumbnail
            key={entry.id}
            entry={entry}
            onSelect={() => setSelectedId(entry.id)}
            onDelete={() => handleDelete(entry.id)}
          />
        ))}
      </div>
      {!filteredEntries.length && (
        <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-gray-400">
          {searchTerm ? `No entries match "${searchTerm}"` : 'No captures saved yet. Upload an image to generate a searchable gallery.'}
        </div>
      )}

      {selectedEntry && (
        <VisualEntryModal
          entry={selectedEntry}
          onClose={() => setSelectedId(null)}
          onDelete={() => handleDelete(selectedEntry.id)}
          onSaveJson={handleSaveJson}
          onEditViaChat={(json) => {
            setSelectedId(null);
            openChatWithJson(json);
          }}
        />
      )}
    </div>
  );
}
