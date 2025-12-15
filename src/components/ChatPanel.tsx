import { useEffect, useMemo } from 'react';
import { useChatStore } from '../state/chatStore';
import MessageList from './MessageList';
import Composer from './Composer';

export default function ChatPanel() {
  const { init, sessions, currentSessionId, assistantIsTyping } = useChatStore();

  useEffect(() => {
    init();
  }, [init]);

  const currentMessages = useMemo(() => {
    if (!currentSessionId) return [];
    return sessions[currentSessionId]?.messages || [];
  }, [sessions, currentSessionId]);

  return (
    <div className="flex h-[75vh] min-h-[520px] flex-col rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent" aria-hidden />
          Live chat
        </div>
        <div className="text-xs text-gray-500">{assistantIsTyping ? 'Assistant is responding…' : 'Idle'}</div>
      </div>
      <MessageList messages={currentMessages} />
      <Composer />
    </div>
  );
}
