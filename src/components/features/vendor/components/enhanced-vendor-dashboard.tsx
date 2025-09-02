'use client';

import React, { useState } from 'react';
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
  Area,
  AreaChart,
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
  ShoppingBag,
  Package,
  ShoppingCart,
  Heart,
  Star,
  Store,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useVendorShopStats,
  useVendorProducts,
  useVendorOrders,
  useVendorAnalytics,
} from '@/hooks/useVendorApi';
import {
  useVendorStats,
  useVendorGames,
  useVendorRevenueChart,
  useVendorParticipationChart,
} from '@/hooks/useApi';

const COLORS = ['#FF5722', '#FF9800', '#FFC107', '#4CAF50', '#2196F3'];

export const EnhancedVendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30);

  // Shop/Marketplace data
  const { data: shopStats, isLoading: shopStatsLoading } = useVendorShopStats();
  const { data: products, isLoading: productsLoading } = useVendorProducts(10);
  const { data: orders, isLoading: ordersLoading } = useVendorOrders(10);
  const { data: analytics, isLoading: analyticsLoading } = useVendorAnalytics(analyticsPeriod);

  // Games/Lottery data (existing functionality)
  const { data: gameStats, isLoading: gameStatsLoading } = useVendorStats();
  const { data: games, isLoading: gamesLoading } = useVendorGames();
  const { data: revenueData, isLoading: revenueLoading } = useVendorRevenueChart();
  const { data: participationData, isLoading: participationLoading } = useVendorParticipationChart();

  const isLoading = shopStatsLoading || gameStatsLoading;

  if (isLoading) {
    return (
      <div className='space-y-6 px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' />
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' />
          <div className='h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse' />
        </div>
      </div>
    );
  }

  // Combine revenue from shop and games
  const totalRevenue = (shopStats?.totalRevenue || 0) + (gameStats?.totalRevenue || 0);
  const monthlyRevenue = (shopStats?.monthlyRevenue || 0) + (gameStats?.monthlyRevenue || 0);

  return (
    <div className='space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-0'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight'>
            {t('vendor.welcomeMessage')}, {user?.firstName}!
          </h1>
          <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1'>
            {shopStats?.shopName && (
              <>
                {t('vendor.shopName')}: <span className='font-medium text-orange-600 dark:text-orange-400'>{shopStats.shopName}</span>
              </>
            )}
          </p>
        </div>
        <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto'>
          <Button asChild className='w-full sm:w-auto text-sm sm:text-base'>
            <Link href='/vendor-dashboard/create-game'>
              <GamepadIcon className='w-4 h-4 mr-2' />
              {t('vendor.createGame')}
            </Link>
          </Button>
          <Button asChild variant='outline' className='w-full sm:w-auto text-sm sm:text-base'>
            <Link href='/vendor-dashboard/create-product'>
              <Plus className='w-4 h-4 mr-2' />
              {t('vendor.addProduct')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview'>{t('vendor.overview')}</TabsTrigger>
          <TabsTrigger value='shop'>{t('vendor.shop')}</TabsTrigger>
          <TabsTrigger value='games'>{t('vendor.games')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Combined Stats Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
            {/* Total Revenue */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.totalRevenue')}
                    </p>
                    <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                      ${totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className='w-6 h-6 sm:w-8 sm:h-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.monthlyRevenue')}
                    </p>
                    <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                      ${monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className='w-6 h-6 sm:w-8 sm:h-8 text-blue-500' />
                </div>
              </CardContent>
            </Card>

            {/* Total Products & Games */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.totalItems')}
                    </p>
                    <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                      {(shopStats?.totalProducts || 0) + (gameStats?.totalGames || 0)}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {shopStats?.totalProducts || 0} products • {gameStats?.totalGames || 0} games
                    </p>
                  </div>
                  <Package className='w-6 h-6 sm:w-8 sm:h-8 text-purple-500' />
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.totalOrders')}
                    </p>
                    <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                      {shopStats?.totalOrders || 0}
                    </p>
                  </div>
                  <ShoppingCart className='w-6 h-6 sm:w-8 sm:h-8 text-orange-500' />
                </div>
              </CardContent>
            </Card>

            {/* Shop Rating */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.shopRating')}
                    </p>
                    <div className='flex items-center space-x-1'>
                      <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                        {shopStats?.shopRating?.toFixed(1) || '0.0'}
                      </p>
                      <Star className='w-4 h-4 text-yellow-500 fill-current' />
                    </div>
                  </div>
                  <Award className='w-6 h-6 sm:w-8 sm:h-8 text-yellow-500' />
                </div>
              </CardContent>
            </Card>

            {/* Followers */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.followers')}
                    </p>
                    <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                      {shopStats?.followersCount || 0}
                    </p>
                  </div>
                  <Users className='w-6 h-6 sm:w-8 sm:h-8 text-blue-500' />
                </div>
              </CardContent>
            </Card>

            {/* Total Views */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.totalViews')}
                    </p>
                    <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                      {shopStats?.totalViews?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Eye className='w-6 h-6 sm:w-8 sm:h-8 text-gray-500' />
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card>
              <CardContent className='p-4 sm:p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.conversionRate')}
                    </p>
                    <p className='text-lg sm:text-2xl font-bold text-gray-900 dark:text-white'>
                      {shopStats?.conversionRate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <Activity className='w-6 h-6 sm:w-8 sm:h-8 text-green-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Revenue Chart */}
            {analytics && analytics.analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <BarChart3 className='w-5 h-5 mr-2' />
                    {t('vendor.revenueChart')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <AreaChart data={analytics.analytics}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type='monotone'
                        dataKey='revenue'
                        stroke='#FF5722'
                        fill='#FF5722'
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Orders Chart */}
            {analytics && analytics.analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <TrendingUp className='w-5 h-5 mr-2' />
                    {t('vendor.ordersChart')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={analytics.analytics}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type='monotone'
                        dataKey='orders'
                        stroke='#2196F3'
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value='shop' className='space-y-6'>
          {/* Shop Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.shopRevenue')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      ${shopStats?.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Store className='w-8 h-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.activeProducts')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {shopStats?.activeProducts || 0}
                    </p>
                  </div>
                  <Package className='w-8 h-8 text-blue-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.totalLikes')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {shopStats?.totalLikes || 0}
                    </p>
                  </div>
                  <Heart className='w-8 h-8 text-red-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.monthlyOrders')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {shopStats?.monthlyOrders || 0}
                    </p>
                  </div>
                  <ShoppingBag className='w-8 h-8 text-purple-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          {orders && orders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('vendor.recentOrders')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {orders.slice(0, 5).map((order: any) => (
                    <div
                      key={order.id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div>
                        <p className='font-medium'>#{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className='text-sm text-gray-500'>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>${order.total?.toLocaleString()}</p>
                        <Badge
                          variant={order.status === 'delivered' ? 'default' : 'secondary'}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value='games' className='space-y-6'>
          {/* Games Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.totalGames')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {gameStats?.totalGames || 0}
                    </p>
                  </div>
                  <GamepadIcon className='w-8 h-8 text-orange-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.activeGames')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {gameStats?.activeGames || 0}
                    </p>
                  </div>
                  <Activity className='w-8 h-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.gameRevenue')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      ${gameStats?.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                  <DollarSign className='w-8 h-8 text-blue-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                      {t('vendor.totalParticipants')}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {gameStats?.totalParticipants || 0}
                    </p>
                  </div>
                  <Users className='w-8 h-8 text-purple-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Revenue Chart */}
          {revenueData && (
            <Card>
              <CardHeader>
                <CardTitle>{t('vendor.gameRevenueChart')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='revenue' fill='#FF5722' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};