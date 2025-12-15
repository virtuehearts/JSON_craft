import { useChatStore } from '../state/chatStore';

export default function UsageBar() {
  const { assistantIsTyping } = useChatStore();
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-gray-300">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        JSON output guardrails active
      </div>
      <div className="text-xs text-gray-500">
        {assistantIsTyping ? 'Streaming OpenRouter…' : 'Ready for next request'}
      </div>
    </div>
  );
}
