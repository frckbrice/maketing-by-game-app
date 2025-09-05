'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserAnalytics } from '@/hooks/useApi';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  BarChart3,
  Clock,
  Download,
  Filter,
  LineChart,
  PieChart,
  Target,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserBehaviorData {
  date: string;
  newUsers: number;
  activeUsers: number;
  gameParticipants: number;
  conversionRate: number;
  avgSessionDuration: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  gameParticipants: number;
  conversionRate: number;
  avgSessionDuration: number;
  retentionRate: number;
  userGrowth: number;
}

interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

// Mock data for development
const mockBehaviorData: UserBehaviorData[] = [
  {
    date: '2025-01-01',
    newUsers: 45,
    activeUsers: 320,
    gameParticipants: 180,
    conversionRate: 56.25,
    avgSessionDuration: 12.5,
  },
  {
    date: '2025-01-02',
    newUsers: 52,
    activeUsers: 340,
    gameParticipants: 195,
    conversionRate: 57.35,
    avgSessionDuration: 13.2,
  },
  {
    date: '2025-01-03',
    newUsers: 38,
    activeUsers: 385,
    gameParticipants: 220,
    conversionRate: 57.14,
    avgSessionDuration: 14.1,
  },
  {
    date: '2025-01-04',
    newUsers: 41,
    activeUsers: 362,
    gameParticipants: 205,
    conversionRate: 56.63,
    avgSessionDuration: 13.8,
  },
  {
    date: '2025-01-05',
    newUsers: 47,
    activeUsers: 398,
    gameParticipants: 235,
    conversionRate: 59.05,
    avgSessionDuration: 15.2,
  },
  {
    date: '2025-01-06',
    newUsers: 55,
    activeUsers: 420,
    gameParticipants: 255,
    conversionRate: 60.71,
    avgSessionDuration: 16.1,
  },
  {
    date: '2025-01-07',
    newUsers: 49,
    activeUsers: 435,
    gameParticipants: 268,
    conversionRate: 61.61,
    avgSessionDuration: 16.8,
  },
];

const mockMetrics: UserMetrics = {
  totalUsers: 2847,
  activeUsers: 1623,
  newUsers: 327,
  gameParticipants: 1558,
  conversionRate: 57.8,
  avgSessionDuration: 14.5,
  retentionRate: 68.2,
  userGrowth: 12.8,
};

const mockUserSegments: UserSegment[] = [
  {
    name: 'High Value Players',
    count: 285,
    percentage: 17.6,
    color: '#10B981',
  },
  { name: 'Regular Players', count: 623, percentage: 38.4, color: '#3B82F6' },
  { name: 'Casual Players', count: 487, percentage: 30.0, color: '#F59E0B' },
  { name: 'New Users', count: 228, percentage: 14.0, color: '#EF4444' },
];

export function AdminAnalyticsUsersPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30d');
  const [behaviorData, setBehaviorData] = useState<UserBehaviorData[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Use the hook if available, otherwise fall back to mock data
  const { data: userAnalytics, isLoading: analyticsLoading } = useUserAnalytics
    ? useUserAnalytics({
        timeRange,
        enabled: user?.role === 'ADMIN',
      })
    : { data: null, isLoading: false };

  // Auth protection
  useEffect(() => {
    if (!loading && (!user || user?.role !== 'ADMIN')) {
      router.push('/en/auth/login');
    }
  }, [user, loading, router]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Use real data if available, otherwise use mock data
        if (userAnalytics) {
          setBehaviorData(userAnalytics.behaviorData || mockBehaviorData);
          setMetrics(userAnalytics.metrics || mockMetrics);
          setUserSegments(userAnalytics.segments || mockUserSegments);
        } else {
          setBehaviorData(mockBehaviorData);
          setMetrics(mockMetrics);
          setUserSegments(mockUserSegments);
        }
      } catch (error) {
        console.error('Error loading user analytics:', error);
        // Fallback to mock data on error
        setBehaviorData(mockBehaviorData);
        setMetrics(mockMetrics);
        setUserSegments(mockUserSegments);
      } finally {
        setPageLoading(false);
      }
    };

    if (user && user.role === 'ADMIN') {
      loadData();
    }
  }, [user, timeRange, userAnalytics]);

  // Loading state
  if (loading || pageLoading || analyticsLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500'></div>
      </div>
    );
  }

  // Not authenticated
  if (!user || user?.role !== 'ADMIN') {
    return null;
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}h ${mins}m`;
    }
    return `${minutes.toFixed(1)}m`;
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                {t('admin.userBehaviorAnalytics')}
              </h1>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                {t('admin.trackUserEngagementAndBehavior')}
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7d'>{t('admin.last7Days')}</SelectItem>
                  <SelectItem value='30d'>{t('admin.last30Days')}</SelectItem>
                  <SelectItem value='90d'>{t('admin.last90Days')}</SelectItem>
                  <SelectItem value='1y'>{t('admin.lastYear')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline'>
                <Download className='w-4 h-4 mr-2' />
                {t('common.export')}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.totalUsers')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics ? formatNumber(metrics.totalUsers) : '0'}
                </p>
              </div>
              <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-full'>
                <Users className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
              <span className='text-sm text-green-600 dark:text-green-400'>
                +{metrics?.userGrowth}% {t('admin.fromLastPeriod')}
              </span>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.activeUsers')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics ? formatNumber(metrics.activeUsers) : '0'}
                </p>
              </div>
              <div className='p-2 bg-green-100 dark:bg-green-900 rounded-full'>
                <UserCheck className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                {metrics
                  ? formatPercentage(
                      (metrics.activeUsers / metrics.totalUsers) * 100
                    )
                  : '0%'}{' '}
                {t('admin.ofTotal')}
              </span>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.conversionRate')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics ? formatPercentage(metrics.conversionRate) : '0%'}
                </p>
              </div>
              <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-full'>
                <Target className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
              <span className='text-sm text-green-600 dark:text-green-400'>
                +2.1% {t('admin.fromLastPeriod')}
              </span>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.avgSessionDuration')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics ? formatDuration(metrics.avgSessionDuration) : '0m'}
                </p>
              </div>
              <div className='p-2 bg-orange-100 dark:bg-orange-900 rounded-full'>
                <Clock className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
              <span className='text-sm text-green-600 dark:text-green-400'>
                +8.3% {t('admin.fromLastPeriod')}
              </span>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* User Behavior Chart */}
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {t('admin.userActivityTrend')}
              </h3>
              <div className='flex items-center space-x-2'>
                <Button variant='outline' size='sm'>
                  <LineChart className='w-4 h-4 mr-1' />
                  {t('admin.line')}
                </Button>
                <Button variant='outline' size='sm'>
                  <BarChart3 className='w-4 h-4 mr-1' />
                  {t('admin.bar')}
                </Button>
              </div>
            </div>
            <div className='h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center'>
              <div className='text-center'>
                <LineChart className='w-16 h-16 text-gray-400 mx-auto mb-2' />
                <p className='text-gray-500 dark:text-gray-400'>
                  {t('admin.userActivityChartPlaceholder')}
                </p>
              </div>
            </div>
          </Card>

          {/* User Segments Chart */}
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {t('admin.userSegmentation')}
              </h3>
              <div className='flex items-center space-x-2'>
                <Button variant='outline' size='sm'>
                  <PieChart className='w-4 h-4 mr-1' />
                  {t('admin.pie')}
                </Button>
              </div>
            </div>
            <div className='h-64'>
              <div className='space-y-3'>
                {userSegments.map((segment, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className='w-4 h-4 rounded-full'
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <span className='text-sm text-gray-700 dark:text-gray-300'>
                        {segment.name}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium text-gray-900 dark:text-white'>
                        {formatNumber(segment.count)}
                      </div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>
                        {formatPercentage(segment.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          <Card className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {t('admin.retentionRate')}
            </h3>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600 dark:text-green-400'>
                {metrics ? formatPercentage(metrics.retentionRate) : '0%'}
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                {t('admin.usersReturnedThisMonth')}
              </p>
            </div>
          </Card>

          <Card className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {t('admin.newUsersThisPeriod')}
            </h3>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                {metrics ? formatNumber(metrics.newUsers) : '0'}
              </div>
              <div className='flex items-center justify-center mt-2'>
                <UserPlus className='w-4 h-4 text-green-500 mr-1' />
                <span className='text-sm text-green-600 dark:text-green-400'>
                  +{metrics?.userGrowth}% {t('admin.growth')}
                </span>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {t('admin.gameParticipation')}
            </h3>
            <div className='text-center'>
              <div className='text-3xl font-bold text-orange-600 dark:text-orange-400'>
                {metrics ? formatNumber(metrics.gameParticipants) : '0'}
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                {t('admin.usersPlayedGames')}
              </p>
            </div>
          </Card>
        </div>

        {/* User Behavior Data Table */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {t('admin.userBehaviorData')}
            </h3>
            <div className='flex items-center space-x-4'>
              <Input
                type='text'
                placeholder={t('common.search')}
                className='w-64'
              />
              <Button variant='outline'>
                <Filter className='w-4 h-4 mr-2' />
                {t('common.filter')}
              </Button>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-800'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('common.date')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.newUsers')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.activeUsers')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.gameParticipants')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.conversionRate')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.sessionDuration')}
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                {behaviorData.map((row, index) => (
                  <tr
                    key={index}
                    className='hover:bg-gray-50 dark:hover:bg-gray-800'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                      {formatNumber(row.newUsers)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {formatNumber(row.activeUsers)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {formatNumber(row.gameParticipants)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {formatPercentage(row.conversionRate)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {formatDuration(row.avgSessionDuration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
