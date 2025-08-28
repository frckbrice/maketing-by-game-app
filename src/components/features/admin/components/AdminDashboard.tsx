'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import { adminService } from '@/lib/api/adminService';
import { currencyService } from '@/lib/api/currencyService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Gamepad2,
  DollarSign,
  Trophy,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Bell,
  Shield,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminStats {
  activeUsers: number;
  totalUsers: number;
  activeGames: number;
  totalGames: number;
  totalRevenue: number;
  todayRevenue: number;
  totalTicketsSold: number;
  todayTicketsSold: number;
  totalWinners: number;
  monthlyRevenue: number;
  userGrowth: Array<{ date: string; users: number }>;
  revenueChart: Array<{ date: string; revenue: number }>;
  popularCategories: Array<{ name: string; games: number; revenue: number }>;
  topGames: Array<{ title: string; participants: number; revenue: number }>;
}

const COLORS = ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

export function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await adminService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    if (user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [user, loading, router, fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <Shield className='w-8 h-8 text-orange-500 mr-3' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Admin Dashboard
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  System overview and management
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant='outline'
                size='sm'
                className='flex items-center'
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button asChild size='sm'>
                <Link href='/admin/create-game'>
                  <Plus className='w-4 h-4 mr-2' />
                  Create Game
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {statsLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className='animate-pulse'>
                <CardContent className='p-6'>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2'></div>
                  <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        Active Users
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                        {stats.activeUsers.toLocaleString()}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        of {stats.totalUsers.toLocaleString()} total
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center'>
                      <Users className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        Active Games
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                        {stats.activeGames}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        of {stats.totalGames} total
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center'>
                      <Gamepad2 className='w-6 h-6 text-green-600 dark:text-green-400' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        Total Revenue
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                        {currencyService.formatCurrency(
                          stats.totalRevenue,
                          'USD'
                        )}
                      </p>
                      <div className='flex items-center text-xs'>
                        <TrendingUp className='w-3 h-3 text-green-500 mr-1' />
                        <span className='text-green-600 dark:text-green-400'>
                          +
                          {currencyService.formatCurrency(
                            stats.todayRevenue,
                            'USD'
                          )}{' '}
                          today
                        </span>
                      </div>
                    </div>
                    <div className='w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center'>
                      <DollarSign className='w-6 h-6 text-orange-600 dark:text-orange-400' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        Total Winners
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                        {stats.totalWinners}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {stats.totalTicketsSold.toLocaleString()} tickets sold
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center'>
                      <Trophy className='w-6 h-6 text-yellow-600 dark:text-yellow-400' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <BarChart3 className='w-5 h-5 mr-2' />
                    Revenue Trend (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={stats.revenueChart}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis
                          dataKey='date'
                          tick={{ fontSize: 12 }}
                          tickFormatter={value =>
                            new Date(value).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={value => [
                            currencyService.formatCurrency(
                              Number(value),
                              'USD'
                            ),
                            'Revenue',
                          ]}
                          labelFormatter={label =>
                            new Date(label).toLocaleDateString()
                          }
                        />
                        <Line
                          type='monotone'
                          dataKey='revenue'
                          stroke='#f97316'
                          strokeWidth={2}
                          dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Activity className='w-5 h-5 mr-2' />
                    User Growth (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={stats.userGrowth}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis
                          dataKey='date'
                          tick={{ fontSize: 12 }}
                          tickFormatter={value =>
                            new Date(value).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={value => [value, 'New Users']}
                          labelFormatter={label =>
                            new Date(label).toLocaleDateString()
                          }
                        />
                        <Bar
                          dataKey='users'
                          fill='#3b82f6'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Popular Categories and Top Games */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
              {/* Popular Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <PieChartIcon className='w-5 h-5 mr-2' />
                    Popular Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={stats.popularCategories}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='revenue'
                        >
                          {stats.popularCategories.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={value => [
                            currencyService.formatCurrency(
                              Number(value),
                              'USD'
                            ),
                            'Revenue',
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Games */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Trophy className='w-5 h-5 mr-2' />
                    Top Performing Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {stats.topGames.map((game, index) => (
                      <div
                        key={game.title}
                        className='flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700'
                      >
                        <div className='flex items-center'>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                              index === 0
                                ? 'bg-yellow-500'
                                : index === 1
                                  ? 'bg-gray-400'
                                  : index === 2
                                    ? 'bg-orange-600'
                                    : 'bg-gray-300'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className='font-medium text-gray-900 dark:text-white text-sm'>
                              {game.title}
                            </p>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                              {game.participants} participants
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-gray-900 dark:text-white text-sm'>
                            {currencyService.formatCurrency(
                              game.revenue,
                              'USD'
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Button asChild className='h-24 flex-col' variant='outline'>
                <Link href='/admin/games'>
                  <Gamepad2 className='w-8 h-8 mb-2' />
                  <span>Manage Games</span>
                </Link>
              </Button>

              <Button asChild className='h-24 flex-col' variant='outline'>
                <Link href='/admin/users'>
                  <Users className='w-8 h-8 mb-2' />
                  <span>Manage Users</span>
                </Link>
              </Button>

              <Button asChild className='h-24 flex-col' variant='outline'>
                <Link href='/admin/vendors'>
                  <FileText className='w-8 h-8 mb-2' />
                  <span>Manage Vendors</span>
                </Link>
              </Button>

              <Button asChild className='h-24 flex-col' variant='outline'>
                <Link href='/admin/analytics'>
                  <BarChart3 className='w-8 h-8 mb-2' />
                  <span>Analytics</span>
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-300'>
              Loading dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
