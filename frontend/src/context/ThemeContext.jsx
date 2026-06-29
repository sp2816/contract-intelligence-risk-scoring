import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Whenever theme changes, apply it to <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    // Set data-theme attribute — used by index.css for all overrides
    root.setAttribute('data-theme', theme);
    // Add dark/light class for Tailwind class-based darkMode support
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    root.classList.remove('light-mode');
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Allow setting a specific value ('light' | 'dark')
  const setTheme = (value) => {
    if (value === 'light' || value === 'dark') {
      setThemeState(value);
    }
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
