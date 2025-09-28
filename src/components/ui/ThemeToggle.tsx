import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../types';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ key: Theme; label: string; icon: React.ReactNode }> = [
    { key: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { key: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {themes.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            theme === key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={label}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};