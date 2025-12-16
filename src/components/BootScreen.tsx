import { ReactNode, useEffect, useMemo, useState } from 'react';
import { getEnv, setRuntimeApiKey } from '../config/env';

interface Props {
  children: ReactNode;
}

interface Diagnostics {
  memory: string;
  disk: string;
}

export default function BootScreen({ children }: Props) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [needsKey, setNeedsKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [status, setStatus] = useState('Booting JSONCraft…');
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({ memory: 'Detecting…', disk: 'Scanning…' });

  const bootLines = useMemo(
    () => [
      `RAM: ${diagnostics.memory}`,
      `Storage: ${diagnostics.disk}`,
      needsKey ? 'OpenRouter key: missing' : 'OpenRouter key: detected'
    ],
    [diagnostics, needsKey]
  );

  useEffect(() => {
    const envKey = getEnv().VITE_OPENROUTER_API_KEY;
    setNeedsKey(!envKey);
    setStatus(envKey ? 'Credentials detected. Initializing UI…' : 'Waiting for OpenRouter key…');

    const timer = envKey ? setTimeout(() => setShowOverlay(false), 1200) : undefined;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const gatherDiagnostics = async () => {
      const memoryStat = (() => {
        const nav = navigator as Navigator & { deviceMemory?: number };
        if (typeof nav.deviceMemory === 'number') return `${nav.deviceMemory} GB reported`;
        const perf = performance as Performance & { memory?: { jsHeapSizeLimit?: number } };
        if (perf.memory?.jsHeapSizeLimit) return `${(perf.memory.jsHeapSizeLimit / 1e9).toFixed(2)} GB heap limit`;
        return 'Unavailable';
      })();

      const storageEstimate = await navigator.storage?.estimate?.();
      const diskStat = storageEstimate?.quota
        ? `${(((storageEstimate.quota - (storageEstimate.usage || 0)) / 1e9).toFixed(2))} GB free / ${(
            storageEstimate.quota / 1e9
          ).toFixed(2)} GB`
        : 'Unavailable';

      setDiagnostics({ memory: memoryStat, disk: diskStat });
    };

    void gatherDiagnostics();
  }, []);

  const handleSaveKey = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKeyInput.trim()) {
      setStatus('Enter a valid OpenRouter API key to continue.');
      return;
    }
    setRuntimeApiKey(apiKeyInput.trim());
    setNeedsKey(false);
    setStatus('Key stored locally. Launching command UI…');
    setTimeout(() => setShowOverlay(false), 900);
  };

  if (showOverlay || needsKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-green-200">
        <div className="w-full max-w-2xl rounded-xl border border-green-500/40 bg-slate-950 p-6 shadow-2xl shadow-green-900/50">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-green-400">JSONCraft BIOS</p>
          <div className="space-y-2 font-mono text-sm text-green-200">
            {bootLines.map((line) => (
              <div key={line} className="flex items-center justify-between rounded border border-green-900/60 bg-green-950/40 px-3 py-2">
                <span>{line}</span>
                <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-green-300">{status}</p>
          {needsKey && (
            <form onSubmit={handleSaveKey} className="mt-4 space-y-3">
              <label className="block text-xs uppercase tracking-[0.25em] text-green-400">OpenRouter API Key</label>
              <input
                value={apiKeyInput}
                onChange={(event) => setApiKeyInput(event.target.value)}
                className="w-full rounded border border-green-700 bg-black px-3 py-2 font-mono text-green-200 placeholder:text-green-800 focus:border-green-400 focus:outline-none"
                placeholder="sk-or-v1-..."
                autoFocus
              />
              <div className="flex items-center justify-between text-xs text-green-400">
                <span>Stored locally for this browser only.</span>
                <button
                  type="submit"
                  className="rounded border border-green-600 px-3 py-2 font-semibold text-green-100 transition hover:bg-green-700/40"
                >
                  Save + Continue
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
