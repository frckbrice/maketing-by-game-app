'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Download,
  FileText,
  Filter,
  Gamepad2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'FINANCIAL' | 'USERS' | 'GAMES' | 'VENDORS' | 'CUSTOM';
  format: 'PDF' | 'CSV' | 'XLSX';
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  createdAt: number;
  completedAt?: number;
  createdBy: string;
  downloadUrl?: string;
  fileSize?: number;
  parameters: Record<string, any>;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'FINANCIAL' | 'USERS' | 'GAMES' | 'VENDORS' | 'CUSTOM';
  parameters: ReportParameter[];
  icon: React.ReactNode;
}

interface ReportParameter {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    description: 'Complete financial overview including revenue, transactions, and trends',
    type: 'FINANCIAL',
    icon: <BarChart3 className='w-5 h-5 text-green-500' />,
    parameters: [
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
      },
      {
        name: 'endDate',
        label: 'End Date',
        type: 'date',
        required: true,
      },
      {
        name: 'groupBy',
        label: 'Group By',
        type: 'select',
        required: false,
        options: [
          { value: 'day', label: 'Daily' },
          { value: 'week', label: 'Weekly' },
          { value: 'month', label: 'Monthly' },
        ],
        defaultValue: 'day',
      },
    ],
  },
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'User engagement metrics, registrations, and activity patterns',
    type: 'USERS',
    icon: <Users className='w-5 h-5 text-blue-500' />,
    parameters: [
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
      },
      {
        name: 'endDate',
        label: 'End Date',
        type: 'date',
        required: true,
      },
      {
        name: 'userType',
        label: 'User Type',
        type: 'select',
        required: false,
        options: [
          { value: 'all', label: 'All Users' },
          { value: 'USER', label: 'Regular Users' },
          { value: 'VENDOR', label: 'Vendors' },
          { value: 'ADMIN', label: 'Admins' },
        ],
        defaultValue: 'all',
      },
    ],
  },
  {
    id: 'game-performance',
    name: 'Game Performance',
    description: 'Game statistics, popularity metrics, and performance analysis',
    type: 'GAMES',
    icon: <Gamepad2 className='w-5 h-5 text-purple-500' />,
    parameters: [
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
      },
      {
        name: 'endDate',
        label: 'End Date',
        type: 'date',
        required: true,
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: false,
        options: [
          { value: 'all', label: 'All Categories' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'fashion', label: 'Fashion' },
          { value: 'home', label: 'Home & Garden' },
        ],
        defaultValue: 'all',
      },
    ],
  },
  {
    id: 'vendor-analytics',
    name: 'Vendor Analytics',
    description: 'Vendor performance, revenue distribution, and rankings',
    type: 'VENDORS',
    icon: <TrendingUp className='w-5 h-5 text-orange-500' />,
    parameters: [
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
      },
      {
        name: 'endDate',
        label: 'End Date',
        type: 'date',
        required: true,
      },
      {
        name: 'minRevenue',
        label: 'Minimum Revenue',
        type: 'number',
        required: false,
      },
    ],
  },
];

type StatusFilter = 'all' | 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
type TypeFilter = 'all' | 'FINANCIAL' | 'USERS' | 'GAMES' | 'VENDORS' | 'CUSTOM';

