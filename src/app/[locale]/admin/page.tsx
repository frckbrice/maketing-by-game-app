'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Award, Gamepad2, Menu, TrendingUp, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QUICK_ACTIONS, STATS } from '../../../lib/constants';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-lottery-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lottery-500'></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className='min-h-screen bg-lottery-900'>
      {/* Mobile Navigation */}
      <div className='lg:hidden'>
        <div className='bg-lottery-800/50 backdrop-blur-sm border-b border-lottery-700/30 p-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-bold text-white'>Admin Dashboard</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='text-lottery-300 hover:text-white transition-colors'
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
          <div className='bg-lottery-800/50 backdrop-blur-sm border-b border-lottery-700/30 p-4'>
            <nav className='space-y-2'>
              <Link
                href='/dashboard'
                className='block text-lottery-300 hover:text-white transition-colors py-2'
              >
                ← Back to Dashboard
              </Link>
              <Link
                href='/'
                className='block text-lottery-300 hover:text-white transition-colors py-2'
              >
                Home
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className='hidden lg:block bg-lottery-800/50 backdrop-blur-sm border-b border-lottery-700/30'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-white'>Admin Dashboard</h1>
              <p className='text-lottery-300 mt-1'>
                Manage your lottery platform
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <Link href='/dashboard'>
                <Button
                  variant='outline'
                  className='border-lottery-600 text-lottery-300 hover:bg-lottery-700'
                >
                  ← Back to Dashboard
                </Button>
              </Link>
              <Link href='/'>
                <Button
                  variant='outline'
                  className='border-lottery-600 text-lottery-300 hover:bg-lottery-700'
                >
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 py-8 lg:px-6'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <div className='bg-gradient-to-r from-lottery-800/50 to-lottery-700/50 backdrop-blur-sm rounded-2xl p-6 border border-lottery-700/30'>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Welcome back, {user.firstName} {user.lastName}! 👋
            </h2>
            <p className='text-lottery-300'>
              Here&apos;s what&apos;s happening with your lottery platform
              today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {STATS.map((stat, index) => (
            <div
              key={index}
              className='bg-lottery-800/50 backdrop-blur-sm rounded-2xl p-6 border border-lottery-700/30 hover:border-lottery-600/50 transition-all duration-200'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-lottery-300 text-sm font-medium'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-white mt-1'>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className='w-6 h-6 text-white' />
                </div>
              </div>
              <div className='flex items-center mt-4'>
                <TrendingUp className='w-4 h-4 text-green-400 mr-1' />
                <span className='text-green-400 text-sm font-medium'>
                  {stat.change}
                </span>
                <span className='text-lottery-400 text-sm ml-1'>
                  from last month
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className='mb-8'>
          <h3 className='text-xl font-bold text-white mb-6'>Quick Actions</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {QUICK_ACTIONS.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className='bg-lottery-800/50 backdrop-blur-sm rounded-2xl p-6 border border-lottery-700/30 hover:border-lottery-600/50 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer group'>
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <action.icon className='w-8 h-8 text-white' />
                  </div>
                  <h4 className='text-lg font-semibold text-white mb-2'>
                    {action.title}
                  </h4>
                  <p className='text-lottery-300 text-sm'>
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-lottery-800/50 backdrop-blur-sm rounded-2xl p-6 border border-lottery-700/30'>
          <h3 className='text-xl font-bold text-white mb-6'>Recent Activity</h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between py-3 border-b border-lottery-700/30'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-lottery-600 rounded-full flex items-center justify-center'>
                  <Users className='w-4 h-4 text-white' />
                </div>
                <div>
                  <p className='text-white font-medium'>New user registered</p>
                  <p className='text-lottery-300 text-sm'>
                    john.doe@example.com
                  </p>
                </div>
              </div>
              <span className='text-lottery-400 text-sm'>2 minutes ago</span>
            </div>

            <div className='flex items-center justify-between py-3 border-b border-lottery-700/30'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-lottery-500 rounded-full flex items-center justify-center'>
                  <Gamepad2 className='w-4 h-4 text-white' />
                </div>
                <div>
                  <p className='text-white font-medium'>New game created</p>
                  <p className='text-lottery-300 text-sm'>
                    Weekend Special Lottery
                  </p>
                </div>
              </div>
              <span className='text-lottery-400 text-sm'>1 hour ago</span>
            </div>

            <div className='flex items-center justify-between py-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-lottery-700 rounded-full flex items-center justify-center'>
                  <Award className='w-4 h-4 text-white' />
                </div>
                <div>
                  <p className='text-white font-medium'>Winner announced</p>
                  <p className='text-lottery-300 text-sm'>
                    Game #123 - $500 prize
                  </p>
                </div>
              </div>
              <span className='text-lottery-400 text-sm'>3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
