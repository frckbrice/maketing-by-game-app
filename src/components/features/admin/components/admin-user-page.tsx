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
import { adminService } from '@/lib/api/adminService';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { PaginatedResponse, User } from '@/types';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Users as UsersIcon,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [usersData, setUsersData] = useState<PaginatedResponse<User> | null>(
    null
  );
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL_ROLES');
  const [statusFilter, setStatusFilter] = useState<string>('ALL_STATUS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newUserStatus, setNewUserStatus] = useState<
    'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  >('ACTIVE');
  const [processing, setProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const data = await adminService.getUsers({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        filters: {
          ...(roleFilter !== 'ALL_ROLES' && { role: roleFilter }),
          ...(statusFilter !== 'ALL_STATUS' && { status: statusFilter }),
        },
      });
      setUsersData(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user, loading, router, fetchUsers]);

  const handleUserStatusChange = async () => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      await adminService.updateUserStatus(selectedUser.id, newUserStatus);
      toast.success('User status updated successfully');
      setShowStatusDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      USER: 'default',
      VENDOR: 'secondary',
      ADMIN: 'destructive',
      MODERATOR: 'outline',
    } as const;

    const colors = {
      USER: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      VENDOR: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      ADMIN: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      MODERATOR: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    };

    return (
      <Badge
        variant={variants[role as keyof typeof variants] || 'default'}
        className={colors[role as keyof typeof colors] || ''}
      >
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const icons = {
      ACTIVE: <CheckCircle className='w-3 h-3 mr-1' />,
      SUSPENDED: <Ban className='w-3 h-3 mr-1' />,
      INACTIVE: <XCircle className='w-3 h-3 mr-1' />,
    };

    const variants = {
      ACTIVE: 'default',
      SUSPENDED: 'destructive',
      INACTIVE: 'secondary',
    } as const;

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || 'secondary'}
        className='flex items-center'
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

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
              <UsersIcon className='w-8 h-8 text-orange-500 mr-3' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Users Management
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Manage users, roles, and permissions
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Button onClick={fetchUsers} variant='outline' size='sm'>
                <RefreshCw className='w-4 h-4 mr-2' />
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
        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6 text-center'>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center'>
                <UsersIcon className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {usersData?.data.filter(u => u.role === 'USER').length || 0}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Players
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6 text-center'>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center'>
                <Shield className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {usersData?.data.filter(u => u.role === 'VENDOR').length || 0}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Vendors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6 text-center'>
              <div className='w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center'>
                <ShieldCheck className='w-6 h-6 text-red-600 dark:text-red-400' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {usersData?.data.filter(u => u.role === 'ADMIN').length || 0}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Admins</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6 text-center'>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center'>
                <CheckCircle className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {usersData?.data.filter(u => u.status === 'ACTIVE').length || 0}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    placeholder='Search users by name or email...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='w-full md:w-48'>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Filter by role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL_ROLES'>All Roles</SelectItem>
                    <SelectItem value='USER'>Users</SelectItem>
                    <SelectItem value='VENDOR'>Vendors</SelectItem>
                    <SelectItem value='ADMIN'>Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='w-full md:w-48'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL_STATUS'>All Status</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                    <SelectItem value='INACTIVE'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchUsers}>
                <Filter className='w-4 h-4 mr-2' />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Users ({usersData?.total || 0})</span>
              <Button variant='outline' size='sm'>
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className='text-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4'></div>
                <p className='text-gray-600 dark:text-gray-300'>
                  Loading users...
                </p>
              </div>
            ) : usersData && usersData.data.length > 0 ? (
              <>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.data.map(userData => (
                        <TableRow key={userData.id}>
                          <TableCell>
                            <div className='flex items-center'>
                              <div className='w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3'>
                                {userData.firstName[0]}
                                {userData.lastName[0]}
                              </div>
                              <div>
                                <p className='font-medium text-gray-900 dark:text-white'>
                                  {userData.firstName} {userData.lastName}
                                </p>
                                <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                                  <Mail className='w-3 h-3 mr-1' />
                                  {userData.email}
                                </div>
                                {userData.phoneNumber && (
                                  <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                                    <Phone className='w-3 h-3 mr-1' />
                                    {userData.phoneNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(userData.role)}</TableCell>
                          <TableCell>
                            {getStatusBadge(userData.status)}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-1'>
                              {userData.emailVerified ? (
                                <CheckCircle
                                  className='w-4 h-4 text-green-500'
                                  aria-label='Email verified'
                                />
                              ) : (
                                <AlertTriangle
                                  className='w-4 h-4 text-yellow-500'
                                  aria-label='Email not verified'
                                />
                              )}
                              {userData.phoneVerified ? (
                                <CheckCircle
                                  className='w-4 h-4 text-green-500'
                                  aria-label='Phone verified'
                                />
                              ) : (
                                <XCircle
                                  className='w-4 h-4 text-gray-400'
                                  aria-label='Phone not verified'
                                />
                              )}
                              {userData.twoFactorEnabled && (
                                <Shield
                                  className='w-4 h-4 text-blue-500'
                                  aria-label='2FA enabled'
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                              <Calendar className='w-3 h-3 mr-1' />
                              {new Date(
                                userData.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                              {userData.lastLoginAt
                                ? new Date(
                                    userData.lastLoginAt
                                  ).toLocaleDateString()
                                : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end space-x-1'>
                              <Button variant='ghost' size='sm' asChild>
                                <Link href={`/admin/users/${userData.id}`}>
                                  <Eye className='w-4 h-4' />
                                </Link>
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setSelectedUser(userData);
                                  setNewUserStatus(userData.status);
                                  setShowStatusDialog(true);
                                }}
                                className={
                                  userData.status === 'SUSPENDED'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                }
                              >
                                {userData.status === 'SUSPENDED' ? (
                                  <CheckCircle
                                    className='w-4 h-4'
                                    aria-label='Activate user'
                                  />
                                ) : (
                                  <Ban
                                    className='w-4 h-4'
                                    aria-label='Suspend user'
                                  />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {usersData.totalPages > 1 && (
                  <div className='flex items-center justify-between mt-6'>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>
                      Showing {(usersData.page - 1) * usersData.pageSize + 1} to{' '}
                      {Math.min(
                        usersData.page * usersData.pageSize,
                        usersData.total
                      )}{' '}
                      of {usersData.total} users
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setCurrentPage(prev => Math.max(1, prev - 1))
                        }
                        disabled={!usersData.hasPrevious}
                      >
                        <ChevronLeft className='w-4 h-4' />
                      </Button>
                      <span className='text-sm font-medium'>
                        Page {usersData.page} of {usersData.totalPages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!usersData.hasNext}
                      >
                        <ChevronRight className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className='text-center py-12'>
                <UsersIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  No users found
                </h3>
                <p className='text-gray-500 dark:text-gray-400'>
                  {searchTerm || (roleFilter !== 'ALL_ROLES') || (statusFilter !== 'ALL_STATUS')
                    ? 'Try adjusting your search or filters'
                    : 'No users are registered yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Status</DialogTitle>
            <DialogDescription>
              Change the status of &quot;{selectedUser?.firstName}{' '}
              {selectedUser?.lastName}&quot;. This will affect their ability to
              access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Select
              value={newUserStatus}
              onValueChange={value => setNewUserStatus(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ACTIVE'>Active - Full access</SelectItem>
                <SelectItem value='SUSPENDED'>Suspended - No access</SelectItem>
                <SelectItem value='INACTIVE'>
                  Inactive - Limited access
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowStatusDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUserStatusChange}
              disabled={processing}
              variant={
                newUserStatus === 'SUSPENDED' ? 'destructive' : 'default'
              }
            >
              {processing ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
