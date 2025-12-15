import ChatPanel from '../components/ChatPanel';
import PromptSidePanel from '../components/PromptSidePanel';
import UsageBar from '../components/UsageBar';

export default function ChatPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 lg:flex-row">
      <div className="flex w-full flex-col gap-4 lg:w-2/3">
        <UsageBar />
        <ChatPanel />
      </div>
      <aside className="w-full shrink-0 lg:w-1/3">
        <PromptSidePanel />
      </aside>
    </div>
  );
}
