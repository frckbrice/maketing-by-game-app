'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  BarChart3,
  Gamepad2,
  LogOut,
  Settings,
  Trophy,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleGamesClick = () => {
    router.push('/games');
  };

  const handleDashboardClick = () => {
    if (user.role === 'USER') {
      router.push('/games'); // Users go to games page
    } else {
      router.push('/dashboard'); // Vendors and Admins go to dashboard
    }
  };

  const handleAdminClick = () => {
    if (user.role === 'ADMIN') {
      router.push('/admin');
    }
  };

  // Generate initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center space-x-2 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback className='bg-orange-500 text-white text-base font-semibold'>
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-64' align='end'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {user.firstName} {user.lastName}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
            <p className='text-xs leading-none text-orange-500 font-medium'>
              {user.role}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Role-specific navigation */}
        {user.role === 'USER' && (
          <>
            <DropdownMenuItem onClick={handleGamesClick}>
              <Gamepad2 className='mr-3 h-5 w-5' />
              <span className='text-base'>{t('navigation.games')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className='mr-3 h-5 w-5' />
              <span className='text-base'>{t('navigation.profile')}</span>
            </DropdownMenuItem>
          </>
        )}

        {(user.role === 'VENDOR' || user.role === 'ADMIN') && (
          <>
            <DropdownMenuItem onClick={handleDashboardClick}>
              <BarChart3 className='mr-3 h-5 w-5' />
              <span className='text-base'>{t('navigation.dashboard')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className='mr-3 h-5 w-5' />
              <span className='text-base'>{t('navigation.profile')}</span>
            </DropdownMenuItem>
          </>
        )}

        {user.role === 'ADMIN' && (
          <DropdownMenuItem onClick={handleAdminClick}>
            <Settings className='mr-2 h-4 w-4' />
            <span>{t('navigation.admin')}</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => router.push('/winners')}>
          <Trophy className='mr-2 h-4 w-4' />
          <span>{t('navigation.winners')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className='text-red-600 dark:text-red-400'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>{t('navigation.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
