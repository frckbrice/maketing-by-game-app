'use client';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { UserProfileDropdown } from '@/components/ui/UserProfileDropdown';
import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DesktopHeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function DesktopHeader({ isDark, onThemeToggle }: DesktopHeaderProps) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    // Initialize on mount in case the page is already scrolled
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
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
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 py-2'>
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            className='flex items-center space-x-3 cursor-pointer group'
          >
            <div className='w-16 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
              <Image
                src='/en/icons/lottery_logo.jpeg'
                alt='BlackFriday Marketing App Logo'
                width={64}
                height={64}
                className='rounded-2xl w-full h-full object-cover'
                priority
              />
            </div>
            <span
              className={`font-bold text-2xl transition-colors duration-300 group-hover:text-orange-500 ${
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
              className={`text-base font-semibold transition-all duration-300 hover:scale-105 ${
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
              href='/#how-it-works'
              className={`text-base font-semibold transition-all duration-300 hover:scale-105 ${
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
              href='/winners'
              className={`text-base font-semibold transition-all duration-300 hover:scale-105 ${
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
            <Link
              href='/about'
              className={`text-base font-semibold transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                  : isDark
                    ? 'text-white hover:text-orange-300'
                    : 'text-slate-900 hover:text-orange-600'
              }`}
            >
              {t('common.aboutUs')}
            </Link>
          </nav>

          {/* Right side - Theme toggle and auth */}
          <div className='flex items-center space-x-4'>
            {/* Language Switcher */}
            <LocaleSwitcher />

            {/* Theme Toggle Button */}
            <button
              onClick={onThemeToggle}
              className={`p-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 text-xl ${
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
            {loading ? (
              // Loading state - show skeleton to prevent layout shift
              <div className='flex items-center space-x-3'>
                <div className='w-16 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
                <div className='w-20 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
              </div>
            ) : user ? (
              <UserProfileDropdown />
            ) : (
              <div className='flex items-center space-x-3'>
                <Link
                  href='/auth/login'
                  className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 ${
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
                  className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 ${
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
