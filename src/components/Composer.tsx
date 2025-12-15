import { useState } from 'react';
import { useChatStore } from '../state/chatStore';

export default function Composer() {
  const { sendMessage, assistantIsTyping, stopAssistant } = useChatStore();
  const [value, setValue] = useState('Describe the uploaded image in the JSON schema.');

  const handleSend = async () => {
    if (!value.trim()) return;
    await sendMessage(value.trim());
    setValue('');
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900/80 p-3">
      <div className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask JSONCraft to produce structured JSON"
          className="min-h-[80px] w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-inner focus:border-accent focus:outline-none"
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>JSON enforced</span>
            <span>Token safe mode</span>
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
      </div>
    </div>
  );
}
