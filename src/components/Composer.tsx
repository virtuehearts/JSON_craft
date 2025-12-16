import { useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../state/chatStore';
import { FALLBACK_IMAGE_PROMPT } from '../config/prompts';
import { useUiStore } from '../state/uiStore';

export default function Composer() {
  const { sendMessage, assistantIsTyping, stopAssistant } = useChatStore();
  const [value, setValue] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const consumeComposerPrefill = useUiStore((state) => state.consumeComposerPrefill);

  const promptText = useMemo(() => value.trim() || FALLBACK_IMAGE_PROMPT, [value]);

  useEffect(() => {
    const prefill = consumeComposerPrefill();
    if (prefill) {
      setValue(prefill);
    }
  }, [consumeComposerPrefill]);

  const handleSend = async () => {
    await sendMessage(promptText, imagePreview);
    setValue('');
    setImagePreview(null);
    setUploadError(null);
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setUploadError(null);
    };
    reader.onerror = () => setUploadError('Could not read file. Please try another image.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900/80 p-3">
      <div className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={FALLBACK_IMAGE_PROMPT}
          className="min-h-[80px] w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-accent focus:outline-none"
        />
        {imagePreview && (
          <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
            <img src={imagePreview} alt="Upload preview" className="max-h-40 rounded object-contain" />
            <div className="flex flex-col gap-2 text-xs text-gray-300">
              <p className="uppercase tracking-[0.2em] text-gray-500">Attached image</p>
              <p className="max-w-xs text-gray-200">We will send this base64 payload to OpenRouter along with the prompt.</p>
              <button
                className="self-start rounded border border-slate-700 px-2 py-1 text-[11px] text-gray-200 transition hover:border-accent"
                onClick={() => setImagePreview(null)}
              >
                Remove image
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>JSON enforced</span>
            <span>Token safe mode</span>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-700 px-2 py-1 text-gray-200 transition hover:border-accent">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
              <span>Upload photo</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={stopAssistant}
              className="rounded-lg border border-slate-700 px-3 py-2 text-gray-300 hover:border-accent hover:text-white disabled:opacity-50"
              disabled={!assistantIsTyping}
            >
              Stop
            </button>
            <button
              onClick={handleSend}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black transition hover:brightness-110"
              disabled={assistantIsTyping}
            >
              Send
            </button>
          </div>
        </div>
        {uploadError && <div className="text-xs text-rose-300">{uploadError}</div>}
      </div>
    </div>
  );
}
