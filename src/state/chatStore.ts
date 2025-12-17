import { create } from 'zustand';
import { nanoid } from '../utils/id';
import { ChatMessage, ChatSession } from '../types/chat';
import { sendJsonChat } from '../lib/openrouterClient';
import { saveSession, loadSessions, deleteSession } from '../lib/persistence';
import { validateOutput } from '../lib/validators';
import { usePromptStore } from './promptStore';
import { useVisualStore } from './visualStore';
import { FALLBACK_IMAGE_PROMPT } from '../config/prompts';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hello, how can I help you today? I am JSONCraft: AI-Assisted Image Creation Engine, specializing in editing JSON for images and helping you make amazing photos.',
  createdAt: Date.now()
};

interface ChatState {
  sessions: Record<string, { meta: ChatSession; messages: ChatMessage[] }>;
  currentSessionId: string | null;
  loading: boolean;
  validationErrors: string | null;
  assistantIsTyping: boolean;
  usageTokens: number;
  init: () => Promise<void>;
  startSession: () => Promise<void>;
  sendMessage: (content: string, imageData?: string | null) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  stopAssistant: () => void;
  deleteSession: (id: string) => Promise<void>;
  clearChat: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: {},
  currentSessionId: null,
  loading: false,
  validationErrors: null,
  assistantIsTyping: false,
  usageTokens: 0,
  async init() {
    const stored = await loadSessions();
    set({ sessions: stored });
    if (!Object.keys(stored).length) {
      await get().startSession();
    } else {
      const latest = Object.values(stored).sort((a, b) => b.meta.updatedAt - a.meta.updatedAt)[0];
      set({ currentSessionId: latest.meta.id });
    }
  },
  async startSession() {
    const id = nanoid();
    const meta: ChatSession = {
      id,
      title: 'New session',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const messages = [WELCOME_MESSAGE];
    set((state) => ({
      sessions: { ...state.sessions, [id]: { meta, messages } },
      currentSessionId: id
    }));
    await saveSession(meta, messages);
  },
  async sendMessage(content: string, imageData?: string | null) {
    const sessionId = get().currentSessionId;
    if (!sessionId) return;
    const template = usePromptStore.getState().activeTemplate;
    const normalizedContent = content.trim() || FALLBACK_IMAGE_PROMPT;
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content: normalizedContent,
      createdAt: Date.now(),
      imageData: imageData || undefined
    };
    set((state) => {
      const session = state.sessions[sessionId];
      const updatedMessages = [...session.messages, userMessage];
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: { ...session, messages: updatedMessages, meta: { ...session.meta, updatedAt: Date.now() } }
        },
        assistantIsTyping: true,
        validationErrors: null
      };
    });

    try {
      const result = await sendJsonChat({
        messages: [{ role: 'user', content: normalizedContent, imageData: imageData || undefined }],
        template
      });

      const contentText = result.choices[0].message.content;
      const validation = validateOutput(contentText);
      const parsedContent = validation.ok ? validation.data : validation.parsed;
      const renderedContent = parsedContent ? JSON.stringify(parsedContent, null, 2) : contentText;
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: renderedContent,
        createdAt: Date.now(),
        usage: { tokens: result.choices[0].usage?.total_tokens || 0 },
        error: validation.ok ? undefined : 'Validation failed'
      };
      set((state) => {
        const session = state.sessions[sessionId];
        const updatedMessages = [...session.messages, assistantMessage];
        return {
          sessions: { ...state.sessions, [sessionId]: { ...session, messages: updatedMessages } },
          assistantIsTyping: false,
          validationErrors: validation.ok ? null : JSON.stringify(validation.error)
        };
      });
      if (userMessage.imageData && (validation.ok || validation.parsed)) {
        const visualStore = useVisualStore.getState();
        await visualStore.addEntry({
          title: `Capture ${new Date().toLocaleString()}`,
          imageData: userMessage.imageData,
          json: renderedContent,
          notes: `Auto-saved from session ${sessionId}`
        });
      }
      await saveSession(get().sessions[sessionId].meta, get().sessions[sessionId].messages);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: 'Request failed',
        createdAt: Date.now(),
        error: (error as Error).message
      };
      set((state) => {
        const session = state.sessions[sessionId];
        const updatedMessages = [...session.messages, assistantMessage];
        return {
          sessions: { ...state.sessions, [sessionId]: { ...session, messages: updatedMessages } },
          assistantIsTyping: false
        };
      });
    }
  },
  async retryMessage(messageId: string) {
    const sessionId = get().currentSessionId;
    if (!sessionId) return;
    const session = get().sessions[sessionId];
    const message = session.messages.find((m) => m.id === messageId);
    if (!message) return;
    await get().sendMessage(message.content, message.imageData);
  },
  stopAssistant() {
    set({ assistantIsTyping: false });
  },
  async deleteSession(id: string) {
    set((state) => {
      const updated = { ...state.sessions };
      delete updated[id];
      return { sessions: updated, currentSessionId: Object.keys(updated)[0] || null };
    });
    await deleteSession(id);
  },
  async clearChat(id: string) {
    set((state) => {
      const session = state.sessions[id];
      if (!session) return state;
      const messages: ChatMessage[] = [WELCOME_MESSAGE];
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [id]: { ...session, messages, meta: { ...session.meta, updatedAt: Date.now() } }
        }
      };
    });
    const session = get().sessions[id];
    await saveSession(session.meta, session.messages);
  }
}));
