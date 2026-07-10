import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center ${className}`}
      aria-label="Toggle dark mode"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <IoMoonOutline size={18} className="animate-in spin-in-12 duration-300" />
      ) : (
        <IoSunnyOutline size={18} className="animate-in spin-in-12 duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
