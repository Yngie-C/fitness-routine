import { create } from 'zustand';

interface AppState {
  isOnline: boolean;
  isSyncing: boolean;
  syncError: string | null;

  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isOnline: true,
  isSyncing: false,
  syncError: null,

  setOnline: (online) => set({ isOnline: online }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setSyncError: (error) => set({ syncError: error }),
}));
