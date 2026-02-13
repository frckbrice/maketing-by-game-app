'use client';

import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import { firestoreService } from '@/lib/firebase/services';
import {
  Activity,
  BarChart3,
  Building2,
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    totalWinners: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    activeGames: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
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

  // Fetch admin statistics
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (user && user.role === 'ADMIN') {
        try {
          setLoadingStats(true);
          // Fetch various statistics
          const [users, games, winners, applications] = await Promise.all([
            (firestoreService as any).getAllUsers(),
            (firestoreService as any).getAllGames(),
            firestoreService.getWinners(),
            (firestoreService as any).getAllVendorApplications(),
          ]);

          setStats({
            totalUsers: users.length,
            totalGames: games.length,
            totalWinners: winners.length,
            pendingApplications: applications.filter(
              (app: any) => app.status === 'PENDING'
            ).length,
            totalRevenue: 0, // TODO: Calculate from transactions
            activeGames: games.filter((game: any) => game.status === 'ACTIVE')
              .length,
          });
        } catch (error) {
          console.error('Error fetching admin stats:', error);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    fetchAdminStats();
  }, [user]);

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

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Admin Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-red-500 rounded-full'>
              <Shield className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                {t('admin.adminDashboard')}
              </h1>
              <p className='text-gray-600 dark:text-gray-300'>
                {t('admin.welcomeMessage')}, {user.firstName}!
              </p>
            </div>
          </div>
          <div className='mt-4'>
            <Badge
              variant='outline'
              className='text-sm border-red-500 text-red-600 dark:text-red-400'
            >
              ADMIN
            </Badge>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.totalUsers')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {loadingStats ? '...' : stats.totalUsers}
                </p>
              </div>
              <Users className='w-8 h-8 text-blue-500' />
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.totalGames')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {loadingStats ? '...' : stats.totalGames}
                </p>
              </div>
              <Gamepad2 className='w-8 h-8 text-green-500' />
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

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
              <Plus className='w-5 h-5 text-green-500 mr-2' />
              {t('admin.contentManagement')}
            </h3>
            <div className='space-y-3'>
              <button
                onClick={() => router.push('/admin/categories')}
                className='w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors text-left'
              >
                {t('admin.manageCategories')}
              </button>
              <button
                onClick={() => router.push('/admin/games')}
                className='w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors text-left'
              >
                {t('admin.manageGames')}
              </button>
              <button
                onClick={() => router.push('/admin/winners')}
                className='w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-colors text-left'
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
            <div className='space-y-3'>
              <button
                onClick={() => router.push('/admin/users')}
                className='w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors text-left'
              >
                {t('admin.manageUsers')}
              </button>
              <button
                onClick={() => router.push('/admin/vendor-applications')}
                className='w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors text-left'
              >
                {t('admin.vendorApplications')}
              </button>
              <button
                onClick={() => router.push('/admin/roles')}
                className='w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors text-left'
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
            <div className='space-y-3'>
              <button
                onClick={() => router.push('/admin/settings')}
                className='w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors text-left'
              >
                {t('admin.generalSettings')}
              </button>
              <button
                onClick={() => router.push('/admin/notifications')}
                className='w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition-colors text-left'
              >
                {t('admin.notificationSettings')}
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className='w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-md transition-colors text-left'
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
