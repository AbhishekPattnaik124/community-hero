import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setDark: () => set({ isDark: true }),
      setLight: () => set({ isDark: false }),
    }),
    { name: 'community-hero-theme' }
  )
);
