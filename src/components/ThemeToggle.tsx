import React from 'react';
import { useTheme } from 'next-themes';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
};

export default ThemeToggle;