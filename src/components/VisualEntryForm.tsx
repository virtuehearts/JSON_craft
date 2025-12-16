import { useState } from 'react';
import { useVisualStore } from '../state/visualStore';
import { sendJsonChat } from '../lib/openrouterClient';

export default function VisualEntryForm() {
  const { addEntry } = useVisualStore();
  const [title, setTitle] = useState('Uploaded image analysis');
  const [notes, setNotes] = useState('');
  const [json, setJson] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
    };
    reader.onerror = () => setError('Failed to read image file');
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = async () => {
    if (!imageData) {
      setError('Please select an image first.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await sendJsonChat({
        messages: [{ role: 'user', content: 'Analyze this image and generate a detailed JSON description.', imageData }]
      });
      const jsonContent = response.choices[0].message.content;
      setJson(jsonContent);
    } catch (error) {
      setError('Failed to analyze image. Please try again.');
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!imageData) {
      setError('Select an image to pair with the JSON output.');
      return;
    }
    if (!json.trim()) {
      setError('Paste the JSON output to save this capture.');
      return;
    }
    setIsSaving(true);
    await addEntry({
      title: title.trim() || 'Untitled capture',
      imageData,
      json: json.trim(),
      notes: notes.trim() || undefined
    });
    setIsSaving(false);
    setNotes('');
    setJson('');
    setTitle('Uploaded image analysis');
    setImageData(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Capture</p>
          <h3 className="text-lg font-semibold text-white">Add photo + JSON to gallery</h3>
          <p className="text-sm text-gray-400">Upload an image to automatically generate a searchable JSON analysis.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-700 px-3 py-2 text-sm text-gray-100 transition hover:border-accent">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files?.[0])}
          />
          <span>Upload image</span>
        </label>
      </div>
      {imageData && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <img src={imageData} alt="Preview" className="max-h-64 rounded object-contain" />
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-[0.2em] text-gray-500">Title</label>
          <input
            type="text"
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label className="block text-xs uppercase tracking-[0.2em] text-gray-500">Notes</label>
          <textarea
            className="min-h-[80px] w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="Prompt, model, or other context"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-[0.2em] text-gray-500">JSON output</label>
          <button
            type="button"
            className="rounded bg-accent px-4 py-2 font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing || !imageData}
          >
            {isAnalyzing ? 'Analyzing…' : 'Analyze Image'}
          </button>
          <textarea
            className="min-h-[180px] w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-amber-50 focus:border-accent focus:outline-none"
            placeholder="AI-generated JSON will appear here"
            value={json}
            readOnly
          />
        </div>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex justify-end gap-2 text-sm">
        <button
          type="submit"
          className="rounded bg-accent px-4 py-2 font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save to gallery'}
        </button>
      </div>
    </form>
  );
}
