import { create } from 'zustand';

interface NavState {
  isSidebarOpen: boolean;
  viewMode: 'grid' | 'list';
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useNavStore = create<NavState>((set) => ({
  isSidebarOpen: false,
  viewMode: 'grid',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));