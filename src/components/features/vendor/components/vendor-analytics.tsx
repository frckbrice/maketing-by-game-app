'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
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
  AreaChart,
  Area,
} from 'recharts';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  Eye,
  GamepadIcon,
  TrendingDown,
  TrendingUp,
  Users,
  Activity,
  Clock,
  Target,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vendorService } from '@/lib/api/vendorService';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueChange: number;
    totalGames: number;
    gamesChange: number;
    totalParticipants: number;
    participantsChange: number;
    conversionRate: number;
    conversionChange: number;
  };
  revenueChart: Array<{ date: string; revenue: number; participants: number }>;
  gamesPerformance: Array<{
    name: string;
    revenue: number;
    participants: number;
    conversionRate: number;
  }>;
  categoryBreakdown: Array<{ name: string; value: number; revenue: number }>;
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    games: number;
    participants: number;
  }>;
  topPerformingGames: Array<{
    title: string;
    revenue: number;
    participants: number;
    conversionRate: number;
    status: string;
  }>;
}

const CHART_COLORS = [
  '#FF5722',
  '#FF9800',
  '#FFC107',
  '#4CAF50',
  '#2196F3',
  '#9C27B0',
];

export function VendorAnalytics() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  useEffect(() => {
    if (user && (user.role === 'VENDOR' || user.role === 'ADMIN')) {
      loadAnalyticsData();
    }
  }, [user, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch actual analytics data
      // For now, we'll use mock data that represents realistic vendor analytics

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 24567.89,
          revenueChange: 12.5,
          totalGames: 18,
          gamesChange: -5.2,
          totalParticipants: 3456,
          participantsChange: 18.7,
          conversionRate: 68.4,
          conversionChange: 3.2,
        },
        revenueChart: generateTimeSeriesData(dateRange, 'revenue'),
        gamesPerformance: [
          {
            name: 'iPhone 15 Pro Max',
            revenue: 8450,
            participants: 1690,
            conversionRate: 84.5,
          },
          {
            name: 'Nike Air Jordan',
            revenue: 5230,
            participants: 1743,
            conversionRate: 73.4,
          },
          {
            name: 'MacBook Pro M3',
            revenue: 4890,
            participants: 326,
            conversionRate: 89.2,
          },
          {
            name: 'Samsung TV 4K',
            revenue: 3240,
            participants: 810,
            conversionRate: 78.6,
          },
          {
            name: 'Kitchen Mixer',
            revenue: 2857,
            participants: 952,
            conversionRate: 65.1,
          },
        ],
        categoryBreakdown: [
          { name: 'Tech & Phones', value: 45, revenue: 15600 },
          { name: 'Fashion', value: 25, revenue: 8900 },
          { name: 'Home Appliances', value: 20, revenue: 7200 },
          { name: 'Computers', value: 10, revenue: 3600 },
        ],
        timeSeriesData: generateTimeSeriesData(dateRange, 'all'),
        topPerformingGames: [
          {
            title: 'iPhone 15 Pro Max Contest',
            revenue: 8450,
            participants: 1690,
            conversionRate: 84.5,
            status: 'ACTIVE',
          },
          {
            title: 'Nike Air Jordan Giveaway',
            revenue: 5230,
            participants: 1743,
            conversionRate: 73.4,
            status: 'CLOSED',
          },
          {
            title: 'MacBook Pro Bundle',
            revenue: 4890,
            participants: 326,
            conversionRate: 89.2,
            status: 'DRAWING',
          },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (range: string, type: string) => {
    const days =
      range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const baseRevenue = 200 + Math.random() * 800;
      const baseParticipants = 20 + Math.random() * 100;
      const baseGames = Math.floor(Math.random() * 5) + 1;

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue),
        participants: Math.round(baseParticipants),
        games: baseGames,
      });
    }

    return data;
  };

  const exportData = () => {
    // Export functionality would be implemented here
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vendor-analytics-export.json';
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: <Badge className='bg-green-500 text-white'>Active</Badge>,
      CLOSED: <Badge className='bg-gray-500 text-white'>Closed</Badge>,
      DRAWING: <Badge className='bg-blue-500 text-white'>Drawing</Badge>,
      PENDING: <Badge className='bg-yellow-500 text-white'>Pending</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>Unknown</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
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

  if (!analyticsData) {
    return (
      <div className='text-center py-12'>
        <BarChart3 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
          No analytics data available
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>
          Analytics data will appear here once you have active games.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            {t('vendor.analytics')}
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Track your games performance and revenue insights
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Select value={dateRange} onValueChange={setDateRange}>
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
          <Button variant='outline' onClick={exportData}>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

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
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </p>
                <div className='flex items-center mt-1'>
                  {analyticsData.overview.revenueChange >= 0 ? (
                    <ArrowUp className='w-4 h-4 text-green-500' />
                  ) : (
                    <ArrowDown className='w-4 h-4 text-red-500' />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      analyticsData.overview.revenueChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {formatPercent(
                      Math.abs(analyticsData.overview.revenueChange)
                    )}
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center'>
                <DollarSign className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total Games
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {analyticsData.overview.totalGames}
                </p>
                <div className='flex items-center mt-1'>
                  {analyticsData.overview.gamesChange >= 0 ? (
                    <ArrowUp className='w-4 h-4 text-green-500' />
                  ) : (
                    <ArrowDown className='w-4 h-4 text-red-500' />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      analyticsData.overview.gamesChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {formatPercent(
                      Math.abs(analyticsData.overview.gamesChange)
                    )}
                  </span>
                </div>
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
                  Total Participants
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {analyticsData.overview.totalParticipants.toLocaleString()}
                </p>
                <div className='flex items-center mt-1'>
                  {analyticsData.overview.participantsChange >= 0 ? (
                    <ArrowUp className='w-4 h-4 text-green-500' />
                  ) : (
                    <ArrowDown className='w-4 h-4 text-red-500' />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      analyticsData.overview.participantsChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {formatPercent(
                      Math.abs(analyticsData.overview.participantsChange)
                    )}
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center'>
                <Users className='w-6 h-6 text-purple-600 dark:text-purple-400' />
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
                  {formatPercent(analyticsData.overview.conversionRate)}
                </p>
                <div className='flex items-center mt-1'>
                  {analyticsData.overview.conversionChange >= 0 ? (
                    <ArrowUp className='w-4 h-4 text-green-500' />
                  ) : (
                    <ArrowDown className='w-4 h-4 text-red-500' />
                  )}
                  <span
                    className={`text-sm ml-1 ${
                      analyticsData.overview.conversionChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {formatPercent(
                      Math.abs(analyticsData.overview.conversionChange)
                    )}
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center'>
                <Target className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center'>
                <TrendingUp className='w-5 h-5 mr-2' />
                Revenue & Participation Trends
              </div>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='revenue'>Revenue</SelectItem>
                  <SelectItem value='participants'>Participants</SelectItem>
                  <SelectItem value='both'>Both</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                {selectedMetric === 'both' ? (
                  <AreaChart data={analyticsData.timeSeriesData}>
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
                    <YAxis yAxisId='revenue' orientation='left' />
                    <YAxis yAxisId='participants' orientation='right' />
                    <Tooltip
                      labelFormatter={value =>
                        new Date(value).toLocaleDateString()
                      }
                      formatter={(value, name) => [
                        name === 'revenue'
                          ? formatCurrency(value as number)
                          : value,
                        name === 'revenue' ? 'Revenue' : 'Participants',
                      ]}
                    />
                    <Area
                      yAxisId='revenue'
                      type='monotone'
                      dataKey='revenue'
                      stackId='1'
                      stroke='#FF5722'
                      fill='#FF5722'
                      fillOpacity={0.6}
                    />
                    <Area
                      yAxisId='participants'
                      type='monotone'
                      dataKey='participants'
                      stackId='2'
                      stroke='#2196F3'
                      fill='#2196F3'
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={analyticsData.timeSeriesData}>
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
                      formatter={value => [
                        selectedMetric === 'revenue'
                          ? formatCurrency(value as number)
                          : value,
                        selectedMetric === 'revenue'
                          ? 'Revenue'
                          : 'Participants',
                      ]}
                    />
                    <Line
                      type='monotone'
                      dataKey={selectedMetric}
                      stroke='#FF5722'
                      strokeWidth={3}
                      dot={{ fill: '#FF5722', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Award className='w-5 h-5 mr-2' />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={analyticsData.categoryBreakdown}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {analyticsData.categoryBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value}%`,
                      `${formatCurrency(props.payload.revenue)} revenue`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Activity className='w-5 h-5 mr-2' />
            Top Performing Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {analyticsData.topPerformingGames.map((game, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50'
              >
                <div className='flex items-center space-x-4'>
                  <div className='w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      {game.title}
                    </h3>
                    <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                      <span className='flex items-center'>
                        <DollarSign className='w-4 h-4 mr-1' />
                        {formatCurrency(game.revenue)}
                      </span>
                      <span className='flex items-center'>
                        <Users className='w-4 h-4 mr-1' />
                        {game.participants.toLocaleString()}
                      </span>
                      <span className='flex items-center'>
                        <Target className='w-4 h-4 mr-1' />
                        {formatPercent(game.conversionRate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  {getStatusBadge(game.status)}
                  <Button variant='ghost' size='sm'>
                    <Eye className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Games Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <BarChart3 className='w-5 h-5 mr-2' />
            Games Revenue Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={analyticsData.gamesPerformance}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  angle={-45}
                  textAnchor='end'
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? formatCurrency(value as number)
                      : value,
                    name === 'revenue'
                      ? 'Revenue'
                      : name === 'participants'
                        ? 'Participants'
                        : 'Conversion Rate',
                  ]}
                />
                <Bar dataKey='revenue' fill='#FF5722' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
