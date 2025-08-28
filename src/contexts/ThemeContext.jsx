import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    // Apply theme to html element
    const html = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      html.setAttribute('data-bs-theme', 'dark');
      body.className = 'dark-mode';
      body.style.backgroundColor = '#212529';
      body.style.color = '#ffffff';
    } else {
      html.setAttribute('data-bs-theme', 'light');
      body.className = 'light-mode';
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#212529';
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};
