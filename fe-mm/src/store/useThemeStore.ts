import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: localStorage.getItem('theme') !== 'light',
  
  toggleTheme: () => {
    set((state) => {
      const newIsDark = !state.isDark;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      return { isDark: newIsDark };
    });
  },

  setTheme: (isDark: boolean) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    set({ isDark });
  },
}));
