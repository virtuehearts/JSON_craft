import { create } from 'zustand';

interface UiState {
  composerPrefill: string | null;
  setComposerPrefill: (value: string | null) => void;
  consumeComposerPrefill: () => string | null;
}

export const useUiStore = create<UiState>((set, get) => ({
  composerPrefill: null,
  setComposerPrefill(value) {
    set({ composerPrefill: value });
  },
  consumeComposerPrefill() {
    const value = get().composerPrefill;
    set({ composerPrefill: null });
    return value;
  }
}));
