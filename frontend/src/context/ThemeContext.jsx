import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply the class on mount and on change
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Apply on first render
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark);
  }

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
