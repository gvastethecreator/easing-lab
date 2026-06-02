import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ACCENT_COLORS } from '../constants';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  accentColor: (typeof ACCENT_COLORS)[0];
  cycleAccentColor: () => void;
  nextAccentColor: (typeof ACCENT_COLORS)[0];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Resuelve el tema inicial.
 * Política actual: oscuro por defecto, salvo preferencia persistida en localStorage.
 */
const getInitialDarkMode = (): boolean => {
  if (typeof window === 'undefined') {
    return true;
  }

  const storedTheme = window.localStorage.getItem('theme');
  if (storedTheme === 'light') {
    return false;
  }

  return true;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [colorIndex, setColorIndex] = useState(0);

  // Apply Theme Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Apply Accent Colors
  useEffect(() => {
    const root = document.documentElement;
    const currentColor = ACCENT_COLORS[colorIndex];
    root.style.setProperty('--accent-primary', currentColor.main);
    root.style.setProperty('--accent-primary-hover', currentColor.hover);
    root.style.setProperty('--accent-primary-bg', currentColor.bg);
  }, [colorIndex]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const cycleAccentColor = () => setColorIndex((prev) => (prev + 1) % ACCENT_COLORS.length);

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      accentColor: ACCENT_COLORS[colorIndex],
      cycleAccentColor,
      nextAccentColor: ACCENT_COLORS[(colorIndex + 1) % ACCENT_COLORS.length],
    }),
    [isDarkMode, colorIndex]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
