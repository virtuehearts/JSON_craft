import { create } from 'zustand';
import { nanoid } from '../utils/id';
import { PromptTemplate } from '../types/prompt';
import { loadTemplates, saveTemplates, exportAll, importAll } from '../lib/persistence';

interface PromptState {
  templates: PromptTemplate[];
  filteredTemplates: PromptTemplate[];
  activeTemplate: PromptTemplate | null;
  presetsLoaded: boolean;
  init: () => Promise<void>;
  saveTemplate: (input: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<void>;
  filterTemplates: (query: string, tag?: string) => void;
  setActiveTemplate: (id: string | null) => void;
  exportData: () => Promise<unknown>;
  importData: (payload: unknown) => Promise<void>;
}

const starterTemplates: PromptTemplate[] = [
  {
    id: 'cinema',
    name: 'Cinematic Portrait',
    description: 'High-drama portrait lighting preset.',
    tags: ['portrait', 'cinematic'],
    json: JSON.stringify(
      {
        style: 'cinematic still',
        subject: { description: 'subject', expression: 'neutral', hair: 'short hair' },
        background: { layer: 'urban alley with neon' },
        lighting: 'rim lighting',
        mood: 'moody'
      },
      null,
      2
    ),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: 'Cinematic still · neon alley'
  },
  {
    id: 'studio',
    name: 'Studio Product',
    description: 'Clean tabletop commercial style.',
    tags: ['product', 'studio'],
    json: JSON.stringify(
      {
        style: 'studio product',
        subject: { description: 'object', expression: 'n/a' },
        background: { layer: 'seamless white' },
        lighting: 'softbox',
        mood: 'crisp and premium'
      },
      null,
      2
    ),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: 'Studio white sweep'
  }
];

export const usePromptStore = create<PromptState>((set, get) => ({
  templates: starterTemplates,
  filteredTemplates: [],
  activeTemplate: null,
  presetsLoaded: false,
  async init() {
    const loaded = await loadTemplates();
    if (loaded.length) {
      set({ templates: loaded, presetsLoaded: true });
    } else {
      await saveTemplates(starterTemplates);
      set({ presetsLoaded: true });
    }
  },
  async saveTemplate(input) {
    const now = Date.now();
    const template: PromptTemplate = {
      ...input,
      id: nanoid(),
      version: 1,
      createdAt: now,
      updatedAt: now
    };
    const updated = [template, ...get().templates];
    set({ templates: updated });
    await saveTemplates(updated);
  },
  async removeTemplate(id) {
    const updated = get().templates.filter((t) => t.id !== id);
    set({ templates: updated });
    await saveTemplates(updated);
    if (get().activeTemplate?.id === id) set({ activeTemplate: null });
  },
  async duplicateTemplate(id) {
    const template = get().templates.find((t) => t.id === id);
    if (!template) return;
    await get().saveTemplate({ ...template, name: `${template.name} copy` });
  },
  filterTemplates(query, tag) {
    const normalized = query.toLowerCase();
    const filtered = get().templates.filter((t) => {
      const matchesQuery = !normalized ||
        t.name.toLowerCase().includes(normalized) ||
        t.description?.toLowerCase().includes(normalized) ||
        t.json.toLowerCase().includes(normalized);
      const matchesTag = tag ? t.tags.includes(tag) : true;
      return matchesQuery && matchesTag;
    });
    set({ filteredTemplates: filtered });
  },
  setActiveTemplate(id) {
    const template = get().templates.find((t) => t.id === id) || null;
    set({ activeTemplate: template });
  },
  async exportData() {
    return exportAll();
  },
  async importData(payload) {
    await importAll(payload);
    const loaded = await loadTemplates();
    set({ templates: loaded });
  }
}));
