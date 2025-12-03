// components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      root.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      const root = document.documentElement;
      
      if (newValue) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newValue;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 bg-card border border-border"
      aria-label={darkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
    >
      <span className="sr-only">Alternar tema</span>
      <span
        className={`inline-block w-4 h-4 transform rounded-full transition-transform ${
          darkMode ? 'translate-x-6 bg-yellow-500' : 'translate-x-1 bg-foreground/60'
        }`}
      >
        {darkMode ? (
          <Sun className="w-4 h-4 text-background" />
        ) : (
          <Moon className="w-4 h-4 text-background" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;