'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { currencyService } from '@/lib/api/currencyService';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Download,
  Gamepad2,
  PieChart as PieChartIcon,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS } from '../api/data';
import { AnalyticsData } from '../api/type';



export function AdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);

      // Fetch real data from Firebase
      const { firestoreService } = await import('@/lib/firebase/services');
      const [users, games, tickets, payments, categories] = await Promise.all([
        firestoreService.getUsers(),
        firestoreService.getGames(),
        firestoreService.getAllTickets(),
        firestoreService.getAllPayments(),
        firestoreService.getCategories(),
      ]);

      // Calculate time range
      const now = Date.now();
      let startTime = now;
      switch (timeRange) {
        case '7d':
          startTime = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = now - (30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startTime = now - (90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startTime = now - (365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = now - (30 * 24 * 60 * 60 * 1000);
      }

      // Calculate overview metrics
      const totalRevenue = payments
        .filter((payment: any) => payment.status === 'COMPLETED')
        .reduce((sum: number, payment: any) => sum + payment.amount, 0);

      const recentUsers = users.filter((user: any) => user.createdAt >= startTime);
      const recentGames = games.filter((game: any) => game.createdAt >= startTime);
      const recentTickets = tickets.filter((ticket: any) => ticket.createdAt >= startTime);
      const recentPayments = payments
        .filter((payment: any) => payment.createdAt >= startTime && payment.status === 'COMPLETED');

      // Calculate growth rates (comparing with previous period)
      const previousPeriodStart = startTime - (now - startTime);
      const previousUsers = users.filter((user: any) =>
        user.createdAt >= previousPeriodStart && user.createdAt < startTime);
      const previousGames = games.filter((game: any) =>
        game.createdAt >= previousPeriodStart && game.createdAt < startTime);
      const previousPayments = payments.filter((payment: any) =>
        payment.createdAt >= previousPeriodStart && payment.createdAt < startTime && payment.status === 'COMPLETED');

      const previousRevenue = previousPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
      const recentRevenue = recentPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);

      const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const userGrowth = previousUsers.length > 0 ? ((recentUsers.length - previousUsers.length) / previousUsers.length) * 100 : 0;
      const gameGrowth = previousGames.length > 0 ? ((recentGames.length - previousGames.length) / previousGames.length) * 100 : 0;

      // Calculate conversion rate (tickets bought / unique visitors estimate)
      const uniqueParticipants = [...new Set(recentTickets.map((ticket: any) => ticket.userId))].length;
      const conversionRate = users.length > 0 ? (uniqueParticipants / users.length) * 100 : 0;

      // Generate revenue by day data
      const revenueByDay = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const dayEnd = dayStart + (24 * 60 * 60 * 1000);

        const dayPayments = payments.filter((payment: any) =>
          payment.createdAt >= dayStart && payment.createdAt < dayEnd && payment.status === 'COMPLETED');
        const dayTickets = tickets.filter((ticket: any) =>
          ticket.createdAt >= dayStart && ticket.createdAt < dayEnd);

        revenueByDay.push({
          date: date.toISOString().split('T')[0],
          revenue: dayPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0),
          tickets: dayTickets.length,
        });
      }

      // Generate users by day data
      const usersByDay = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const dayEnd = dayStart + (24 * 60 * 60 * 1000);

        const dayUsers = users.filter((user: any) =>
          user.createdAt >= dayStart && user.createdAt < dayEnd);

        usersByDay.push({
          date: date.toISOString().split('T')[0],
          users: dayUsers.length,
          retention: 75 + Math.random() * 20, // Mock retention rate - would need analytics for real data
        });
      }

      // Calculate category performance
      const categoryPerformance = categories.map((category: any) => {
        const categoryGames = games.filter((game: any) => game.categoryId === category.id);
        const categoryGameIds = categoryGames.map((game: any) => game.id);
        const categoryTickets = tickets.filter((ticket: any) => categoryGameIds.includes(ticket.gameId));
        const categoryPayments = payments.filter((payment: any) =>
          categoryTickets.some((ticket: any) => ticket.id === payment.ticketId) && payment.status === 'COMPLETED');
        const categoryUsers = [...new Set(categoryTickets.map((ticket: any) => ticket.userId))];

        return {
          name: category.name,
          revenue: categoryPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0),
          games: categoryGames.length,
          users: categoryUsers.length,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Calculate top game performance
      const gamePerformance = games
        .map((game: any) => {
          const gameTickets = tickets.filter((ticket: any) => ticket.gameId === game.id);
          const gamePayments = payments.filter((payment: any) =>
            gameTickets.some((ticket: any) => ticket.id === payment.ticketId) && payment.status === 'COMPLETED');
          const participants = [...new Set(gameTickets.map((ticket: any) => ticket.userId))].length;
          const revenue = gamePayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);

          return {
            title: game.title,
            participants,
            revenue,
            conversionRate: game.maxParticipants > 0 ? (participants / game.maxParticipants) * 100 : 0,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Mock demographic data (would need user profile data for real demographics)
      // TODO: need to implement real data for user demographics
      const userDemographics = [
        { name: '18-25', value: 35, color: '#f97316' },
        { name: '26-35', value: 30, color: '#ef4444' },
        { name: '36-45', value: 20, color: '#10b981' },
        { name: '46-55', value: 10, color: '#3b82f6' },
        { name: '55+', value: 5, color: '#8b5cf6' },
      ];

      // Mock device stats (would need analytics integration for real data)
      // TODO: need to implement real data for device stats
      const deviceStats = [
        { device: 'Mobile', percentage: 65, users: Math.floor(users.length * 0.65) },
        { device: 'Desktop', percentage: 25, users: Math.floor(users.length * 0.25) },
        { device: 'Tablet', percentage: 10, users: Math.floor(users.length * 0.10) },
      ];

      const realData: AnalyticsData = {
        overview: {
          totalRevenue,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          totalUsers: users.length,
          userGrowth: Math.round(userGrowth * 100) / 100,
          totalGames: games.length,
          gameGrowth: Math.round(gameGrowth * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          conversionGrowth: 5.7, // Mock growth rate
        },
        revenueByDay,
        usersByDay,
        categoryPerformance,
        gamePerformance,
        userDemographics,
        deviceStats,
      };

      setAnalyticsData(realData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to empty data structure to prevent UI breaking
      const fallbackData: AnalyticsData = {
        overview: {
          totalRevenue: 0,
          revenueGrowth: 0,
          totalUsers: 0,
          userGrowth: 0,
          totalGames: 0,
          gameGrowth: 0,
          conversionRate: 0,
          conversionGrowth: 0,
        },
        revenueByDay: [],
        usersByDay: [],
        categoryPerformance: [],
        gamePerformance: [],
        userDemographics: [],
        deviceStats: [],
      };
      setAnalyticsData(fallbackData);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    if (user?.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [user, loading, router, fetchAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
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
              <Button variant='ghost' size='sm' asChild className='mr-2'>
                <Link href='/admin'>
                  <ArrowLeft className='w-4 h-4' />
                </Link>
              </Button>
              <BarChart3 className='w-8 h-8 text-orange-500 mr-3' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Analytics & Reports
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Detailed performance insights
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7d'>Last 7 days</SelectItem>
                  <SelectItem value='30d'>Last 30 days</SelectItem>
                  <SelectItem value='90d'>Last 90 days</SelectItem>
                  <SelectItem value='1y'>Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleRefresh}
                variant='outline'
                size='sm'
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button variant='outline' size='sm'>
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {analyticsLoading ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-300'>
              Loading analytics...
            </p>
          </div>
        ) : analyticsData ? (
          <div className='space-y-8'>
            {/* Overview KPIs */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                        Total Revenue
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                        {currencyService.formatCurrency(
                          analyticsData.overview.totalRevenue,
                          'USD'
                        )}
                      </p>
                      <div className='flex items-center mt-1'>
                        {analyticsData.overview.revenueGrowth > 0 ? (
                          <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                        ) : (
                          <TrendingDown className='w-4 h-4 text-red-500 mr-1' />
                        )}
                        <span
                          className={`text-sm ${analyticsData.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {Math.abs(analyticsData.overview.revenueGrowth)}%
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
                        Total Users
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                        {analyticsData.overview.totalUsers.toLocaleString()}
                      </p>
                      <div className='flex items-center mt-1'>
                        <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                        <span className='text-sm text-green-600'>
                          {analyticsData.overview.userGrowth}%
                        </span>
                      </div>
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
                        {analyticsData.overview.totalGames}
                      </p>
                      <div className='flex items-center mt-1'>
                        {analyticsData.overview.gameGrowth > 0 ? (
                          <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                        ) : (
                          <TrendingDown className='w-4 h-4 text-red-500 mr-1' />
                        )}
                        <span
                          className={`text-sm ${analyticsData.overview.gameGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {Math.abs(analyticsData.overview.gameGrowth)}%
                        </span>
                      </div>
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
                        Conversion Rate
                      </p>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                        {analyticsData.overview.conversionRate}%
                      </p>
                      <div className='flex items-center mt-1'>
                        <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                        <span className='text-sm text-green-600'>
                          {analyticsData.overview.conversionGrowth}%
                        </span>
                      </div>
                    </div>
                    <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center'>
                      <TrendingUp className='w-6 h-6 text-purple-600 dark:text-purple-400' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue & User Growth Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <DollarSign className='w-5 h-5 mr-2' />
                    Revenue & Tickets ({timeRange})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <ComposedChart data={analyticsData.revenueByDay}>
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
                        <YAxis
                          yAxisId='revenue'
                          orientation='left'
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId='tickets'
                          orientation='right'
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'revenue'
                              ? currencyService.formatCurrency(
                                  Number(value),
                                  'USD'
                                )
                              : value,
                            name === 'revenue' ? 'Revenue' : 'Tickets',
                          ]}
                          labelFormatter={label =>
                            new Date(label).toLocaleDateString()
                          }
                        />
                        <Area
                          yAxisId='revenue'
                          type='monotone'
                          dataKey='revenue'
                          fill='#f97316'
                          fillOpacity={0.2}
                          stroke='#f97316'
                          strokeWidth={2}
                        />
                        <Bar
                          yAxisId='tickets'
                          dataKey='tickets'
                          fill='#3b82f6'
                          opacity={0.7}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Users className='w-5 h-5 mr-2' />
                    User Growth & Retention ({timeRange})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <ComposedChart data={analyticsData.usersByDay}>
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
                        <YAxis
                          yAxisId='users'
                          orientation='left'
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          yAxisId='retention'
                          orientation='right'
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'retention' ? `${value}%` : value,
                            name === 'users' ? 'New Users' : 'Retention Rate',
                          ]}
                          labelFormatter={label =>
                            new Date(label).toLocaleDateString()
                          }
                        />
                        <Bar
                          yAxisId='users'
                          dataKey='users'
                          fill='#10b981'
                          opacity={0.8}
                        />
                        <Line
                          yAxisId='retention'
                          type='monotone'
                          dataKey='retention'
                          stroke='#ef4444'
                          strokeWidth={2}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance & Demographics */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <BarChart3 className='w-5 h-5 mr-2' />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={analyticsData.categoryPerformance}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'revenue'
                              ? currencyService.formatCurrency(
                                  Number(value),
                                  'USD'
                                )
                              : value,
                            name.toString().charAt(0).toUpperCase() +
                              name.toString().slice(1),
                          ]}
                        />
                        <Bar
                          dataKey='revenue'
                          fill='#f97316'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <PieChartIcon className='w-5 h-5 mr-2' />
                    User Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={analyticsData.userDemographics}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, value }) => `${name} (${value}%)`}
                          outerRadius={100}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {analyticsData.userDemographics.map(
                            (entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          formatter={value => [`${value}%`, 'Percentage']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Device Stats & Top Games */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Activity className='w-5 h-5 mr-2' />
                    Device Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {analyticsData.deviceStats.map((device, index) => (
                      <div
                        key={device.device}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center'>
                          <div
                            className={`w-3 h-3 rounded-full mr-3`}
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className='text-sm font-medium text-gray-900 dark:text-white'>
                            {device.device}
                          </span>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                            {device.percentage}%
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            {device.users.toLocaleString()} users
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-6'>
                    <div className='flex rounded-full overflow-hidden h-2'>
                      {analyticsData.deviceStats.map((device, index) => (
                        <div
                          key={device.device}
                          className='h-full'
                          style={{
                            width: `${device.percentage}%`,
                            backgroundColor: COLORS[index],
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Gamepad2 className='w-5 h-5 mr-2' />
                    Top Performing Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {analyticsData.gamePerformance
                      .slice(0, 5)
                      .map((game, index) => (
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
                                {game.participants} participants •{' '}
                                {game.conversionRate}% conversion
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

            {/* Category Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200 dark:border-gray-700'>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>
                          Category
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>
                          Revenue
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>
                          Games
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>
                          Users
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400'>
                          Avg. Revenue per Game
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.categoryPerformance.map(
                        (category, index) => (
                          <tr
                            key={category.name}
                            className='border-b border-gray-100 dark:border-gray-800'
                          >
                            <td className='py-3 px-4'>
                              <div className='flex items-center'>
                                <div
                                  className='w-3 h-3 rounded-full mr-3'
                                  style={{ backgroundColor: COLORS[index] }}
                                />
                                <span className='font-medium text-gray-900 dark:text-white'>
                                  {category.name}
                                </span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <span className='font-semibold text-gray-900 dark:text-white'>
                                {currencyService.formatCurrency(
                                  category.revenue,
                                  'USD'
                                )}
                              </span>
                            </td>
                            <td className='py-3 px-4'>
                              <Badge variant='outline'>{category.games}</Badge>
                            </td>
                            <td className='py-3 px-4'>
                              <span className='text-gray-700 dark:text-gray-300'>
                                {category.users.toLocaleString()}
                              </span>
                            </td>
                            <td className='py-3 px-4'>
                              <span className='text-gray-700 dark:text-gray-300'>
                                {currencyService.formatCurrency(
                                  category.revenue / category.games,
                                  'USD'
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
