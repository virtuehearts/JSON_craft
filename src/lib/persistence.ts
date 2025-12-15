import localforage from 'localforage';
import { ChatMessage, ChatSession } from '../types/chat';
import { PromptTemplate } from '../types/prompt';

const DB_VERSION = 1;
const SESSION_KEY = `jsoncraft/sessions/v${DB_VERSION}`;
const TEMPLATE_KEY = `jsoncraft/templates/v${DB_VERSION}`;

export async function saveSession(session: ChatSession, messages: ChatMessage[]) {
  const existing = (await localforage.getItem<Record<string, { session: ChatSession; messages: ChatMessage[] }>>(SESSION_KEY)) || {};
  existing[session.id] = { session, messages };
  await localforage.setItem(SESSION_KEY, existing);
}

export async function loadSessions() {
  const stored = (await localforage.getItem<Record<string, { session: ChatSession; messages: ChatMessage[] }>>(SESSION_KEY)) || {};
  return stored;
}

export async function deleteSession(sessionId: string) {
  const stored = (await loadSessions()) || {};
  delete stored[sessionId];
  await localforage.setItem(SESSION_KEY, stored);
}

export async function saveTemplates(templates: PromptTemplate[]) {
  await localforage.setItem(TEMPLATE_KEY, templates);
}

export async function loadTemplates(): Promise<PromptTemplate[]> {
  return (await localforage.getItem<PromptTemplate[]>(TEMPLATE_KEY)) || [];
}

export async function exportAll() {
  const sessions = await loadSessions();
  const templates = await loadTemplates();
  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    sessions,
    templates
  };
}

export async function importAll(payload: unknown) {
  const data = payload as { sessions?: unknown; templates?: unknown; version?: number };
  if (typeof data !== 'object' || !data) throw new Error('Invalid import payload');
  if (data.templates) {
    await localforage.setItem(TEMPLATE_KEY, data.templates as PromptTemplate[]);
  }
  if (data.sessions) {
    await localforage.setItem(
      SESSION_KEY,
      data.sessions as Record<string, { session: ChatSession; messages: ChatMessage[] }>
    );
  }
}
