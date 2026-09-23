import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'contentnova-theme';

function resolveEffectiveTheme(theme) {
  if (theme === 'SYSTEM' || !theme) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme.toLowerCase();
}

function applyTheme(theme) {
  const effective = resolveEffectiveTheme(theme);
  document.documentElement.classList.toggle('dark', effective === 'dark');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'SYSTEM';
    } catch {
      return 'SYSTEM';
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'SYSTEM') return undefined;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('SYSTEM');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next) => setThemeState(next), []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
