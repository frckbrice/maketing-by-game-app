'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PasswordResetForm } from '../../reset-password/components/PasswordResetForm';

export function ForgotPasswd() {
  const { t } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';
  const handleThemeToggle = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Desktop Header */}
      <DesktopHeader isDark={isDark} onThemeToggle={handleThemeToggle} />

      {/* Mobile Navigation */}
      <MobileNavigation
        isDark={isDark}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onThemeToggle={handleThemeToggle}
      />

      <div className='flex items-center justify-center min-h-[calc(100vh-8rem)] p-4'>
        <div className='w-full max-w-md'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              {t('auth.forgotPassword.title')}
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              {t('auth.forgotPassword.subtitle')}
            </p>
          </div>

          {/* Password Reset Form */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700'>
            <PasswordResetForm />
          </div>

          {/* Back to Login */}
          <div className='text-center mt-6'>
            <Link
              href='/auth/login'
              className='text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors text-sm flex items-center justify-center gap-2'
            >
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
