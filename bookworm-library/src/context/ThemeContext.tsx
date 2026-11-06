import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { getDashboardTheme, LightThemeColors } from '@/constants/dashboard-theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof LightThemeColors;
  shadows: typeof import('@/constants/dashboard-theme').DashboardTheme.shadows;
}

const lightTheme = getDashboardTheme(false);

const THEME_STORAGE_KEY = 'bookworm_theme_mode_v2';

function getInitialTheme(): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Fallback
    }
  }
  return 'light';
}

function persistTheme(mode: ThemeMode) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore
    }
  }
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
  colors: LightThemeColors,
  shadows: lightTheme.shadows,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Defaults strictly to light mode or persisted preference
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialTheme);

  const isDark = themeMode === 'dark';
  const theme = getDashboardTheme(isDark);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    persistTheme(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      persistTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        toggleTheme,
        setThemeMode,
        colors: theme.colors,
        shadows: theme.shadows,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
