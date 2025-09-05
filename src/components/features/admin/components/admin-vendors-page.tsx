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
import { useVendors } from '../api/queries';
import {
  useUpdateVendor,
  useSuspendVendor,
  useActivateVendor,
} from '../api/mutations';
import { VendorData } from '../api/type';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Gamepad2,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  User as UserIcon,
  Users,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { StatusFilter } from '../api/type';

export function AdminVendorsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<
    'suspend' | 'activate' | 'ban' | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);

  // TanStack Query hooks
  const { data: vendors = [], isLoading, error } = useVendors();

  // Mutation hooks for vendor actions
  const suspendVendor = useSuspendVendor();
  const activateVendor = useActivateVendor();
  const updateVendor = useUpdateVendor();

  // Check admin permission
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Calculate statistics from all vendors data (not filtered)
  const stats = useMemo(() => {
    if (!vendors.length) {
      return {
        total: 0,
        active: 0,
        suspended: 0,
        banned: 0,
      };
    }

    return {
      total: vendors.length,
      active: vendors.filter((v: VendorData) => v.status === 'ACTIVE').length,
      suspended: vendors.filter((v: VendorData) => v.status === 'SUSPENDED')
        .length,
      banned: vendors.filter((v: VendorData) => v.status === 'BANNED').length,
    };
  }, [vendors]);

  // Filter and search vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vendor: VendorData) =>
          vendor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (vendor: VendorData) => vendor.status === statusFilter
      );
    }

    return filtered;
  }, [vendors, searchTerm, statusFilter]);

  // Convert vendors to VendorData format with calculated stats
  const vendorsWithStats = useMemo(() => {
    return filteredVendors.map((vendor: VendorData) => ({
      id: vendor.id,
      firstName: vendor.firstName || 'N/A',
      lastName: vendor.lastName || 'N/A',
      email: vendor.email,
      phone: vendor.phone || '',
      role: vendor.role,
      status: vendor.status || 'ACTIVE',
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      companyName: vendor.companyName || 'N/A',
      productCategory: vendor.productCategory || 'General',
      totalGames: vendor.totalGames || 0,
      totalRevenue: vendor.totalRevenue || 0,
      averageRating: vendor.averageRating || 0,
      isVerified: vendor.isVerified || false,
    }));
  }, [filteredVendors]);

  // Create paginated response structure
  const vendorsData = useMemo(() => {
    const total = vendorsWithStats.length;
    const pageSize = 10;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = vendorsWithStats.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page: currentPage,
      pageSize,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    };
  }, [vendorsWithStats, currentPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleVendorAction = () => {
    if (!selectedVendor || !actionType) return;

    const statusMap = {
      suspend: 'SUSPENDED',
      activate: 'ACTIVE',
      ban: 'BANNED',
    };

    if (actionType === 'suspend') {
      suspendVendor.mutate(
        {
          id: selectedVendor.id,
          reason: 'Admin action',
        },
        {
          onSuccess: () => {
            toast.success(
              t('admin.vendors.suspendSuccess', 'Vendor suspended successfully')
            );
            setShowConfirmModal(false);
            setSelectedVendor(null);
            setActionType(null);
          },
          onError: () => {
            toast.error(
              t('admin.vendors.actionError', 'Failed to perform action')
            );
          },
        }
      );
    } else if (actionType === 'activate') {
      activateVendor.mutate(selectedVendor.id, {
        onSuccess: () => {
          toast.success(
            t('admin.vendors.activateSuccess', 'Vendor activated successfully')
          );
          setShowConfirmModal(false);
          setSelectedVendor(null);
          setActionType(null);
        },
        onError: () => {
          toast.error(
            t('admin.vendors.actionError', 'Failed to perform action')
          );
        },
      });
    } else if (actionType === 'ban') {
      updateVendor.mutate(
        {
          id: selectedVendor.id,
          status: 'BANNED',
        },
        {
          onSuccess: () => {
            toast.success(
              t('admin.vendors.banSuccess', 'Vendor banned successfully')
            );
            setShowConfirmModal(false);
            setSelectedVendor(null);
            setActionType(null);
          },
          onError: () => {
            toast.error(
              t('admin.vendors.actionError', 'Failed to perform action')
            );
          },
        }
      );
    }
  };

  const openActionModal = (
    vendor: VendorData,
    action: 'suspend' | 'activate' | 'ban'
  ) => {
    setSelectedVendor(vendor);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      ACTIVE: 'default',
      SUSPENDED: 'secondary',
      BANNED: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className='text-xs'>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <ShieldCheck className='w-4 h-4 text-green-500' />;
      case 'SUSPENDED':
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      case 'BANNED':
        return <ShieldAlert className='w-4 h-4 text-red-500' />;
      default:
        return <UserIcon className='w-4 h-4 text-gray-400' />;
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
          <div className='animate-pulse space-y-6'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3'></div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='h-24 bg-gray-200 dark:bg-gray-700 rounded-lg'
                ></div>
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
          <div className='flex items-center space-x-3 sm:space-x-4 mb-4'>
            <div className='p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl'>
              <Users className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
            </div>
            <div>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white'>
                {t('admin.vendors.title', 'Vendor Management')}
              </h1>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1'>
                {t(
                  'admin.vendors.subtitle',
                  'Manage vendor accounts and monitor performance'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6'>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
              {vendorsData.total}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.vendors.totalVendors', 'Total Vendors')}
            </div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-green-600'>
              {stats.active}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.vendors.activeVendors', 'Active')}
            </div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-yellow-600'>
              {stats.suspended}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.vendors.suspendedVendors', 'Suspended')}
            </div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-xl sm:text-2xl font-bold text-red-600'>
              {stats.banned}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              {t('admin.vendors.bannedVendors', 'Banned')}
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className='p-4 sm:p-6 mb-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder={t(
                    'admin.vendors.searchPlaceholder',
                    'Search vendors...'
                  )}
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <Select
                value={statusFilter}
                onValueChange={(value: StatusFilter) =>
                  handleStatusFilter(value)
                }
              >
                <SelectTrigger className='w-[140px]'>
                  <Filter className='w-4 h-4 mr-2' />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>
                    {t('admin.vendors.allStatuses', 'All Status')}
                  </SelectItem>
                  <SelectItem value='ACTIVE'>
                    {t('admin.vendors.active', 'Active')}
                  </SelectItem>
                  <SelectItem value='SUSPENDED'>
                    {t('admin.vendors.suspended', 'Suspended')}
                  </SelectItem>
                  <SelectItem value='BANNED'>
                    {t('admin.vendors.banned', 'Banned')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='icon'
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
        </Card>

        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building2 className='w-5 h-5' />
              {t('admin.vendors.vendorsList', 'Vendors List')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4'></div>
                <p className='text-gray-600 dark:text-gray-300'>
                  {t('common.loading')}
                </p>
              </div>
            ) : vendorsWithStats.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className='hidden md:block overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('admin.vendors.vendor', 'Vendor')}
                        </TableHead>
                        <TableHead>
                          {t('admin.vendors.company', 'Company')}
                        </TableHead>
                        <TableHead>
                          {t('admin.vendors.contact', 'Contact')}
                        </TableHead>
                        <TableHead>
                          {t('admin.vendors.status', 'Status')}
                        </TableHead>
                        <TableHead>
                          {t('admin.vendors.performance', 'Performance')}
                        </TableHead>
                        <TableHead>
                          {t('admin.vendors.joinedDate', 'Joined')}
                        </TableHead>
                        <TableHead className='w-[100px]'>
                          {t('common.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorsWithStats.map(vendor => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div className='flex items-center space-x-3'>
                              <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                                <span className='text-white text-sm font-medium'>
                                  {vendor.firstName.charAt(0)}
                                  {vendor.lastName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className='font-medium text-gray-900 dark:text-white'>
                                  {vendor.firstName} {vendor.lastName}
                                </p>
                                <p className='text-sm text-gray-500'>
                                  {vendor.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className='font-medium'>
                                {vendor.companyName || 'N/A'}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {vendor.productCategory || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              <div className='flex items-center space-x-2'>
                                <Mail className='w-3 h-3 text-gray-400' />
                                <span className='text-sm'>{vendor.email}</span>
                              </div>
                              {vendor.phone && (
                                <div className='flex items-center space-x-2'>
                                  <Phone className='w-3 h-3 text-gray-400' />
                                  <span className='text-sm'>
                                    {vendor.phone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              {getStatusIcon(vendor.status)}
                              {getStatusBadge(vendor.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              <div className='flex items-center space-x-2'>
                                <Gamepad2 className='w-3 h-3 text-gray-400' />
                                <span className='text-sm'>
                                  {vendor.totalGames}{' '}
                                  {t('admin.vendors.games', 'games')}
                                </span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <Star className='w-3 h-3 text-yellow-500' />
                                <span className='text-sm'>
                                  {vendor.averageRating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-gray-500'>
                              {new Date(vendor.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setShowDetailsModal(true);
                                }}
                              >
                                <Eye className='w-4 h-4' />
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  const action =
                                    vendor.status === 'ACTIVE'
                                      ? 'suspend'
                                      : 'activate';
                                  openActionModal(vendor, action);
                                }}
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
                  {vendorsWithStats.map(vendor => (
                    <Card key={vendor.id} className='p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                            <span className='text-white text-sm font-medium'>
                              {vendor.firstName.charAt(0)}
                              {vendor.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className='font-medium text-gray-900 dark:text-white'>
                              {vendor.firstName} {vendor.lastName}
                            </h3>
                            <p className='text-sm text-gray-500'>
                              {vendor.companyName || 'No company'}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getStatusIcon(vendor.status)}
                          {getStatusBadge(vendor.status)}
                        </div>
                      </div>

                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center space-x-2'>
                          <Mail className='w-4 h-4 text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-300'>
                            {vendor.email}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Gamepad2 className='w-4 h-4 text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-300'>
                            {vendor.totalGames}{' '}
                            {t('admin.vendors.games', 'games')}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Star className='w-4 h-4 text-yellow-500' />
                          <span className='text-gray-600 dark:text-gray-300'>
                            {vendor.averageRating.toFixed(1)} rating
                          </span>
                        </div>
                      </div>

                      <div className='flex gap-2 mt-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowDetailsModal(true);
                          }}
                          className='flex-1'
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          {t('common.view')}
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            const action =
                              vendor.status === 'ACTIVE'
                                ? 'suspend'
                                : 'activate';
                            openActionModal(vendor, action);
                          }}
                          className='flex-1'
                        >
                          {vendor.status === 'ACTIVE' ? (
                            <>
                              <XCircle className='w-4 h-4 mr-2' />
                              {t('admin.vendors.suspend')}
                            </>
                          ) : (
                            <>
                              <ShieldCheck className='w-4 h-4 mr-2' />
                              {t('admin.vendors.activate')}
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {vendorsData.total > vendorsData.pageSize && (
                  <div className='flex items-center justify-between mt-6'>
                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                      {t('common.showing')}{' '}
                      {(currentPage - 1) * vendorsData.pageSize + 1}{' '}
                      {t('common.to')}{' '}
                      {Math.min(
                        currentPage * vendorsData.pageSize,
                        vendorsData.total
                      )}{' '}
                      {t('common.of')} {vendorsData.total} {t('common.results')}
                    </p>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={!vendorsData.hasPrevious}
                      >
                        <ChevronLeft className='w-4 h-4' />
                      </Button>
                      <span className='px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded'>
                        {currentPage}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!vendorsData.hasNext}
                      >
                        <ChevronRight className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className='text-center py-12'>
                <Users className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  {t('admin.vendors.noVendorsFound', 'No vendors found')}
                </h3>
                <p className='text-gray-500 dark:text-gray-400'>
                  {searchTerm || statusFilter !== 'all'
                    ? t(
                        'admin.vendors.tryDifferentFilter',
                        'Try adjusting your search or filters'
                      )
                    : t(
                        'admin.vendors.noVendorsYet',
                        'No vendor applications have been approved yet'
                      )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {t('admin.vendors.vendorDetails', 'Vendor Details')}
            </DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className='space-y-4'>
              {/* Basic Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('admin.vendors.name', 'Name')}
                  </label>
                  <p className='mt-1 text-gray-900 dark:text-white'>
                    {selectedVendor.firstName} {selectedVendor.lastName}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('admin.vendors.email', 'Email')}
                  </label>
                  <p className='mt-1 text-gray-900 dark:text-white'>
                    {selectedVendor.email}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('admin.vendors.company', 'Company')}
                  </label>
                  <p className='mt-1 text-gray-900 dark:text-white'>
                    {selectedVendor.companyName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('admin.vendors.status', 'Status')}
                  </label>
                  <div className='mt-1 flex items-center space-x-2'>
                    {getStatusIcon(selectedVendor.status)}
                    {getStatusBadge(selectedVendor.status)}
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className='border-t pt-4'>
                <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  {t('admin.vendors.performance', 'Performance')}
                </h4>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {selectedVendor.totalGames}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {t('admin.vendors.totalGames', 'Total Games')}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      ${selectedVendor.totalRevenue.toLocaleString()}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {t('admin.vendors.totalRevenue', 'Revenue')}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {selectedVendor.averageRating.toFixed(1)}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {t('admin.vendors.avgRating', 'Avg Rating')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'suspend' &&
                t('admin.vendors.confirmSuspend', 'Suspend Vendor')}
              {actionType === 'activate' &&
                t('admin.vendors.confirmActivate', 'Activate Vendor')}
              {actionType === 'ban' &&
                t('admin.vendors.confirmBan', 'Ban Vendor')}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'suspend' &&
                t(
                  'admin.vendors.suspendWarning',
                  'This will temporarily suspend the vendor account.'
                )}
              {actionType === 'activate' &&
                t(
                  'admin.vendors.activateWarning',
                  'This will reactivate the vendor account.'
                )}
              {actionType === 'ban' &&
                t(
                  'admin.vendors.banWarning',
                  'This will permanently ban the vendor account.'
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowConfirmModal(false)}
              disabled={
                suspendVendor.isPending ||
                activateVendor.isPending ||
                updateVendor.isPending
              }
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleVendorAction}
              disabled={
                suspendVendor.isPending ||
                activateVendor.isPending ||
                updateVendor.isPending
              }
              variant={actionType === 'ban' ? 'destructive' : 'default'}
            >
              {suspendVendor.isPending ||
              activateVendor.isPending ||
              updateVendor.isPending
                ? t('common.processing')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
