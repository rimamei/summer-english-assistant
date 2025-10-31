import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ToggleTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const isThemeLight = theme === 'light';

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      if (chrome?.storage?.local) {
        const result = await chrome.storage.local.get(['theme']);
        const savedTheme = result.theme as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      } else {
        // Fallback to localStorage (for development)
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      }
    };

    loadTheme();
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);

    if (chrome?.storage?.local) {
      await chrome.storage.local.set({ theme: newTheme });
    } else {
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="flex items-center justify-center rounded-xl p-3 shadow-theme bg-linear-to-br from-yellow-100 to-orange-100 dark:from-blue-900 dark:to-purple-900 transition-all duration-700 ease-in-out overflow-hidden relative h-12 w-12 mx-2 group">
        <div className="absolute inset-0 bg-linear-to-r from-yellow-400/30 to-orange-400/30 dark:from-blue-400/40 dark:to-purple-400/40 rounded-xl blur-sm opacity-0 transition-opacity duration-500 animate-pulse" />

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out',
            isThemeLight
              ? 'transform translate-y-0 rotate-0 scale-100'
              : 'transform -translate-y-full scale-75'
          )}
        >
          <Sun className="w-6 h-6 text-yellow-600 dark:text-yellow-400 transition-all duration-700 ease-in-out drop-shadow-lg" />
        </div>
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out',
            isThemeLight
              ? 'transform translate-y-full scale-75'
              : 'transform translate-y-0 rotate-0 scale-100'
          )}
        >
          <Moon className="w-6 h-6 text-gray-600 dark:text-blue-300 transition-all duration-700 ease-in-out drop-shadow-lg" />
        </div>
      </div>
      <div className="flex flex-col">
        <button
          className="relative flex items-center justify-center rounded-t-md p-1 shadow-btn-theme bg-btn-theme hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 active:scale-95 transition-all duration-300 ease-out border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg overflow-hidden group"
          onClick={toggleTheme}
          title={`Switch to ${isThemeLight ? 'dark' : 'light'} mode`}
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 hover:-translate-y-0.5" />
        </button>
        <button
          className="relative flex items-center justify-center rounded-b-md p-1 shadow-btn-theme bg-btn-theme hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 active:scale-95 transition-all duration-300 ease-out border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg overflow-hidden group"
          onClick={toggleTheme}
          title={`Switch to ${isThemeLight ? 'dark' : 'light'} mode`}
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent dark:via-white/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 hover:translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};

export default ToggleTheme;
