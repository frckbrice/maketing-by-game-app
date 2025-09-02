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
import { useAnalyticsData } from '../api/queries';



export function AdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  
  // Use the admin analytics hook with time range parameter
  const { data: analyticsData, isLoading: analyticsLoading, refetch } = useAnalyticsData(timeRange);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleTimeRangeChange = useCallback((newTimeRange: string) => {
    setTimeRange(newTimeRange);
    // The hook will automatically refetch when timeRange changes
  }, []);
  // Auth protection effects
  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

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
