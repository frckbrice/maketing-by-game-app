import { useAuth } from '@/lib/contexts/AuthContext';
import { Gift } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DesktopHeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function DesktopHeader({ isDark, onThemeToggle }: DesktopHeaderProps) {
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
    <header
      className={`hidden lg:block sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? `${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDark ? 'border-gray-800/50' : 'border-slate-200/50'} shadow-lg`
          : `${isDark ? 'bg-transparent' : 'bg-transparent'}`
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center'>
              <Gift className='w-5 h-5 text-white' />
            </div>
            <span
              className={`font-bold text-xl transition-colors duration-300 ${
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

          {/* Navigation */}
          <nav className='flex items-center space-x-8'>
            <Link
              href='/games'
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled
                  ? isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                  : isDark
                    ? 'text-white hover:text-orange-300'
                    : 'text-slate-900 hover:text-orange-600'
              }`}
            >
              {t('common.games')}
            </Link>
            <Link
              href='#how-it-works'
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled
                  ? isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                  : isDark
                    ? 'text-white hover:text-orange-300'
                    : 'text-slate-900 hover:text-orange-600'
              }`}
            >
              {t('common.howItWorks')}
            </Link>
            <Link
              href='#winners'
              className={`text-sm font-medium transition-all duration-300 ${
                isScrolled
                  ? isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                  : isDark
                    ? 'text-white hover:text-orange-300'
                    : 'text-slate-900 hover:text-orange-600'
              }`}
            >
              {t('common.winners')}
            </Link>
          </nav>

          {/* Right side - Theme toggle and auth */}
          <div className='flex items-center space-x-4'>
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

            {/* Auth Buttons */}
            {user ? (
              <Link
                href='/dashboard'
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isScrolled
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : isDark
                      ? 'bg-orange-500/80 text-white hover:bg-orange-600/80'
                      : 'bg-orange-500/80 text-white hover:bg-orange-600/80'
                } backdrop-blur-sm`}
              >
                {t('common.dashboard')}
              </Link>
            ) : (
              <div className='flex items-center space-x-3'>
                <Link
                  href='/auth/login'
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isScrolled
                      ? isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                      : isDark
                        ? 'text-white hover:text-orange-300'
                        : 'text-slate-900 hover:text-orange-600'
                  }`}
                >
                  {t('common.login')}
                </Link>
                <Link
                  href='/auth/register'
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isScrolled
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : isDark
                        ? 'bg-orange-500/80 text-white hover:bg-orange-600/80'
                        : 'bg-orange-500/80 text-white hover:bg-orange-600/80'
                  } backdrop-blur-sm`}
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
