'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from './SessionManager';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'orange' | 'blue' | 'green' | 'purple' | 'red';

interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  compactMode: boolean;
}

interface ThemeManagerProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorScheme?: ColorScheme;
  storageKey?: string;
}

const THEME_STORAGE_KEY = 'app_theme_config';
const DEFAULT_CONFIG: ThemeConfig = {
  theme: 'system',
  colorScheme: 'orange',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'base',
  compactMode: false,
};

export const ThemeManager: React.FC<ThemeManagerProps> = ({
  children,
  defaultTheme = 'system',
  defaultColorScheme = 'orange',
  storageKey = THEME_STORAGE_KEY,
}) => {
  const session = useSession();
  const [config, setConfig] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') {
      return {
        ...DEFAULT_CONFIG,
        theme: defaultTheme,
        colorScheme: defaultColorScheme,
      };
    }

    // Load from session preferences first, then localStorage
    const sessionPreferences = session?.preferences?.theme;
    if (sessionPreferences) {
      return { ...DEFAULT_CONFIG, ...sessionPreferences };
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch {
        return {
          ...DEFAULT_CONFIG,
          theme: defaultTheme,
          colorScheme: defaultColorScheme,
        };
      }
    }

    return {
      ...DEFAULT_CONFIG,
      theme: defaultTheme,
      colorScheme: defaultColorScheme,
    };
  });

  const [mounted, setMounted] = useState(false);

  // System theme detection
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);

    // Detect system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Detect user preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectPreferences = () => {
      const updates: Partial<ThemeConfig> = {};

      // Reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updates.reducedMotion = true;
      }

      // High contrast preference
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        updates.highContrast = true;
      }

      if (Object.keys(updates).length > 0) {
        setConfig(prev => ({ ...prev, ...updates }));
      }
    };

    detectPreferences();
  }, []);

  // Resolve actual theme based on system preference
  const resolvedTheme = useMemo(() => {
    if (config.theme === 'system') {
      return systemTheme;
    }
    return config.theme;
  }, [config.theme, systemTheme]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Apply color scheme
    root.classList.remove(
      'theme-orange',
      'theme-blue',
      'theme-green',
      'theme-purple',
      'theme-red'
    );
    root.classList.add(`theme-${config.colorScheme}`);

    // Apply accessibility preferences
    if (config.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font size
    root.classList.remove(
      'text-sm-base',
      'text-base-base',
      'text-lg-base',
      'text-xl-base'
    );
    root.classList.add(`text-${config.fontSize}-base`);

    // Apply compact mode
    if (config.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: {
          orange: '#fb923c',
          blue: '#3b82f6',
          green: '#10b981',
          purple: '#8b5cf6',
          red: '#ef4444',
        },
        dark: {
          orange: '#ea580c',
          blue: '#2563eb',
          green: '#059669',
          purple: '#7c3aed',
          red: '#dc2626',
        },
      };

      metaThemeColor.setAttribute(
        'content',
        colors[resolvedTheme][config.colorScheme]
      );
    }
  }, [mounted, resolvedTheme, config]);

  // Persist theme configuration
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(storageKey, JSON.stringify(config));

    // Update session preferences if session is active
    if (session?.isActive) {
      session.updatePreferences({ theme: config });
    }
  }, [config, mounted, storageKey, session]);

  // Theme update functions
  const setTheme = useCallback((theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }));
  }, []);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      theme:
        prev.theme === 'light'
          ? 'dark'
          : prev.theme === 'dark'
            ? 'system'
            : 'light',
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Theme context value
  const themeValue = useMemo(
    () => ({
      ...config,
      resolvedTheme,
      systemTheme,
      setTheme,
      setColorScheme,
      toggleTheme,
      updateConfig,
      resetToDefaults,
      isDark: resolvedTheme === 'dark',
      isLight: resolvedTheme === 'light',
    }),
    [
      config,
      resolvedTheme,
      systemTheme,
      setTheme,
      setColorScheme,
      toggleTheme,
      updateConfig,
      resetToDefaults,
    ]
  );

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
};

// Theme Context
export const ThemeContext = React.createContext<{
  theme: Theme;
  colorScheme: ColorScheme;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  compactMode: boolean;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
  toggleTheme: () => void;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
  resetToDefaults: () => void;
  isDark: boolean;
  isLight: boolean;
} | null>(null);

// Hook to use theme
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeManager');
  }
  return context;
};

// Theme toggle button component
export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center w-10 h-10 rounded-lg
        bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300 transition-colors
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      {theme === 'light' && (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>
      )}
      {theme === 'dark' && (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
          />
        </svg>
      )}
      {theme === 'system' && (
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          />
        </svg>
      )}
    </button>
  );
};

// Color scheme selector component
export const ColorSchemeSelector: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { colorScheme, setColorScheme } = useTheme();

  const schemes: Array<{ value: ColorScheme; label: string; color: string }> = [
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {schemes.map(scheme => (
        <button
          key={scheme.value}
          onClick={() => setColorScheme(scheme.value)}
          className={`
            w-8 h-8 rounded-full transition-all
            ${scheme.color}
            ${
              colorScheme === scheme.value
                ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                : 'hover:scale-105'
            }
          `}
          aria-label={`Switch to ${scheme.label} color scheme`}
        />
      ))}
    </div>
  );
};
