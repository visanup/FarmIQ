import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

const initialState = {
  theme: 'light' as ThemeMode,
};

const themeStore = create(
  persist(
    (set) => ({
      theme: initialState.theme,
      setTheme: (theme: ThemeMode) => set({ theme }),
    }),
    {
      name: 'theme-storage', // required: unique name
    },
  ),
);

export const useThemeStore = () => {
  return {
    theme: themeStore((state) => state.theme),
    setTheme: themeStore((state) => state.setTheme),
  };
};
