'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    ShoppingCart,
    Calendar,
    Filter,
    Download,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface RevenueData {
    date: string;
    revenue: number;
    transactions: number;
    users: number;
    games: number;
}

interface RevenueMetrics {
    totalRevenue: number;
    totalTransactions: number;
    totalUsers: number;
    averageOrderValue: number;
    revenueGrowth: number;
    transactionGrowth: number;
    userGrowth: number;
}

export function AdminAnalyticsRevenuePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('30d');
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Mock data
    const mockRevenueData: RevenueData[] = [
        { date: '2024-01-01', revenue: 12500, transactions: 150, users: 120, games: 45 },
        { date: '2024-01-02', revenue: 13800, transactions: 165, users: 135, games: 52 },
        { date: '2024-01-03', revenue: 15200, transactions: 180, users: 150, games: 58 },
        { date: '2024-01-04', revenue: 14100, transactions: 170, users: 140, games: 55 },
        { date: '2024-01-05', revenue: 16800, transactions: 190, users: 160, games: 62 },
        { date: '2024-01-06', revenue: 18900, transactions: 210, users: 175, games: 68 },
        { date: '2024-01-07', revenue: 20100, transactions: 225, users: 185, games: 72 },
    ];

    const mockMetrics: RevenueMetrics = {
        totalRevenue: 111400,
        totalTransactions: 1290,
        totalUsers: 1065,
        averageOrderValue: 86.36,
        revenueGrowth: 12.5,
        transactionGrowth: 8.3,
        userGrowth: 15.2,
    };

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
                // TODO: Replace with actual API calls
                setRevenueData(mockRevenueData);
                setMetrics(mockMetrics);
            } catch (error) {
                console.error('Error loading revenue data:', error);
            } finally {
                setPageLoading(false);
            }
        };

        if (user && user.role === 'ADMIN') {
            loadData();
        }
    }, [user, timeRange]);

    // Loading state
    if (loading || pageLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Revenue Analytics
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Track revenue performance and financial metrics
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Select
                                value={timeRange}
                                onValueChange={setTimeRange}
                            >
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                                <option value="1y">Last year</option>
                            </Select>
                            <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Revenue
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {metrics ? formatCurrency(metrics.totalRevenue) : '$0'}
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                                +{metrics?.revenueGrowth}% from last period
                            </span>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Transactions
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {metrics ? formatNumber(metrics.totalTransactions) : '0'}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                                +{metrics?.transactionGrowth}% from last period
                            </span>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Users
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {metrics ? formatNumber(metrics.totalUsers) : '0'}
                                </p>
                            </div>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                                +{metrics?.userGrowth}% from last period
                            </span>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Average Order Value
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {metrics ? formatCurrency(metrics.averageOrderValue) : '$0'}
                                </p>
                            </div>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                                +5.2% from last period
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Revenue Chart */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Revenue Trend
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                    <LineChart className="w-4 h-4 mr-1" />
                                    Line
                                </Button>
                                <Button variant="outline" size="sm">
                                    <BarChart3 className="w-4 h-4 mr-1" />
                                    Bar
                                </Button>
                            </div>
                        </div>
                        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Revenue chart will be implemented here
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Transactions Chart */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Transaction Volume
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                    <PieChart className="w-4 h-4 mr-1" />
                                    Pie
                                </Button>
                                <Button variant="outline" size="sm">
                                    <BarChart3 className="w-4 h-4 mr-1" />
                                    Bar
                                </Button>
                            </div>
                        </div>
                        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Transaction chart will be implemented here
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Revenue Data Table */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Revenue Data
                        </h3>
                        <div className="flex items-center space-x-4">
                            <Input
                                type="text"
                                placeholder="Search..."
                                className="w-64"
                            />
                            <Button variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Transactions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Users
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Games
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {revenueData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {new Date(row.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(row.revenue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatNumber(row.transactions)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatNumber(row.users)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatNumber(row.games)}
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
