'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Monitor,
  User,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanEvent } from '@/types';

interface ScanEventsStats {
  totalScans: number;
  validatedScans: number;
  invalidScans: number;
  suspiciousActivity: number;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    scanCount: number;
  }>;
}

export const AdminScanEvents: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [filterScannedBy, setFilterScannedBy] = useState<string>('all');
  const [dateRange, setDateRange] = useState('7'); // days

  // Fetch scan events
  const { data: scanEvents, isLoading } = useQuery({
    queryKey: ['admin', 'scan-events', searchTerm, filterStatus, filterDevice, filterScannedBy, dateRange],
    queryFn: async (): Promise<ScanEvent[]> => {
      const params = new URLSearchParams({
        search: searchTerm,
        status: filterStatus,
        device: filterDevice,
        scannedBy: filterScannedBy,
        days: dateRange,
      });

      const response = await fetch(`/api/admin/scan-events?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch scan events');
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds - scan events change frequently
  });

  // Fetch scan statistics
  const { data: stats } = useQuery({
    queryKey: ['admin', 'scan-stats', dateRange],
    queryFn: async (): Promise<ScanEventsStats> => {
      const response = await fetch(`/api/admin/scan-events/stats?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch scan stats');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get result badge variant
  const getResultBadgeVariant = (result: ScanEvent['result']) => {
    switch (result) {
      case 'VALIDATED':
      case 'VALID':
        return 'default';
      case 'ALREADY_USED':
        return 'secondary';
      case 'EXPIRED':
      case 'INVALID':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get result icon
  const getResultIcon = (result: ScanEvent['result']) => {
    switch (result) {
      case 'VALIDATED':
      case 'VALID':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ALREADY_USED':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'EXPIRED':
      case 'INVALID':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Export scan events
  const exportScanEvents = async () => {
    try {
      const response = await fetch('/api/admin/scan-events/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          search: searchTerm,
          status: filterStatus,
          device: filterDevice,
          scannedBy: filterScannedBy,
          days: dateRange,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scan-events-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.scanEvents.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.scanEvents.subtitle')}
          </p>
        </div>
        <Button onClick={exportScanEvents} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>{t('admin.scanEvents.export')}</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('admin.scanEvents.totalScans')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalScans.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('admin.scanEvents.validatedScans')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.validatedScans.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('admin.scanEvents.invalidScans')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.invalidScans.toLocaleString()}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('admin.scanEvents.suspiciousActivity')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.suspiciousActivity.toLocaleString()}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>{t('admin.scanEvents.filters')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.scanEvents.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="all">{t('admin.scanEvents.allStatuses')}</option>
              <option value="VALIDATED">{t('admin.scanEvents.validated')}</option>
              <option value="VALID">{t('admin.scanEvents.valid')}</option>
              <option value="ALREADY_USED">{t('admin.scanEvents.alreadyUsed')}</option>
              <option value="EXPIRED">{t('admin.scanEvents.expired')}</option>
              <option value="INVALID">{t('admin.scanEvents.invalid')}</option>
            </select>

            {/* Device Filter */}
            <select
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="all">{t('admin.scanEvents.allDevices')}</option>
              <option value="web">{t('admin.scanEvents.web')}</option>
              <option value="mobile">{t('admin.scanEvents.mobile')}</option>
            </select>

            {/* Scanned By Filter */}
            <select
              value={filterScannedBy}
              onChange={(e) => setFilterScannedBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="all">{t('admin.scanEvents.allTypes')}</option>
              <option value="player">{t('admin.scanEvents.playerScans')}</option>
              <option value="vendor">{t('admin.scanEvents.vendorScans')}</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="1">{t('admin.scanEvents.last24Hours')}</option>
              <option value="7">{t('admin.scanEvents.last7Days')}</option>
              <option value="30">{t('admin.scanEvents.last30Days')}</option>
              <option value="90">{t('admin.scanEvents.last90Days')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Scan Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.scanEvents.recentScans')}</CardTitle>
        </CardHeader>
        <CardContent>
          {scanEvents && scanEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t('admin.scanEvents.timestamp')}</th>
                    <th className="text-left p-3">{t('admin.scanEvents.ticketId')}</th>
                    <th className="text-left p-3">{t('admin.scanEvents.result')}</th>
                    <th className="text-left p-3">{t('admin.scanEvents.scannedBy')}</th>
                    <th className="text-left p-3">{t('admin.scanEvents.device')}</th>
                    <th className="text-left p-3">{t('admin.scanEvents.location')}</th>
                  </tr>
                </thead>
                <tbody>
                  {scanEvents.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(event.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {event.ticketId.slice(0, 8)}...
                        </code>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getResultIcon(event.result)}
                          <Badge variant={getResultBadgeVariant(event.result)}>
                            {event.result}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {event.scannedBy === 'vendor' ? (
                            <Store className="w-4 h-4 text-purple-500" />
                          ) : (
                            <User className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="capitalize">{event.scannedBy}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {event.device === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-green-500" />
                          ) : (
                            <Monitor className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="capitalize">{event.device}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-500 text-xs">{event.ip}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('admin.scanEvents.noScans')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Vendors */}
      {stats && stats.topVendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.scanEvents.topVendors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topVendors.map((vendor, index) => (
                <div key={vendor.vendorId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{vendor.vendorName}</p>
                      <p className="text-sm text-gray-500">{vendor.vendorId}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {vendor.scanCount} {t('admin.scanEvents.scans')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};