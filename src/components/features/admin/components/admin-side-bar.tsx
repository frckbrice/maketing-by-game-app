'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Bell,
  FileText,
  Gamepad2,
  Home,
  LogOut,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  Menu,
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  Tag,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

interface AdminSidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    title: 'Games',
    href: '/admin/games',
    icon: Gamepad2,
    children: [
      { title: 'All Games', href: '/admin/games', icon: Gamepad2 },
      { title: 'Create Game', href: '/admin/create-game', icon: Gamepad2 },
      { title: 'Categories', href: '/admin/categories', icon: Tag },
    ],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    children: [
      { title: 'All Users', href: '/admin/users', icon: Users },
      { title: 'Vendors', href: '/admin/vendors', icon: ShoppingBag },
      { title: 'Admins', href: '/admin/admins', icon: Shield },
    ],
  },
  {
    title: 'Vendor Applications',
    href: '/admin/vendor-applications',
    icon: Building2,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    children: [
      { title: 'Overview', href: '/admin/analytics', icon: TrendingUp },
      { title: 'Revenue', href: '/admin/analytics/revenue', icon: DollarSign },
      { title: 'User Behavior', href: '/admin/analytics/users', icon: Users },
    ],
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    'Games',
    'Users',
  ]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const SidebarContent = () => (
    <div className='flex flex-col h-full'>
      {/* Logo */}
      <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
        <Link href='/admin' className='flex items-center'>
          <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3'>
            <Shield className='w-6 h-6 text-white' />
          </div>
          <div>
            <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
              Admin Panel
            </h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Lottery Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        {navigation.map(item => (
          <div key={item.title}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    expandedItems.includes(item.title)
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <div className='flex items-center'>
                    <item.icon className='w-5 h-5 mr-3' />
                    {item.title}
                  </div>
                  <div
                    className={cn(
                      'transform transition-transform',
                      expandedItems.includes(item.title) ? 'rotate-90' : ''
                    )}
                  >
                    <span className='text-xs'>▶</span>
                  </div>
                </button>

                {expandedItems.includes(item.title) && (
                  <div className='ml-6 mt-2 space-y-1'>
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-lg transition-colors',
                          pathname === child.href
                            ? 'bg-orange-500 text-white font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className='w-5 h-5 mr-3' />
                {item.title}
                {item.badge && (
                  <span className='ml-auto bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-2 py-0.5 rounded-full'>
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className='p-4 border-t border-gray-200 dark:border-gray-700 space-y-2'>
        <Button variant='ghost' asChild className='w-full justify-start'>
          <Link href='/'>
            <Home className='w-5 h-5 mr-3' />
            Back to Site
          </Link>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
          onClick={handleLogout}
        >
          <LogOut className='w-5 h-5 mr-3' />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className='lg:hidden fixed top-4 left-4 z-50'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className='bg-white dark:bg-gray-800'
        >
          {isMobileOpen ? (
            <X className='w-4 h-4' />
          ) : (
            <Menu className='w-4 h-4' />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/50 z-40'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'w-72',
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