export function AdminReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});

  // Fetch reports with TanStack Query
  const { data: reports = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          //TODO: Mock data for development
          const mockReports: Report[] = [
            {
              id: '1',
              name: 'Financial Summary - Q1 2025',
              description: 'Quarterly financial overview with revenue analysis',
              type: 'FINANCIAL',
              format: 'PDF',
              status: 'COMPLETED',
              createdAt: Date.now() - 86400000,
              completedAt: Date.now() - 86000000,
              createdBy: user?.id || '',
              downloadUrl: '/api/reports/1/download',
              fileSize: 2048576,
              parameters: { startDate: '2025-01-01', endDate: '2025-03-31' },
            },
            {
              id: '2',
              name: 'User Activity Report - January',
              description: 'Monthly user engagement and activity metrics',
              type: 'USERS',
              format: 'CSV',
              status: 'GENERATING',
              createdAt: Date.now() - 3600000,
              createdBy: user?.id || '',
              parameters: { startDate: '2025-01-01', endDate: '2025-01-31' },
            },
            {
              id: '3',
              name: 'Game Performance Analysis',
              description: 'Top performing games with detailed analytics',
              type: 'GAMES',
              format: 'XLSX',
              status: 'FAILED',
              createdAt: Date.now() - 7200000,
              createdBy: user?.id || '',
              parameters: { startDate: '2025-01-01', endDate: '2025-01-31' },
            },
          ];
          return mockReports;
        }
        
        // TODO: Implement real Firebase reports collection
        // const reportsSnapshot = await firestoreService.getReports();
        // return reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
        
        return [];
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error(t('admin.reports.loadError'));
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user && user.role === 'ADMIN',
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: Omit<Report, 'id' | 'createdAt' | 'status'>) => {
      try {
        // TODO: Implement real Firebase report creation
        const newReport: Report = {
          ...reportData,
          id: Date.now().toString(),
          status: 'PENDING',
          createdAt: Date.now(),
        };
        
        // Add to Firebase
        // await firestoreService.createReport(newReport);
        
        return newReport;
      } catch (error) {
        console.error('Error creating report:', error);
        throw error;
      }
    },
    onSuccess: (newReport) => {
      queryClient.setQueryData(['admin-reports'], (old: Report[] = []) => [newReport, ...old]);
      toast.success(t('admin.reports.createSuccess'));
      setShowCreateModal(false);
      setSelectedTemplate(null);
      setReportParameters({});
      
      //TODO: Simulate report generation with optimistic updates
      setTimeout(() => {
        queryClient.setQueryData(['admin-reports'], (old: Report[] = []) =>
          old.map(r => r.id === newReport.id ? { ...r, status: 'GENERATING' as const } : r)
        );
        
        setTimeout(() => {
          queryClient.setQueryData(['admin-reports'], (old: Report[] = []) =>
            old.map(r => r.id === newReport.id ? {
              ...r,
              status: 'COMPLETED' as const,
              completedAt: Date.now(),
              downloadUrl: `/api/reports/${newReport.id}/download`,
              fileSize: Math.floor(Math.random() * 5000000) + 1000000,
            } : r)
          );
        }, 5000);
      }, 2000);
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast.error(t('admin.reports.createError'));
    },
  });

  // Check admin permission
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleCreateReport = async () => {
    if (!selectedTemplate) return;

    // Validate required parameters
    const missingParams = selectedTemplate.parameters
      .filter(param => param.required && !reportParameters[param.name])
      .map(param => param.label);

    if (missingParams.length > 0) {
      toast.error(`Missing required fields: ${missingParams.join(', ')}`);
      return;
    }

    // Create new report using mutation
    const reportData = {
      name: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      description: selectedTemplate.description,
      type: selectedTemplate.type,
      format: 'PDF' as const,
      createdBy: user?.id || '',
      parameters: reportParameters,
    };

    createReportMutation.mutate(reportData);
  };

  const handleDownload = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report || !report.downloadUrl) {
        toast.error(t('admin.reports.downloadNotAvailable'));
        return;
      }

      //Create a mock download for demonstration
      //TODO:  In production, this would be a real API endpoint
      const mockData = {
        reportId,
        reportName: report.name,
        generatedAt: new Date().toISOString(),
        data: {
          summary: 'Report generated successfully',
          parameters: report.parameters,
        },
      };

      const dataStr = JSON.stringify(mockData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${report.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(t('admin.reports.downloadStarted'));
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(t('admin.reports.downloadError'));
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    const variants: Record<Report['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'secondary',
      GENERATING: 'outline',
      COMPLETED: 'default',
      FAILED: 'destructive',
    };

    const colors: Record<Report['status'], string> = {
      PENDING: 'text-yellow-600 bg-yellow-50',
      GENERATING: 'text-blue-600 bg-blue-50',
      COMPLETED: 'text-green-600 bg-green-50',
      FAILED: 'text-red-600 bg-red-50',
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'FINANCIAL':
        return <BarChart3 className='w-4 h-4 text-green-500' />;
      case 'USERS':
        return <Users className='w-4 h-4 text-blue-500' />;
      case 'GAMES':
        return <Gamepad2 className='w-4 h-4 text-purple-500' />;
      case 'VENDORS':
        return <TrendingUp className='w-4 h-4 text-orange-500' />;
      default:
        return <FileText className='w-4 h-4 text-gray-500' />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
          <div className='animate-pulse space-y-6'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3'></div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='h-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
              ))}
            </div>
            <div className='h-96 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Header */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white'>
                {t('admin.reports.title', 'Reports & Analytics')}
              </h1>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1'>
                {t('admin.reports.subtitle', 'Generate and download comprehensive reports')}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
            >
              <Plus className='w-4 h-4 mr-2' />
              {t('admin.reports.createReport', 'Create Report')}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6'>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
              {reports.length}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.reports.totalReports', 'Total Reports')}
            </div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-green-600'>
              {reports.filter(r => r.status === 'COMPLETED').length}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.reports.completed', 'Completed')}
            </div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-blue-600'>
              {reports.filter(r => r.status === 'GENERATING').length}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.reports.generating', 'Generating')}
            </div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-red-600'>
              {reports.filter(r => r.status === 'FAILED').length}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.reports.failed', 'Failed')}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className='p-4 sm:p-6 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder={t('admin.reports.searchPlaceholder', 'Search reports...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className='w-[140px]'>
                  <Filter className='w-4 h-4 mr-2' />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('admin.reports.allStatuses', 'All Status')}</SelectItem>
                  <SelectItem value='PENDING'>{t('admin.reports.pending', 'Pending')}</SelectItem>
                  <SelectItem value='GENERATING'>{t('admin.reports.generating', 'Generating')}</SelectItem>
                  <SelectItem value='COMPLETED'>{t('admin.reports.completed', 'Completed')}</SelectItem>
                  <SelectItem value='FAILED'>{t('admin.reports.failed', 'Failed')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value: TypeFilter) => setTypeFilter(value)}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('admin.reports.allTypes', 'All Types')}</SelectItem>
                  <SelectItem value='FINANCIAL'>{t('admin.reports.financial', 'Financial')}</SelectItem>
                  <SelectItem value='USERS'>{t('admin.reports.users', 'Users')}</SelectItem>
                  <SelectItem value='GAMES'>{t('admin.reports.games', 'Games')}</SelectItem>
                  <SelectItem value='VENDORS'>{t('admin.reports.vendors', 'Vendors')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='icon'
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='w-5 h-5' />
              {t('admin.reports.reportsList', 'Reports List')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReports.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className='hidden md:block overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin.reports.name', 'Name')}</TableHead>
                        <TableHead>{t('admin.reports.type', 'Type')}</TableHead>
                        <TableHead>{t('admin.reports.status', 'Status')}</TableHead>
                        <TableHead>{t('admin.reports.created', 'Created')}</TableHead>
                        <TableHead>{t('admin.reports.size', 'Size')}</TableHead>
                        <TableHead className='w-[100px]'>{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>
                                {report.name}
                              </p>
                              <p className='text-sm text-gray-500'>{report.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              {getTypeIcon(report.type)}
                              <span className='text-sm'>{report.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(report.status)}
                          </TableCell>
                          <TableCell>
                            <div className='text-sm'>
                              <div>{new Date(report.createdAt).toLocaleDateString()}</div>
                              <div className='text-gray-500'>
                                {new Date(report.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-gray-600'>
                              {report.fileSize ? formatFileSize(report.fileSize) : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              {report.status === 'COMPLETED' && report.downloadUrl && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleDownload(report.id)}
                                >
                                  <Download className='w-4 h-4' />
                                </Button>
                              )}
                              <Button
                                variant='outline'
                                size='sm'
                              >
                                <MoreHorizontal className='w-4 h-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className='md:hidden space-y-4'>
                  {filteredReports.map((report) => (
                    <Card key={report.id} className='p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          {getTypeIcon(report.type)}
                          <div>
                            <h3 className='font-medium text-gray-900 dark:text-white'>
                              {report.name}
                            </h3>
                            <p className='text-sm text-gray-500'>{report.description}</p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center justify-between'>
                          <span className='text-gray-500'>{t('admin.reports.created', 'Created')}:</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        {report.fileSize && (
                          <div className='flex items-center justify-between'>
                            <span className='text-gray-500'>{t('admin.reports.size', 'Size')}:</span>
                            <span>{formatFileSize(report.fileSize)}</span>
                          </div>
                        )}
                      </div>

                      {report.status === 'COMPLETED' && report.downloadUrl && (
                        <div className='mt-4'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDownload(report.id)}
                            className='w-full'
                          >
                            <Download className='w-4 h-4 mr-2' />
                            {t('admin.reports.download', 'Download')}
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className='text-center py-12'>
                <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  {t('admin.reports.noReportsFound', 'No reports found')}
                </h3>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? t('admin.reports.tryDifferentFilter', 'Try adjusting your search or filters')
                    : t('admin.reports.getStarted', 'Get started by creating your first report')}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className='w-4 h-4 mr-2' />
                  {t('admin.reports.createReport', 'Create Report')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Report Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{t('admin.reports.createReport', 'Create Report')}</DialogTitle>
            <DialogDescription>
              {t('admin.reports.selectTemplate', 'Select a report template and configure parameters')}
            </DialogDescription>
          </DialogHeader>
          
          {!selectedTemplate ? (
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>{t('admin.reports.selectReportType', 'Select Report Type')}</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {REPORT_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className='p-4 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-orange-500'
                    onClick={() => {
                      setSelectedTemplate(template);
                      // Set default values
                      const defaults: Record<string, any> = {};
                      template.parameters.forEach(param => {
                        if (param.defaultValue !== undefined) {
                          defaults[param.name] = param.defaultValue;
                        }
                      });
                      setReportParameters(defaults);
                    }}
                  >
                    <div className='flex items-start space-x-3'>
                      <div className='p-2 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                        {template.icon}
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          {template.name}
                        </h4>
                        <p className='text-sm text-gray-500 mt-1'>
                          {template.description}
                        </p>
                        <Badge variant='outline' className='mt-2'>
                          {template.type}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {selectedTemplate.icon}
                  <div>
                    <h3 className='text-lg font-medium'>{selectedTemplate.name}</h3>
                    <p className='text-sm text-gray-500'>{selectedTemplate.description}</p>
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSelectedTemplate(null);
                    setReportParameters({});
                  }}
                >
                  {t('common.back')}
                </Button>
              </div>

              <div className='space-y-4'>
                <h4 className='font-medium'>{t('admin.reports.configureParameters', 'Configure Parameters')}</h4>
                {selectedTemplate.parameters.map((param) => (
                  <div key={param.name} className='space-y-2'>
                    <Label htmlFor={param.name}>
                      {param.label}
                      {param.required && <span className='text-red-500 ml-1'>*</span>}
                    </Label>
                    
                    {param.type === 'text' && (
                      <Input
                        id={param.name}
                        value={reportParameters[param.name] || ''}
                        onChange={(e) => setReportParameters(prev => ({
                          ...prev,
                          [param.name]: e.target.value
                        }))}
                      />
                    )}
                    
                    {param.type === 'number' && (
                      <Input
                        id={param.name}
                        type='number'
                        value={reportParameters[param.name] || ''}
                        onChange={(e) => setReportParameters(prev => ({
                          ...prev,
                          [param.name]: parseFloat(e.target.value) || 0
                        }))}
                      />
                    )}
                    
                    {param.type === 'date' && (
                      <Input
                        id={param.name}
                        type='date'
                        value={reportParameters[param.name] || ''}
                        onChange={(e) => setReportParameters(prev => ({
                          ...prev,
                          [param.name]: e.target.value
                        }))}
                      />
                    )}
                    
                    {param.type === 'select' && param.options && (
                      <Select
                        value={reportParameters[param.name] || param.defaultValue || ''}
                        onValueChange={(value) => setReportParameters(prev => ({
                          ...prev,
                          [param.name]: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${param.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowCreateModal(false);
                setSelectedTemplate(null);
                setReportParameters({});
              }}
            >
              {t('common.cancel')}
            </Button>
            {selectedTemplate && (
              <Button
                onClick={handleCreateReport}
                disabled={createReportMutation.isPending}
              >
                {createReportMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('admin.reports.generating', 'Generating...')}
                  </>
                ) : (
                  t('admin.reports.generate', 'Generate Report')
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}