'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Gift,
  LogOut,
  Plus,
  Settings,
  Ticket,
  User,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#1a1a1a] flex items-center justify-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF5722]'></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-[#1a1a1a] text-white'>
      {/* Mobile Header */}
      <header className='lg:hidden bg-[#1a1a1a]/95 backdrop-blur-md border-b border-[#FF5722]/20 sticky top-0 z-50'>
        <div className='px-4 py-3'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-lg flex items-center justify-center'>
                <Gift className='w-5 h-5 text-white' />
              </div>
              <span className='text-lg font-bold bg-gradient-to-r from-[#FF5722] to-[#FF9800] bg-clip-text text-transparent'>
                {t('navigation.dashboard')}
              </span>
            </div>

            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='p-2 text-white hover:text-[#FF5722] transition-colors'
              >
                <Settings className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className='mt-4 pb-4 space-y-3'>
              <div className='flex items-center space-x-3 p-3 bg-[#FF5722]/10 rounded-lg'>
                <div className='w-10 h-10 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full flex items-center justify-center'>
                  <User className='w-5 h-5 text-white' />
                </div>
                <div>
                  <div className='text-sm text-gray-400'>
                    {t('common.welcome')},{' '}
                    <span className='font-semibold text-white'>{user.firstName} {user.lastName}</span>
                  </div>
                  <div className='text-xs text-gray-500'>{user.email}</div>
                </div>
              </div>

              <div className='space-y-2'>
                <Link
                  href='/profile'
                  className='block text-white hover:text-[#FF5722] transition-colors py-2'
                >
                  {t('navigation.profile')}
                </Link>
                <Link
                  href='/settings'
                  className='block text-white hover:text-[#FF5722] transition-colors py-2'
                >
                  {t('navigation.settings')}
                </Link>
                <button
                  onClick={handleLogout}
                  className='block w-full text-left text-white hover:text-[#FF5722] transition-colors py-2'
                >
                  {t('common.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Header */}
      <header className='hidden lg:block bg-[#1a1a1a]/95 backdrop-blur-md border-b border-[#FF5722]/20'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              <div className='w-10 h-10 bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-xl flex items-center justify-center'>
                <Gift className='w-6 h-6 text-white' />
              </div>
              <span className='text-2xl font-bold bg-gradient-to-r from-[#FF5722] to-[#FF9800] bg-clip-text text-transparent'>
                {t('navigation.dashboard')}
              </span>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-3'>
                <div className='text-sm text-gray-300'>
                  {t('common.welcome')},{' '}
                  <span className='font-semibold text-white'>{user.firstName} {user.lastName}</span>
                </div>
                <Button variant='outline' size='sm' onClick={handleLogout}>
                  <LogOut className='w-4 h-4 mr-2' />
                  {t('common.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto py-8 px-4 lg:px-6'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-[#FF5722]/20 to-[#FF9800]/20 rounded-2xl text-white p-6 lg:p-8 mb-8 border border-[#FF5722]/30'>
          <h1 className='text-2xl lg:text-3xl font-bold mb-2'>
            {t('dashboard.welcome', { name: `${user.firstName} ${user.lastName}` })} 🎉
          </h1>
          <p className='text-[#FF9800] text-lg'>
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8'>
          <div className='bg-[#0f0f0f] rounded-xl shadow-sm p-4 lg:p-6 border border-[#FF5722]/20'>
            <div className='flex items-center'>
              <div className='p-2 bg-[#FF5722]/20 rounded-lg'>
                <Gift className='w-5 h-5 lg:w-6 lg:h-6 text-[#FF5722]' />
              </div>
              <div className='ml-3 lg:ml-4'>
                <p className='text-sm font-medium text-gray-400'>
                  {t('dashboard.activeGames')}
                </p>
                <p className='text-xl lg:text-2xl font-bold text-white'>0</p>
              </div>
            </div>
          </div>

          <div className='bg-[#0f0f0f] rounded-xl shadow-sm p-4 lg:p-6 border border-[#FF5722]/20'>
            <div className='flex items-center'>
              <div className='p-2 bg-[#FF9800]/20 rounded-lg'>
                <Users className='w-5 h-5 lg:w-6 lg:h-6 text-[#FF9800]' />
              </div>
              <div className='ml-3 lg:ml-4'>
                <p className='text-sm font-medium text-gray-400'>
                  {t('dashboard.totalParticipants')}
                </p>
                <p className='text-xl lg:text-2xl font-bold text-white'>0</p>
              </div>
            </div>
          </div>

          <div className='bg-[#0f0f0f] rounded-xl shadow-sm p-4 lg:p-6 border border-[#FF5722]/20'>
            <div className='flex items-center'>
              <div className='p-2 bg-[#FF5722]/20 rounded-lg'>
                <Ticket className='w-5 h-5 lg:w-6 lg:h-6 text-[#FF5722]' />
              </div>
              <div className='ml-3 lg:ml-4'>
                <p className='text-sm font-medium text-gray-400'>
                  {t('dashboard.yourTickets')}
                </p>
                <p className='text-xl lg:text-2xl font-bold text-white'>0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
          {user.role === 'ADMIN' && (
            <div className='bg-[#0f0f0f] rounded-xl shadow-sm p-4 lg:p-6 border border-[#FF5722]/20 hover:border-[#FF5722]/40 transition-colors'>
              <div className='flex items-center mb-4'>
                <div className='p-2 bg-[#FF5722]/20 rounded-lg'>
                  <Plus className='w-5 h-5 lg:w-6 lg:h-6 text-[#FF5722]' />
                </div>
                <h3 className='ml-3 text-lg font-semibold text-white'>
                  {t('dashboard.createGame')}
                </h3>
              </div>
              <p className='text-gray-400 mb-4 text-sm lg:text-base'>
                {t('dashboard.createGameDescription')}
              </p>
              <Link href='/admin/create-game'>
                <Button className='w-full'>{t('dashboard.createNewGame')}</Button>
              </Link>
            </div>
          )}

          <div className='bg-[#0f0f0f] rounded-xl shadow-sm p-4 lg:p-6 border border-[#FF5722]/20 hover:border-[#FF5722]/40 transition-colors'>
            <div className='flex items-center mb-4'>
              <div className='p-2 bg-[#FF5722]/20 rounded-lg'>
                <Gift className='w-5 h-5 lg:w-6 lg:h-6 text-[#FF5722]' />
              </div>
              <h3 className='ml-3 text-lg font-semibold text-white'>
                {t('dashboard.viewGames')}
              </h3>
            </div>
            <p className='text-gray-400 mb-4 text-sm lg:text-base'>
              {t('dashboard.viewGamesDescription')}
            </p>
            <Link href='/games'>
              <Button className='w-full'>{t('dashboard.browseGames')}</Button>
            </Link>
          </div>

          <div className='bg-[#0f0f0f] rounded-xl shadow-sm p-4 lg:p-6 border border-[#FF9800]/20 hover:border-[#FF9800]/40 transition-colors'>
            <div className='flex items-center mb-4'>
              <div className='p-2 bg-[#FF9800]/20 rounded-lg'>
                <Ticket className='w-5 h-5 lg:w-6 lg:h-6 text-[#FF9800]' />
              </div>
              <h3 className='ml-3 text-lg font-semibold text-white'>
                {t('dashboard.myTickets')}
              </h3>
            </div>
            <p className='text-gray-400 mb-4 text-sm lg:text-base'>
              {t('dashboard.myTicketsDescription')}
            </p>
            <Link href='/tickets'>
              <Button className='w-full'>{t('dashboard.viewTickets')}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
