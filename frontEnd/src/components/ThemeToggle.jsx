import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const handleClick = () => {
    console.log('Toggle clicked! Antes:', isDarkMode)
    toggleTheme()
    console.log('Toggle clicked! Después:', !isDarkMode)
  }
  
  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white hover:bg-gray-50 text-blue-400 border-2 border-blue-300 shadow-lg transition-all duration-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-yellow-400 dark:border-green-400"
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;