'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Building2,
  Package,
  ShoppingCart,
  DollarSign,
  Heart,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  Activity,
  MoreHorizontal,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useMarketplaceStats,
  useTopShopsPerformance,
  useTopProductsPerformance,
  useMarketplaceTrends,
} from '../api/marketplace-queries';

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
];

export const AdminMarketplaceAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  // Data queries
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useMarketplaceStats();
  const { data: topShops, isLoading: shopsLoading } = useTopShopsPerformance(5);
  const { data: topProducts, isLoading: productsLoading } =
    useTopProductsPerformance(5);
  const { data: trends, isLoading: trendsLoading } =
    useMarketplaceTrends(selectedPeriod);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Loading skeleton
  if (statsLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className='bg-white dark:bg-gray-800 p-6 rounded-lg border animate-pulse'
            >
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2'></div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='text-center py-12'>
        <Building2 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
        <p className='text-gray-500 dark:text-gray-400'>
          {t('admin.marketplace.noData')}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            {t('admin.marketplace.analytics')}
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            {t('admin.marketplace.analyticsDescription')}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetchStats()}
            className='flex items-center space-x-2'
          >
            <RefreshCw className='w-4 h-4' />
            <span>{t('common.refresh')}</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center space-x-2'
          >
            <Download className='w-4 h-4' />
            <span>{t('common.export')}</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Shops */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.totalShops')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalShops}
                </p>
                <div className='flex items-center mt-2'>
                  <Badge
                    variant='secondary'
                    className='bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  >
                    {stats.activeShops} {t('admin.marketplace.active')}
                  </Badge>
                </div>
              </div>
              <Building2 className='w-8 h-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.totalProducts')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalProducts}
                </p>
                <div className='flex items-center mt-2'>
                  <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-green-600 dark:text-green-400'>
                    +12.5%
                  </span>
                </div>
              </div>
              <Package className='w-8 h-8 text-purple-500' />
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.totalOrders')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {formatNumber(stats.totalOrders)}
                </p>
                <div className='flex items-center mt-2'>
                  <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-green-600 dark:text-green-400'>
                    +8.2%
                  </span>
                </div>
              </div>
              <ShoppingCart className='w-8 h-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Revenue */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.totalRevenue')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {formatCurrency(stats.totalMarketplaceRevenue)}
                </p>
                <div className='flex items-center mt-2'>
                  <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-green-600 dark:text-green-400'>
                    +15.3%
                  </span>
                </div>
              </div>
              <DollarSign className='w-8 h-8 text-orange-500' />
            </div>
          </CardContent>
        </Card>

        {/* Social Metrics */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.totalLikes')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {formatNumber(stats.totalLikes)}
                </p>
                <div className='flex items-center mt-2'>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {formatNumber(stats.totalFollows)}{' '}
                    {t('admin.marketplace.follows')}
                  </span>
                </div>
              </div>
              <Heart className='w-8 h-8 text-red-500' />
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.totalReviews')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {formatNumber(stats.totalReviews)}
                </p>
                <div className='flex items-center mt-2'>
                  <Star className='w-4 h-4 text-yellow-500 mr-1 fill-current' />
                  <span className='text-sm text-yellow-600 dark:text-yellow-400'>
                    {stats.averageShopRating.toFixed(1)}{' '}
                    {t('admin.marketplace.avgRating')}
                  </span>
                </div>
              </div>
              <Star className='w-8 h-8 text-yellow-500' />
            </div>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.pendingApplications')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {stats.pendingShopApplications}
                </p>
                <div className='flex items-center mt-2'>
                  <Badge
                    variant='outline'
                    className='text-orange-600 border-orange-600'
                  >
                    {t('admin.marketplace.requiresReview')}
                  </Badge>
                </div>
              </div>
              <Activity className='w-8 h-8 text-orange-500' />
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('admin.marketplace.conversionRate')}
                </p>
                <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                  2.8%
                </p>
                <div className='flex items-center mt-2'>
                  <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-green-600 dark:text-green-400'>
                    +0.3%
                  </span>
                </div>
              </div>
              <Eye className='w-8 h-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <TrendingUp className='w-5 h-5' />
              <span>{t('admin.marketplace.revenueTrends')}</span>
            </CardTitle>
            <CardDescription>
              {t('admin.marketplace.last30Days')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='period'
                    tick={{ fontSize: 12 }}
                    tickFormatter={value =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Revenue',
                    ]}
                    labelFormatter={label =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                  <Area
                    type='monotone'
                    dataKey='revenue'
                    stroke='#8884d8'
                    fill='#8884d8'
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Trends */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <ShoppingCart className='w-5 h-5' />
              <span>{t('admin.marketplace.ordersTrends')}</span>
            </CardTitle>
            <CardDescription>
              {t('admin.marketplace.dailyOrders')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='period'
                    tick={{ fontSize: 12 }}
                    tickFormatter={value =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Orders']}
                    labelFormatter={label =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                  <Line
                    type='monotone'
                    dataKey='orders'
                    stroke='#82ca9d'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Tables */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top Shops */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center space-x-2'>
                <Building2 className='w-5 h-5' />
                <span>{t('admin.marketplace.topShops')}</span>
              </span>
              <Button variant='outline' size='sm'>
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </CardTitle>
            <CardDescription>
              {t('admin.marketplace.bestPerformingShops')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {shopsLoading
                ? [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className='flex items-center space-x-4 animate-pulse'
                    >
                      <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded'></div>
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
                        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                      </div>
                      <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-20'></div>
                    </div>
                  ))
                : topShops?.map((shop, index) => (
                    <div
                      key={shop.shopId}
                      className='flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center'>
                          <span className='text-white font-bold text-sm'>
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {shop.shopName}
                          </p>
                          <div className='flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400'>
                            <span>{shop.orders} orders</span>
                            <span>•</span>
                            <span>{shop.products} products</span>
                            <span>•</span>
                            <span className='flex items-center'>
                              <Star className='w-3 h-3 text-yellow-500 mr-1 fill-current' />
                              {shop.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-gray-900 dark:text-white'>
                          {formatCurrency(shop.revenue)}
                        </p>
                        <p className='text-sm text-green-600 dark:text-green-400'>
                          {shop.conversionRate}% conv.
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center space-x-2'>
                <Package className='w-5 h-5' />
                <span>{t('admin.marketplace.topProducts')}</span>
              </span>
              <Button variant='outline' size='sm'>
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </CardTitle>
            <CardDescription>
              {t('admin.marketplace.bestSellingProducts')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {productsLoading
                ? [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className='flex items-center space-x-4 animate-pulse'
                    >
                      <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded'></div>
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
                        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                      </div>
                      <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-20'></div>
                    </div>
                  ))
                : topProducts?.map((product, index) => (
                    <div
                      key={product.productId}
                      className='flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center'>
                          <span className='text-white font-bold text-sm'>
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {product.productName}
                          </p>
                          <div className='flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400'>
                            <span>{product.shopName}</span>
                            <span>•</span>
                            <span>{product.sales} sales</span>
                            <span>•</span>
                            <span className='flex items-center'>
                              <Heart className='w-3 h-3 text-red-500 mr-1 fill-current' />
                              {product.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-gray-900 dark:text-white'>
                          {formatCurrency(product.revenue)}
                        </p>
                        <p className='text-sm text-blue-600 dark:text-blue-400'>
                          {product.conversionRate}% conv.
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
