'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
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
  Calendar,
  DollarSign,
  Eye,
  GamepadIcon,
  Plus,
  TrendingUp,
  Users,
  Activity,
  Award,
  Clock,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vendorService } from '@/lib/api/vendorService';

interface VendorStats {
  totalGames: number;
  activeGames: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalParticipants: number;
  averageParticipation: number;
  conversionRate: number;
  pendingApprovals: number;
}

interface RecentGame {
  id: string;
  title: string;
  status: string;
  participants: number;
  revenue: number;
  endDate: number;
}

const CHART_COLORS = ['#FF5722', '#FF9800', '#FFC107', '#4CAF50', '#2196F3'];

export function VendorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [revenueChart, setRevenueChart] = useState<
    Array<{ date: string; revenue: number }>
  >([]);
  const [participationChart, setParticipationChart] = useState<
    Array<{ name: string; value: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'VENDOR' || user.role === 'ADMIN')) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, gamesData, revenueData, participationData] =
        await Promise.all([
          vendorService.getVendorStats(user!.id),
          vendorService.getVendorGames(user!.id, { limit: 5 }),
          vendorService.getRevenueChart(user!.id),
          vendorService.getParticipationChart(user!.id),
        ]);

      setStats(statsData);
      // Transform LotteryGame to RecentGame format
      const transformedGames = gamesData.data.map(game => ({
        id: game.id,
        title: game.title,
        status: game.status,
        participants: game.currentParticipants || 0,
        revenue: 0, // Calculate from tickets if needed
        endDate: game.endDate,
      }));
      setRecentGames(transformedGames);
      setRevenueChart(revenueData);
      setParticipationChart(participationData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set mock data for development
      setStats({
        totalGames: 12,
        activeGames: 8,
        totalRevenue: 15680.5,
        monthlyRevenue: 3240.75,
        totalParticipants: 2847,
        averageParticipation: 237,
        conversionRate: 68.5,
        pendingApprovals: 2,
      });
      setRecentGames([
        {
          id: '1',
          title: 'iPhone 15 Pro Max Contest',
          status: 'ACTIVE',
          participants: 456,
          revenue: 2280,
          endDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        },
        {
          id: '2',
          title: 'Nike Air Jordan Giveaway',
          status: 'DRAWING',
          participants: 234,
          revenue: 1170,
          endDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
        },
        {
          id: '3',
          title: 'MacBook Pro Bundle',
          status: 'PENDING',
          participants: 0,
          revenue: 0,
          endDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
        },
      ]);
      setRevenueChart([
        { date: '2024-01-01', revenue: 1200 },
        { date: '2024-01-02', revenue: 1800 },
        { date: '2024-01-03', revenue: 1500 },
        { date: '2024-01-04', revenue: 2200 },
        { date: '2024-01-05', revenue: 1900 },
        { date: '2024-01-06', revenue: 2400 },
        { date: '2024-01-07', revenue: 2100 },
      ]);
      setParticipationChart([
        { name: 'Tech & Phones', value: 35 },
        { name: 'Fashion', value: 25 },
        { name: 'Home Appliances', value: 20 },
        { name: 'Computers', value: 20 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: <Badge className='bg-green-500 text-white'>Active</Badge>,
      PENDING: (
        <Badge className='bg-yellow-500 text-white'>Pending Approval</Badge>
      ),
      DRAWING: <Badge className='bg-blue-500 text-white'>Drawing Soon</Badge>,
      CLOSED: <Badge className='bg-gray-500 text-white'>Closed</Badge>,
      DRAFT: <Badge className='bg-gray-400 text-white'>Draft</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>Unknown</Badge>;
  };

  if (loading) {
    return (
      <div className='space-y-6 animate-pulse'>
        <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-32 bg-gray-200 dark:bg-gray-700 rounded-lg'
            />
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='h-80 bg-gray-200 dark:bg-gray-700 rounded-lg' />
          <div className='h-80 bg-gray-200 dark:bg-gray-700 rounded-lg' />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            {t('vendor.welcomeMessage')}
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Here&apos;s what&apos;s happening with your games today.
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button asChild>
            <Link href='/vendor-dashboard/create-game'>
              <Plus className='w-4 h-4 mr-2' />
              {t('vendor.createGame')}
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/vendor-dashboard/analytics'>
              <BarChart className='w-4 h-4 mr-2' />
              {t('vendor.analytics')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total Games
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats?.totalGames || 0}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center'>
                <GamepadIcon className='w-6 h-6 text-blue-600 dark:text-blue-400' />
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
                  {stats?.activeGames || 0}
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center'>
                <Activity className='w-6 h-6 text-green-600 dark:text-green-400' />
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
                  ${stats?.totalRevenue.toFixed(2) || '0.00'}
                </p>
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
                  Total Participants
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats?.totalParticipants.toLocaleString() || 0}
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center'>
                <Users className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <TrendingUp className='w-5 h-5 mr-2' />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='date'
                    tickFormatter={value =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={value =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={value => [`$${value}`, 'Revenue']}
                  />
                  <Line
                    type='monotone'
                    dataKey='revenue'
                    stroke='#FF5722'
                    strokeWidth={2}
                    dot={{ fill: '#FF5722', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Participation Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Award className='w-5 h-5 mr-2' />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={participationChart}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {participationChart.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center'>
              <Clock className='w-5 h-5 mr-2' />
              Recent Games
            </div>
            <Button variant='outline' size='sm' asChild>
              <Link href='/vendor-dashboard/games'>View All</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentGames.length > 0 ? (
              recentGames.map(game => (
                <div
                  key={game.id}
                  className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center'>
                      <GamepadIcon className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <h3 className='font-medium text-gray-900 dark:text-white'>
                        {game.title}
                      </h3>
                      <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                        <span className='flex items-center'>
                          <Users className='w-4 h-4 mr-1' />
                          {game.participants} participants
                        </span>
                        <span className='flex items-center'>
                          <DollarSign className='w-4 h-4 mr-1' />${game.revenue}
                        </span>
                        <span className='flex items-center'>
                          <Calendar className='w-4 h-4 mr-1' />
                          {new Date(game.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    {getStatusBadge(game.status)}
                    <Button variant='ghost' size='sm' asChild>
                      <Link href={`/vendor-dashboard/games/${game.id}`}>
                        <Eye className='w-4 h-4' />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-8'>
                <GamepadIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  No games yet
                </h3>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  Create your first game to start earning revenue.
                </p>
                <Button asChild>
                  <Link href='/vendor-dashboard/create-game'>
                    <Plus className='w-4 h-4 mr-2' />
                    {t('vendor.createGame')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='hover:shadow-lg transition-shadow cursor-pointer group'>
          <Link href='/vendor-dashboard/create-game' className='block'>
            <CardContent className='p-6 text-center'>
              <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform'>
                <Plus className='w-8 h-8 text-blue-600 dark:text-blue-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Create New Game
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Design and launch a new lottery game for your products.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className='hover:shadow-lg transition-shadow cursor-pointer group'>
          <Link href='/vendor-dashboard/analytics' className='block'>
            <CardContent className='p-6 text-center'>
              <div className='w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform'>
                <BarChart className='w-8 h-8 text-green-600 dark:text-green-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                View Analytics
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Track performance, revenue, and user engagement metrics.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className='hover:shadow-lg transition-shadow cursor-pointer group'>
          <Link href='/profile' className='block'>
            <CardContent className='p-6 text-center'>
              <div className='w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform'>
                <Settings className='w-8 h-8 text-purple-600 dark:text-purple-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                {t('vendor.profile')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Manage your vendor profile and business information.
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
