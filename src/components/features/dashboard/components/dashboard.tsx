'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const DashboardPage = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect based on user role and authentication
  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      router.push('/');
    } else if (!loading && user && !redirecting) {
      // Redirect USER role to games page, they don't need dashboard
      if (user.role === 'USER') {
        setRedirecting(true);
        router.push('/games');
      }
    }
  }, [user, loading, router, redirecting]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  if (loading || redirecting) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>
            {redirecting ? t('common.redirecting') : t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('dashboard.accessDenied')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {t('dashboard.pleaseLogin')}
          </p>
          <button
            onClick={() => router.push('/')}
            className='mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md transition-colors'
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Desktop Header */}
      <DesktopHeader
        isDark={isDark}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      />

      {/* Mobile Navigation */}
      <MobileNavigation
        isDark={isDark}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
      />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            {t('dashboard.welcome')}, {user.firstName}!
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mt-2'>
            {user.role === 'USER'
              ? t('dashboard.playerWelcome')
              : user.role === 'VENDOR'
                ? t('dashboard.vendorWelcome')
                : t('dashboard.adminWelcome')}
          </p>
          <div className='mt-2'>
            <Badge variant='outline' className='text-sm'>
              {user.role}
            </Badge>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Profile Card */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              {t('dashboard.profile')}
            </h2>
            <div className='space-y-3'>
              <div>
                <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  {t('common.name')}
                </label>
                <p className='text-gray-900 dark:text-white'>
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  {t('common.email')}
                </label>
                <p className='text-gray-900 dark:text-white'>{user.email}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  {t('common.role')}
                </label>
                <p className='text-gray-900 dark:text-white'>{user.role}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              {t('dashboard.quickActions')}
            </h2>
            <div className='space-y-3'>
              {user.role === 'USER' ? (
                <>
                  <button
                    onClick={() => router.push('/games')}
                    className='w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors'
                  >
                    {t('dashboard.browseGames')}
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className='w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors'
                  >
                    {t('dashboard.viewHistory')}
                  </button>
                </>
              ) : user.role === 'VENDOR' ? (
                <>
                  <button
                    onClick={() => router.push('/admin/create-game')}
                    className='w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors'
                  >
                    {t('dashboard.createGame')}
                  </button>
                  <button
                    onClick={() => router.push('/admin/games')}
                    className='w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors'
                  >
                    {t('dashboard.manageGames')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/admin')}
                    className='w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors'
                  >
                    {t('dashboard.adminPanel')}
                  </button>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className='w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors'
                  >
                    {t('dashboard.manageUsers')}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              {t('dashboard.stats')}
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-500 dark:text-gray-400'>
                  {t('dashboard.gamesPlayed')}
                </span>
                <span className='text-gray-900 dark:text-white font-semibold'>
                  0
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 dark:text-gray-400'>
                  {t('dashboard.wins')}
                </span>
                <span className='text-gray-900 dark:text-white font-semibold'>
                  0
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 dark:text-gray-400'>
                  {t('dashboard.totalWinnings')}
                </span>
                <span className='text-gray-900 dark:text-white font-semibold'>
                  $0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
