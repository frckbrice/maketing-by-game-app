'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  BarChart3,
  Building2,
  Calendar,
  ChevronDown,
  Crown,
  GamepadIcon,
  Home,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/vendor-dashboard',
    icon: Home,
    current: false,
  },
  {
    name: 'My Games',
    href: '/vendor-dashboard/games',
    icon: GamepadIcon,
    current: false,
  },
  {
    name: 'Create Game',
    href: '/vendor-dashboard/create-game',
    icon: Plus,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/vendor-dashboard/analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Earnings',
    href: '/vendor-dashboard/earnings',
    icon: TrendingUp,
    current: false,
  },
];

export function VendorLayout({ children }: VendorLayoutProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect non-vendors
  useEffect(() => {
    if (user && user.role !== 'VENDOR' && user.role !== 'ADMIN') {
      router.push('/games');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <Card className='p-8 text-center'>
          <Building2 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            {t('vendor.accessDenied')}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            You need vendor privileges to access this area.
          </p>
          <div className='space-y-2'>
            <Button asChild className='w-full'>
              <Link href='/games'>{t('common.goBack')}</Link>
            </Button>
            <Button variant='outline' asChild className='w-full'>
              <Link href='/vendor-application'>
                {t('vendor.becomeAVendor')}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Update current navigation item
  const navigationWithCurrent = navigation.map(item => ({
    ...item,
    current: pathname === item.href,
  }));

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div
            className='fixed inset-0 bg-gray-600/75'
            onClick={() => setSidebarOpen(false)}
          />

          <div className='fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl'>
            <div className='flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex items-center'>
                <Crown className='w-8 h-8 text-orange-500' />
                <span className='ml-2 text-xl font-bold text-gray-900 dark:text-white'>
                  {t('vendor.dashboard')}
                </span>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSidebarOpen(false)}
              >
                <X className='w-5 h-5' />
              </Button>
            </div>

            <nav className='mt-6 px-3'>
              <div className='space-y-1'>
                {navigationWithCurrent.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        item.current
                          ? 'text-orange-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className='hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-64 lg:flex lg:flex-col'>
        <div className='flex flex-col flex-grow bg-white dark:bg-gray-800 shadow-xl'>
          <div className='flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700'>
            <Crown className='w-8 h-8 text-orange-500' />
            <span className='ml-2 text-xl font-bold text-gray-900 dark:text-white'>
              {t('vendor.dashboard')}
            </span>
          </div>

          <nav className='mt-6 flex-1 px-3'>
            <div className='space-y-1'>
              {navigationWithCurrent.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current
                        ? 'text-orange-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User info */}
          <div className='flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-medium text-sm'>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
              </div>
              <div className='ml-3 flex-1'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {user.firstName} {user.lastName}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {user.role === 'ADMIN' ? 'Administrator' : 'Vendor'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:ml-64 flex flex-col flex-1'>
        {/* Top bar */}
        <div className='sticky top-0 z-30 flex h-16 items-center justify-between bg-white dark:bg-gray-800 px-4 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:px-6'>
          <Button
            variant='ghost'
            size='sm'
            className='lg:hidden'
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className='w-5 h-5' />
            <span className='sr-only'>Open sidebar</span>
          </Button>

          <div className='flex items-center space-x-4'>
            {/* Theme Toggle */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className='w-5 h-5' />
              ) : (
                <Moon className='w-5 h-5' />
              )}
              <span className='sr-only'>Toggle theme</span>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-medium text-xs'>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <ChevronDown className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/profile'>
                    <User className='w-4 h-4 mr-2' />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/settings'>
                    <Settings className='w-4 h-4 mr-2' />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='w-4 h-4 mr-2' />
                  {t('common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}
