import { useRef, useEffect } from 'react';
import { ChatMessage } from '../types/chat';
import { useChatStore } from '../state/chatStore';
import { clsx } from 'clsx';
import { FALLBACK_IMAGE_PROMPT } from '../config/prompts';
import TypingIndicator from './TypingIndicator';

interface Props {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: Props) {
  const { retryMessage, validationErrors, assistantIsTyping } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, assistantIsTyping]);

  return (
    <div className="scroll-shadow flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3" ref={scrollRef}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={clsx('rounded-lg border px-4 py-3 text-sm shadow-sm transition', {
            'border-accent/50 bg-accent/10 text-white': message.role === 'assistant',
            'border-slate-800 bg-slate-900 text-gray-100': message.role === 'user'
          })}
        >
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span className="uppercase tracking-[0.2em]">{message.role}</span>
            {message.usage?.tokens ? <span>{message.usage.tokens} tokens</span> : null}
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-200">{message.content}</pre>
          {message.imageData && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-black/20">
              <img src={message.imageData} alt="User upload" className="max-h-64 w-full object-contain" />
            </div>
          )}
          {message.error && (
            <div className="mt-2 flex items-center justify-between text-xs text-rose-300">
              <span>Error: {message.error}</span>
              <button className="underline" onClick={() => retryMessage(message.id)}>
                Retry
              </button>
            </div>
          )}
        </div>
      ))}
      {validationErrors && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          Schema validation failed: {validationErrors}
        </div>
      )}
      {assistantIsTyping && (
        <div className="self-start rounded-lg border border-accent/50 bg-accent/10 px-4 py-3 text-sm text-white transition">
          <TypingIndicator />
        </div>
      )}
      {!messages.length && !assistantIsTyping && (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          No messages yet. Upload an image to chat and we will ask: “{FALLBACK_IMAGE_PROMPT}”
        </div>
      )}
    </div>
  );
}
