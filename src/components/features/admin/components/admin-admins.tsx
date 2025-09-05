'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Eye, EyeOff, Plus, Search, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as z from 'zod';

import { ADMIN_PERMISSIONS } from '../api/data';
import { AdminUser } from '../api/type';
import { useAdminUsers } from '../api/queries';
import {
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
} from '../api/mutations';

// Zod schema for form validation with security constraints
const createAdminSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters')
      .transform(val => val.trim().replace(/[<>"]/g, '')), // Sanitize HTML
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters')
      .transform(val => val.trim().replace(/[<>"]/g, '')), // Sanitize HTML
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .max(254, 'Email address is too long')
      .transform(val =>
        val
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9@._-]/g, '')
      ), // Sanitize email
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number and special character'
      ),
    confirmPassword: z.string(),
    role: z.enum(['ADMIN', 'SUPER_ADMIN']),
    permissions: z.array(z.string()).default([]),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .optional()
      .transform(val => (val ? val.trim().replace(/[<>"]/g, '') : '')), // Sanitize HTML
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    data => {
      // Require permissions for ADMIN role
      return data.role === 'SUPER_ADMIN' || data.permissions.length > 0;
    },
    {
      message: 'At least one permission is required for Admin role',
      path: ['permissions'],
    }
  );

type CreateAdminForm = z.infer<typeof createAdminSchema>;

export function AdminAdminsPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [filters, setFilters] = useState({
    role: 'ALL',
    status: 'ALL',
    search: '',
  });

  // Fetch admins with TanStack Query
  const {
    data: admins = [],
    isLoading: adminsLoading,
    error,
  } = useAdminUsers();

  // React Hook Form with Zod validation
  const form = useForm({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'ADMIN' as const,
      permissions: [] as string[],
      description: '',
    },
  });

  // Mutation hooks
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();

  // Handle form submission with react-hook-form
  const onSubmit = form.handleSubmit(async (data: CreateAdminForm) => {
    try {
      createAdmin.mutate(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          permissions: data.role === 'SUPER_ADMIN' ? ['ALL'] : data.permissions,
          isActive: true,
          createdBy: user?.id || '',
        },
        {
          onSuccess: () => {
            toast.success(
              t('admin.adminCreateSuccess', 'Admin created successfully')
            );
            setShowCreateModal(false);
            form.reset();
            setShowPassword(false);
            setShowConfirmPassword(false);
          },
          onError: (error: any) => {
            toast.error(
              error.message ||
                t('admin.adminCreateError', 'Failed to create admin')
            );
          },
        }
      );
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  });

  // Handle permission toggle with validation
  const togglePermission = (permissionId: string) => {
    // Validate permission ID to prevent injection
    const validPermissions = ADMIN_PERMISSIONS.map(p => p.id);
    if (!validPermissions.includes(permissionId)) {
      console.warn('Invalid permission ID:', permissionId);
      return;
    }

    const currentPermissions = form.getValues('permissions');
    const newPermissions = currentPermissions?.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...(currentPermissions || []), permissionId];

    form.setValue('permissions', newPermissions);
  };

  // Auth protection
  useEffect(() => {
    if (!loading && (!user || user?.role !== 'ADMIN')) {
      router.push('/en/auth/login');
    }
  }, [user, loading, router]);

  // Filter admins
  const filteredAdmins = admins.filter(admin => {
    if (filters.role !== 'ALL' && admin.role !== filters.role) return false;
    if (
      filters.status !== 'ALL' &&
      admin.isActive !== (filters.status === 'ACTIVE')
    )
      return false;
    if (
      filters.search &&
      !admin.firstName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !admin.lastName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !admin.email.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  // Handle admin actions
  const handleToggleStatus = (admin: AdminUser) => {
    if (admin.role === 'SUPER_ADMIN') {
      toast.error(
        t('admin.cannotModifySuperAdmin', 'Cannot modify Super Admin account')
      );
      return;
    }

    updateAdmin.mutate(
      {
        id: admin.id,
        isActive: !admin.isActive,
      },
      {
        onSuccess: () => {
          toast.success(
            t(
              admin.isActive
                ? 'admin.adminDeactivated'
                : 'admin.adminActivated',
              admin.isActive
                ? 'Admin deactivated successfully'
                : 'Admin activated successfully'
            )
          );
        },
        onError: (error: any) => {
          toast.error(
            error.message ||
              t('admin.adminUpdateError', 'Failed to update admin')
          );
        },
      }
    );
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    if (admin.role === 'SUPER_ADMIN') {
      toast.error(
        t('admin.cannotDeleteSuperAdmin', 'Cannot delete Super Admin account')
      );
      return;
    }

    if (
      window.confirm(
        t(
          'admin.confirmDeleteAdmin',
          'Are you sure you want to delete this admin? This action cannot be undone.'
        )
      )
    ) {
      deleteAdmin.mutate(admin.id, {
        onSuccess: () => {
          toast.success(t('admin.adminDeleted', 'Admin deleted successfully'));
        },
        onError: (error: any) => {
          toast.error(
            error.message ||
              t('admin.adminDeleteError', 'Failed to delete admin')
          );
        },
      });
    }
  };

  // Loading state
  if (loading || adminsLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500'></div>
      </div>
    );
  }

  // Error state with Next.js router refresh
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            {t('admin.errorLoadingAdmins', 'Error Loading Admins')}
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            {t('admin.errorMessage', 'Please try refreshing the page')}
          </p>
          <Button onClick={() => router.refresh()} variant='outline'>
            {t('common.refresh', 'Refresh')}
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || user?.role !== 'ADMIN') {
    return null;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                {t('admin.adminManagement')}
              </h1>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                {t('admin.manageAdminsDescription')}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className='bg-orange-500 hover:bg-orange-600 text-white'
            >
              <Plus className='w-4 h-4 mr-2' />
              {t('admin.addAdmin')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className='mb-6 p-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('common.role')}
              </label>
              <Select
                value={filters.role}
                onValueChange={value =>
                  setFilters(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>{t('admin.allRoles')}</SelectItem>
                  <SelectItem value='SUPER_ADMIN'>
                    {t('admin.superAdmin')}
                  </SelectItem>
                  <SelectItem value='ADMIN'>{t('admin.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('common.status')}
              </label>
              <Select
                value={filters.status}
                onValueChange={value =>
                  setFilters(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>{t('admin.allStatuses')}</SelectItem>
                  <SelectItem value='ACTIVE'>{t('common.active')}</SelectItem>
                  <SelectItem value='INACTIVE'>
                    {t('common.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('common.search')}
              </label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  type='text'
                  placeholder={t('admin.searchAdmins')}
                  value={filters.search}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                  className='pl-10'
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Admins List */}
        {filteredAdmins.length === 0 ? (
          <Card className='p-12 text-center'>
            <div className='text-gray-400 mb-4'>
              <Users className='w-16 h-16 mx-auto' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              {t('admin.noAdminsFound', 'No admins found')}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              {filters.search ||
              filters.role !== 'ALL' ||
              filters.status !== 'ALL'
                ? t('admin.tryDifferentFilter', 'Try adjusting your filters')
                : t(
                    'admin.createFirstAdmin',
                    'Create your first admin to get started'
                  )}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className='bg-orange-500 hover:bg-orange-600 text-white'
            >
              <Plus className='w-4 h-4 mr-2' />
              {t('admin.addAdmin', 'Add Admin')}
            </Button>
          </Card>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {filteredAdmins.map(admin => (
              <Card
                key={admin.id}
                className='p-6 hover:shadow-lg transition-shadow'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center'>
                      <Users className='w-6 h-6 text-orange-600 dark:text-orange-400' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <p className='text-gray-600 dark:text-gray-400'>
                        {admin.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge className={getRoleColor(admin.role)}>
                      {admin.role.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(admin.isActive)}>
                      {admin.isActive
                        ? t('common.active')
                        : t('common.inactive')}
                    </Badge>
                  </div>
                </div>

                <div className='space-y-3 mb-4'>
                  <div>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {t('admin.permissions')}:
                    </span>
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {admin.permissions.map(permission => (
                        <span
                          key={permission}
                          className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded'
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                    <span>
                      {t('admin.lastLogin')}:{' '}
                      {admin.lastLogin
                        ? admin.lastLogin.toLocaleDateString()
                        : t('admin.never')}
                    </span>
                    <span>
                      {t('admin.created')}:{' '}
                      {admin.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-blue-600 border-blue-600 hover:bg-blue-50'
                    disabled={admin.role === 'SUPER_ADMIN'}
                  >
                    <Edit className='w-4 h-4 mr-1' />
                    {t('common.edit', 'Edit')}
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleToggleStatus(admin)}
                    disabled={
                      updateAdmin.isPending || admin.role === 'SUPER_ADMIN'
                    }
                    className={
                      admin.isActive
                        ? 'text-red-600 border-red-600 hover:bg-red-50'
                        : 'text-green-600 border-green-600 hover:bg-green-50'
                    }
                  >
                    {updateAdmin.isPending ? (
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1'></div>
                    ) : null}
                    {admin.isActive
                      ? t('admin.deactivate', 'Deactivate')
                      : t('admin.activate', 'Activate')}
                  </Button>

                  {admin.role !== 'SUPER_ADMIN' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteAdmin(admin)}
                      disabled={deleteAdmin.isPending}
                      className='text-red-600 border-red-600 hover:bg-red-50'
                    >
                      {deleteAdmin.isPending ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1'></div>
                      ) : (
                        <Trash2 className='w-4 h-4 mr-1' />
                      )}
                      {t('common.delete', 'Delete')}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Admin Modal */}
        <Dialog
          open={showCreateModal}
          onOpenChange={open => {
            if (!open) {
              form.reset();
              setShowPassword(false);
              setShowConfirmPassword(false);
            }
            setShowCreateModal(open);
          }}
        >
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{t('admin.addNewAdmin')}</DialogTitle>
              <DialogDescription>
                Create a new administrator account with specified permissions
                and access levels.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={onSubmit} className='space-y-6 py-4'>
                {/* Personal Information */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Enter first name'
                            maxLength={50}
                            autoComplete='given-name'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Enter last name'
                            maxLength={50}
                            autoComplete='family-name'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='email'
                          placeholder='Enter email address'
                          maxLength={254}
                          autoComplete='email'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Fields */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder='Enter secure password'
                              maxLength={128}
                              autoComplete='new-password'
                              className='pr-10'
                            />
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className='h-4 w-4 text-gray-500' />
                              ) : (
                                <Eye className='h-4 w-4 text-gray-500' />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Must be 8+ chars with uppercase, lowercase, number &
                          special char
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder='Confirm your password'
                              maxLength={128}
                              autoComplete='new-password'
                              className='pr-10'
                            />
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className='h-4 w-4 text-gray-500' />
                              ) : (
                                <Eye className='h-4 w-4 text-gray-500' />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select
                        onValueChange={value => {
                          field.onChange(value);
                          form.setValue('permissions', []);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select role' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='ADMIN'>Admin</SelectItem>
                          <SelectItem value='SUPER_ADMIN'>
                            Super Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permissions (only for ADMIN role) */}
                {form.watch('role') === 'ADMIN' && (
                  <FormField
                    control={form.control}
                    name='permissions'
                    render={() => (
                      <FormItem>
                        <FormLabel>Permissions *</FormLabel>
                        <div className='mt-2 space-y-3'>
                          {ADMIN_PERMISSIONS.map(permission => (
                            <FormField
                              key={permission.id}
                              control={form.control}
                              name='permissions'
                              render={({ field }) => {
                                return (
                                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          permission.id
                                        )}
                                        onCheckedChange={() =>
                                          togglePermission(permission.id)
                                        }
                                      />
                                    </FormControl>
                                    <div className='space-y-1 leading-none'>
                                      <FormLabel className='font-medium cursor-pointer'>
                                        {permission.label}
                                      </FormLabel>
                                      <FormDescription className='text-sm text-gray-500'>
                                        {permission.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Super Admin Notice */}
                {form.watch('role') === 'SUPER_ADMIN' && (
                  <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
                    <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                      Super Admin role grants full system access. Use with
                      caution.
                    </p>
                  </div>
                )}

                {/* Description */}
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='Optional description or notes about this admin'
                          maxLength={500}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription className='flex justify-between'>
                        <span></span>
                        <span className='text-xs text-gray-500'>
                          {field.value?.length || 0}/500
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowCreateModal(false)}
                    disabled={createAdmin.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={createAdmin.isPending}
                    className='bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    {createAdmin.isPending ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                        Creating...
                      </>
                    ) : (
                      'Create Admin'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
