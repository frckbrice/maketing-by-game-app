'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useAdminStats } from '@/hooks/useApi';
import {
  Activity,
  BarChart3,
  Building2,
  DollarSign,
  Gamepad2,
  Plus,
  Settings,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // TanStack Query hook for admin stats
  const {
    data: stats = {
      totalUsers: 0,
      totalGames: 0,
      totalWinners: 0,
      pendingApplications: 0,
      totalRevenue: 0,
      activeGames: 0,
    },
    isLoading: loadingStats,
  } = useAdminStats();
  const router = useRouter();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <Shield className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('admin.accessDenied')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {t('admin.adminOnly')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className='mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md transition-colors'
          >
            {t('common.goBack')}
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

      <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Admin Header */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex items-center space-x-3 sm:space-x-4'>
            <div className='p-2 sm:p-3 bg-red-500 rounded-full'>
              <Shield className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
            </div>
            <div>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight'>
                {t('admin.adminDashboard')}
              </h1>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1'>
                {t('admin.welcomeMessage')}, {user.firstName}!
              </p>
            </div>
          </div>
          <div className='mt-3 sm:mt-4'>
            <Badge
              variant='outline'
              className='text-xs sm:text-sm border-red-500 text-red-600 dark:text-red-400 px-2 py-1'
            >
              ADMIN
            </Badge>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight'>
                  {t('admin.totalUsers')}
                </p>
                <p className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1'>
                  {loadingStats ? '...' : stats.totalUsers}
                </p>
              </div>
              <Users className='w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight'>
                  {t('admin.totalGames')}
                </p>
                <p className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1'>
                  {loadingStats ? '...' : stats.totalGames}
                </p>
              </div>
              <Gamepad2 className='w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.pendingApplications')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {loadingStats ? '...' : stats.pendingApplications}
                </p>
              </div>
              <Building2 className='w-8 h-8 text-orange-500' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.activeGames')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {loadingStats ? '...' : stats.activeGames}
                </p>
              </div>
              <Activity className='w-8 h-8 text-purple-500' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.totalWinners')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {loadingStats ? '...' : stats.totalWinners}
                </p>
              </div>
              <Trophy className='w-8 h-8 text-yellow-500' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.totalRevenue')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {loadingStats
                    ? '...'
                    : `$${stats.totalRevenue.toLocaleString()}`}
                </p>
              </div>
              <BarChart3 className='w-8 h-8 text-green-500' />
            </div>
          </div>
        </div>

        {/* Marketplace Analytics Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white flex items-center'>
                <Building2 className='w-6 h-6 text-purple-500 mr-3' />
                {t('admin.marketplace.overview')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
                {t('admin.marketplace.overviewDescription')}
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/marketplace')}
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-sm font-medium'
            >
              {t('admin.marketplace.viewDetailed')}
            </button>
          </div>

          {/* Marketplace Quick Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg'>
              <div className='w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Building2 className='w-6 h-6 text-white' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                45
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.marketplace.totalShops')}
              </p>
            </div>

            <div className='text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg'>
              <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Building2 className='w-6 h-6 text-white' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                326
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.marketplace.totalProducts')}
              </p>
            </div>

            <div className='text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg'>
              <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <Building2 className='w-6 h-6 text-white' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                1.2K
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.marketplace.totalOrders')}
              </p>
            </div>

            <div className='text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg'>
              <div className='w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2'>
                <DollarSign className='w-6 h-6 text-white' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                $89K
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.marketplace.totalRevenue')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center'>
              <Plus className='w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2' />
              {t('admin.contentManagement')}
            </h3>
            <div className='space-y-2 sm:space-y-3'>
              <button
                onClick={() => router.push('/admin/categories')}
                className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 sm:py-2.5 px-4 sm:px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.manageCategories')}
              </button>
              <button
                onClick={() => router.push('/admin/games')}
                className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 sm:py-2.5 px-4 sm:px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.manageGames')}
              </button>
              <button
                onClick={() => router.push('/admin/winners')}
                className='w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 sm:py-2.5 px-4 sm:px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.manageWinners')}
              </button>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
              <Users className='w-5 h-5 text-blue-500 mr-2' />
              {t('admin.userManagement')}
            </h3>
            <div className='space-y-2 sm:space-y-3'>
              <button
                onClick={() => router.push('/admin/users')}
                className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.manageUsers')}
              </button>
              <button
                onClick={() => router.push('/admin/vendor-applications')}
                className='w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.vendorApplications')}
              </button>
              <button
                onClick={() => router.push('/admin/roles')}
                className='w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.manageRoles')}
              </button>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
              <Settings className='w-5 h-5 text-gray-500 mr-2' />
              {t('admin.systemSettings')}
            </h3>
            <div className='space-y-2 sm:space-y-3'>
              <button
                onClick={() => router.push('/admin/settings')}
                className='w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.generalSettings')}
              </button>
              <button
                onClick={() => router.push('/admin/notifications')}
                className='w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.notificationSettings')}
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className='w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left text-sm sm:text-base font-medium'
              >
                {t('admin.analytics')}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            {t('admin.recentActivity')}
          </h3>
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <Activity className='w-12 h-12 mx-auto mb-2 opacity-50' />
            <p>{t('admin.noRecentActivity')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
