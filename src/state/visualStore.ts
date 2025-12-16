import { create } from 'zustand';
import { nanoid } from '../utils/id';
import { VisualEntry } from '../types/visual';
import { loadVisualEntries, saveVisualEntries, exportAll, importAll } from '../lib/persistence';

interface VisualState {
  entries: VisualEntry[];
  init: () => Promise<void>;
  addEntry: (input: Omit<VisualEntry, 'id' | 'createdAt'>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<VisualEntry, 'id' | 'createdAt'>>) => Promise<void>;
  exportData: () => Promise<unknown>;
  importData: (payload: unknown) => Promise<void>;
}

export const useVisualStore = create<VisualState>((set, get) => ({
  entries: [],
  async init() {
    const stored = await loadVisualEntries();
    set({ entries: stored });
  },
  async addEntry(input) {
    const now = Date.now();
    const entry: VisualEntry = { ...input, id: nanoid(), createdAt: now };
    const updated = [entry, ...get().entries];
    set({ entries: updated });
    await saveVisualEntries(updated);
  },
  async removeEntry(id) {
    const updated = get().entries.filter((entry) => entry.id !== id);
    set({ entries: updated });
    await saveVisualEntries(updated);
  },
  async updateEntry(id, updates) {
    const updatedEntries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    set({ entries: updatedEntries });
    await saveVisualEntries(updatedEntries);
  },
  async exportData() {
    return exportAll();
  },
  async importData(payload) {
    await importAll(payload);
    const stored = await loadVisualEntries();
    set({ entries: stored });
  }
}));
