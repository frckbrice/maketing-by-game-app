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
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRevenueData, useRevenueMetrics } from '../api/queries';
import {
  Activity,
  BarChart3,
  DollarSign,
  Download,
  Filter,
  LineChart,
  PieChart,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function AdminAnalyticsRevenuePage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate date range based on selected time range
  const getDateRange = (range: string) => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate };
  };

  // Fetch revenue data and metrics using dedicated hooks
  const { data: revenueData = [], isLoading: revenueLoading } =
    useRevenueData(timeRange);
  const { data: metrics, isLoading: metricsLoading } =
    useRevenueMetrics(timeRange);

  // Handle export functionality
  const handleExport = async () => {
    try {
      // TODO: Implement export functionality
      const exportData = {
        metrics,
        revenueData: filteredRevenueData,
        dateRange: timeRange,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `revenue-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success(t('admin.exportStarted'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('admin.exportFailed'));
    }
  };

  // Filter revenue data based on search term
  const filteredRevenueData = revenueData.filter(row => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      row.date.toLowerCase().includes(searchLower) ||
      row.revenue.toString().includes(searchLower) ||
      row.transactions.toString().includes(searchLower)
    );
  });

  // Auth protection
  useEffect(() => {
    if (!loading && (!user || user?.role !== 'ADMIN')) {
      router.push('/en/auth/login');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading || revenueLoading || metricsLoading) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                {t('admin.revenueAnalytics')}
              </h1>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                {t('admin.trackRevenuePerformance')}
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='w-48'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7d'>{t('admin.last7Days')}</SelectItem>
                  <SelectItem value='30d'>{t('admin.last30Days')}</SelectItem>
                  <SelectItem value='90d'>{t('admin.last90Days')}</SelectItem>
                  <SelectItem value='1y'>{t('admin.lastYear')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant='outline' onClick={handleExport}>
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
                  {t('admin.totalRevenue')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics ? formatCurrency(metrics.totalRevenue) : '$0'}
                </p>
              </div>
              <div className='p-2 bg-green-100 dark:bg-green-900 rounded-full'>
                <DollarSign className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
              <span className='text-sm text-green-600 dark:text-green-400'>
                +{metrics?.revenueGrowth}% {t('admin.fromLastPeriod')}
              </span>
            </div>
          </Card>

          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.totalTransactions')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics ? formatNumber(metrics.totalTransactions) : '0'}
                </p>
              </div>
              <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-full'>
                <ShoppingCart className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
              <span className='text-sm text-green-600 dark:text-green-400'>
                +{metrics?.transactionGrowth}% {t('admin.fromLastPeriod')}
              </span>
            </div>
          </Card>

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
              <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-full'>
                <Users className='w-6 h-6 text-purple-600 dark:text-purple-400' />
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
                  {t('admin.averageOrderValue')}
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics ? formatCurrency(metrics.averageOrderValue) : '$0'}
                </p>
              </div>
              <div className='p-2 bg-orange-100 dark:bg-orange-900 rounded-full'>
                <Activity className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
              <span className='text-sm text-green-600 dark:text-green-400'>
                +5.2% {t('admin.fromLastPeriod')}
              </span>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Revenue Chart */}
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {t('admin.revenueTrend')}
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
                <BarChart3 className='w-16 h-16 text-gray-400 mx-auto mb-2' />
                <p className='text-gray-500 dark:text-gray-400'>
                  {t('admin.revenueChartPlaceholder')}
                </p>
              </div>
            </div>
          </Card>

          {/* Transactions Chart */}
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {t('admin.transactionVolume')}
              </h3>
              <div className='flex items-center space-x-2'>
                <Button variant='outline' size='sm'>
                  <PieChart className='w-4 h-4 mr-1' />
                  {t('admin.pie')}
                </Button>
                <Button variant='outline' size='sm'>
                  <BarChart3 className='w-4 h-4 mr-1' />
                  {t('admin.bar')}
                </Button>
              </div>
            </div>
            <div className='h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center'>
              <div className='text-center'>
                <PieChart className='w-16 h-16 text-gray-400 mx-auto mb-2' />
                <p className='text-gray-500 dark:text-gray-400'>
                  {t('admin.transactionChartPlaceholder')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Data Table */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {t('admin.revenueData')}
            </h3>
            <div className='flex items-center space-x-4'>
              <Input
                type='text'
                placeholder={t('admin.searchRevenueData')}
                className='w-64'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
                    {t('admin.revenue')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.transactions')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.users')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    {t('admin.games')}
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                {filteredRevenueData.length > 0 ? (
                  filteredRevenueData.map((row, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 dark:hover:bg-gray-800'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {formatNumber(row.transactions)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {formatNumber(row.users)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {formatNumber(row.games)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400'
                    >
                      {searchTerm
                        ? t('admin.noRevenueDataFound')
                        : t('admin.noRevenueData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
