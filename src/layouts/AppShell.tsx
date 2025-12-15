import { Link, Outlet, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useChatStore } from '../state/chatStore';
import { usePromptStore } from '../state/promptStore';

const links = [
  { to: '/', label: 'Chat' },
  { to: '/gallery', label: 'Gallery' }
];

export default function AppShell() {
  const { pathname } = useLocation();
  const { currentSessionId } = useChatStore();
  const { presetsLoaded } = usePromptStore();

  const title = useMemo(() => {
    const base = 'JSONCraft';
    return currentSessionId ? `${base} · Session ${currentSessionId.slice(-4)}` : base;
  }, [currentSessionId]);

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-slate-800 bg-chrome/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Holodeck Command</p>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          </div>
          <nav className="flex gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded px-3 py-2 font-medium transition hover:bg-slate-800 ${
                  pathname === link.to ? 'bg-slate-900 text-white' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="text-xs text-gray-500">Presets {presetsLoaded ? 'ready' : 'loading…'}</div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
