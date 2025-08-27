'use client';

import { ChevronDown, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Define supported locales
const locales = ['en', 'fr'] as const;

export function LocaleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get the path without locale prefix
  const getPathWithoutLocale = (path: string | null) => {
    if (!path) return '/';
    const segments = path.split('/');
    if (segments[1] && locales.includes(segments[1] as any)) {
      return '/' + segments.slice(2).join('/');
    }
    return path;
  };

  // Generate locale-specific paths
  const getLocalePath = (locale: string) => {
    const pathWithoutLocale = getPathWithoutLocale(pathname);
    return `/${locale}${pathWithoutLocale}`;
  };

  const currentLocaleInfo = {
    en: { name: 'English', flag: '🇺🇸', code: 'EN' },
    fr: { name: 'Français', flag: '🇫🇷', code: 'FR' },
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white hover:text-[#FF5722] transition-colors rounded-lg hover:bg-white/10'
        aria-label='Switch language'
      >
        <Globe className='w-4 h-4' />
        <span className='hidden sm:inline'>
          {
            currentLocaleInfo[currentLocale as keyof typeof currentLocaleInfo]
              ?.code
          }
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
          <div className='py-1'>
            {locales.map(locale => {
              const isActive = locale === currentLocale;
              const localeInfo =
                currentLocaleInfo[locale as keyof typeof currentLocaleInfo];

              return (
                <Link
                  key={locale}
                  href={getLocalePath(locale)}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-[#FF5722] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className='text-lg'>{localeInfo.flag}</span>
                  <span className='font-medium'>{localeInfo.name}</span>
                  {isActive && (
                    <span className='ml-auto text-xs bg-white/20 px-2 py-1 rounded-full'>
                      Active
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile/narrow screens
export function LocaleSwitcherCompact() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPathWithoutLocale = (path: string | null) => {
    if (!path) return '/';
    const segments = path.split('/');
    if (segments[1] && locales.includes(segments[1] as any)) {
      return '/' + segments.slice(2).join('/');
    }
    return path;
  };

  const getLocalePath = (locale: string) => {
    const pathWithoutLocale = getPathWithoutLocale(pathname);
    return `/${locale}${pathWithoutLocale}`;
  };

  const currentLocaleInfo = {
    en: { flag: '🇺🇸', code: 'EN' },
    fr: { flag: '🇫🇷', code: 'FR' },
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-1 px-2 py-1 text-sm text-white hover:text-[#FF5722] transition-colors rounded'
        aria-label='Switch language'
      >
        <Globe className='w-4 h-4' />
        <span className='text-xs'>
          {
            currentLocaleInfo[currentLocale as keyof typeof currentLocaleInfo]
              ?.code
          }
        </span>
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-1 w-32 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
          <div className='py-1'>
            {locales.map(locale => {
              const isActive = locale === currentLocale;
              const localeInfo =
                currentLocaleInfo[locale as keyof typeof currentLocaleInfo];

              return (
                <Link
                  key={locale}
                  href={getLocalePath(locale)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[#FF5722] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className='text-sm'>{localeInfo.flag}</span>
                  <span className='text-xs'>{localeInfo.code}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
