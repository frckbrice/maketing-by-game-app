import { LocaleSwitcherCompact } from '@/components/ui/LocaleSwitcher';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Gift, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface MobileNavigationProps {
  isDark: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onThemeToggle: () => void;
}

export function MobileNavigation({
  isDark,
  mobileMenuOpen,
  setMobileMenuOpen,
  onThemeToggle,
}: MobileNavigationProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`lg:hidden sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? `${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDark ? 'border-gray-800/50' : 'border-slate-200/50'} shadow-lg`
          : `${isDark ? 'bg-transparent' : 'bg-transparent'}`
      }`}
    >
      <div className='flex items-center justify-between px-4 py-3'>
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center'>
            <Gift className='w-5 h-5 text-white' />
          </div>
          <span
            className={`font-bold text-lg transition-colors duration-300 ${
              isScrolled
                ? isDark
                  ? 'text-white'
                  : 'text-slate-900'
                : isDark
                  ? 'text-white'
                  : 'text-slate-900'
            }`}
          >
            {t('common.appName')}
          </span>
        </div>

        <div className='flex items-center space-x-2'>
          {/* Language Switcher */}
          <LocaleSwitcherCompact />

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-full shadow-lg hover:scale-105 transition-all duration-300 ${
              isScrolled
                ? isDark
                  ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700/80'
                  : 'bg-white/80 text-gray-800 hover:bg-gray-50/80'
                : isDark
                  ? 'bg-black/20 text-yellow-400 hover:bg-black/40'
                  : 'bg-white/20 text-gray-800 hover:bg-white/40'
            } border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} backdrop-blur-sm`}
            aria-label={
              isDark
                ? t('common.switchToLightTheme')
                : t('common.switchToDarkTheme')
            }
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isScrolled
                ? isDark
                  ? 'text-slate-300 hover:bg-gray-800/80 hover:text-white'
                  : 'text-slate-600 hover:bg-gray-100/80 hover:text-slate-900'
                : isDark
                  ? 'text-white hover:bg-black/20 hover:text-orange-300'
                  : 'text-slate-900 hover:bg-white/20 hover:text-orange-600'
            } backdrop-blur-sm`}
            aria-label={t('common.close')}
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`px-4 py-3 border-t transition-all duration-300 ${
            isScrolled
              ? `${isDark ? 'border-gray-800/50 bg-black/80' : 'border-slate-200/50 bg-white/80'} backdrop-blur-md`
              : `${isDark ? 'border-gray-800/30 bg-black/40' : 'border-slate-200/30 bg-white/40'} backdrop-blur-sm`
          }`}
        >
          <div className='space-y-3'>
            <Link
              href='/games'
              className={`block px-3 py-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? isDark
                    ? 'text-slate-300 hover:bg-gray-800/80 hover:text-white'
                    : 'text-slate-600 hover:bg-gray-100/80 hover:text-slate-900'
                  : isDark
                    ? 'text-white hover:bg-black/20 hover:text-orange-300'
                    : 'text-slate-900 hover:bg-white/20 hover:text-orange-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('common.games')}
            </Link>
            {user ? (
              <Link
                href='/dashboard'
                className={`block px-3 py-2 rounded-lg transition-all duration-300 ${
                  isScrolled
                    ? isDark
                      ? 'text-slate-300 hover:bg-gray-800/80 hover:text-white'
                      : 'text-slate-600 hover:bg-gray-100/80 hover:text-slate-900'
                    : isDark
                      ? 'text-white hover:bg-black/20 hover:text-orange-300'
                      : 'text-slate-900 hover:bg-white/20 hover:text-orange-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.dashboard')}
              </Link>
            ) : (
              <Link
                href='/auth/login'
                className={`block px-3 py-2 rounded-lg transition-all duration-300 ${
                  isScrolled
                    ? isDark
                      ? 'text-slate-300 hover:bg-gray-800/80 hover:text-white'
                      : 'text-slate-600 hover:bg-gray-100/80 hover:text-slate-900'
                    : isDark
                      ? 'text-white hover:bg-black/20 hover:text-orange-300'
                      : 'text-slate-900 hover:bg-white/20 hover:text-orange-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
