'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useRoles, useVendors, useAdminUsers } from '../api/queries';
import { useCreateRole, useUpdateRole, useDeleteRole } from '../api/mutations';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Crown,
  Edit2,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DEFAULT_PERMISSIONS } from '../api/data';
import { Permission, Role } from '../api/type';




export function AdminRolesPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // TanStack Query hooks for real data
  const { data: roles = [], isLoading: loadingRoles, error } = useRoles();
  const { data: vendors = [] } = useVendors();
  const { data: admins = [] } = useAdminUsers();
  
  // Mutation hooks
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Calculate user counts for roles
  const rolesWithStats = roles.map(role => {
    let userCount = 0;
    switch (role.name) {
      case 'VENDOR':
        userCount = vendors.length;
        break;
      case 'ADMIN':
        userCount = admins.length;
        break;
      default:
        userCount = role.userCount || 0;
    }
    return { ...role, userCount };
  });
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);


  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.displayName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setProcessingAction('create');
      
      const newRole = {
        name: formData.name.toUpperCase().replace(/\s+/g, '_'),
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
        isActive: formData.isActive,
        isSystem: false,
        createdBy: user!.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      createRole.mutate(newRole, {
        onSuccess: () => {
          toast.success('Role created successfully');
          setShowCreateModal(false);
          resetForm();
        },
        onError: (error: any) => {
          console.error('Error creating role:', error);
          toast.error('Failed to create role');
        }
      });
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleEdit = async () => {
    if (!selectedRole || !formData.name.trim() || !formData.displayName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedRole.isSystem) {
      toast.error('System roles cannot be modified');
      return;
    }

    try {
      setProcessingAction('edit');
      
      const updatedRole = {
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
        isActive: formData.isActive,
        updatedAt: Date.now(),
      };

      updateRole.mutate({ id: selectedRole.id, ...updatedRole }, {
        onSuccess: () => {
          toast.success('Role updated successfully');
          setShowEditModal(false);
          setSelectedRole(null);
        },
        onError: (error: any) => {
          console.error('Error updating role:', error);
          toast.error('Failed to update role');
        }
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDelete = async (roleId: string) => {
    const role = rolesWithStats.find(r => r.id === roleId);
    if (!role) return;

    if (role.isSystem) {
      toast.error('System roles cannot be deleted');
      return;
    }

    if (role.userCount > 0) {
      toast.error('Cannot delete role that is assigned to users');
      return;
    }

    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingAction(roleId);
      deleteRole.mutate(roleId, {
        onSuccess: () => {
          toast.success('Role deleted successfully');
        },
        onError: (error: any) => {
          console.error('Error deleting role:', error);
          toast.error('Failed to delete role');
        }
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleToggleActive = async (role: Role) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deactivated');
      return;
    }

    try {
      setProcessingAction(role.id);
      updateRole.mutate({ 
        id: role.id, 
        isActive: !role.isActive 
      }, {
        onSuccess: () => {
          toast.success(`Role ${!role.isActive ? 'activated' : 'deactivated'} successfully`);
        },
        onError: (error: any) => {
          console.error('Error toggling role status:', error);
          toast.error('Failed to update role status');
        }
      });
    } catch (error) {
      console.error('Error toggling role status:', error);
      toast.error('Failed to update role status');
    } finally {
      setProcessingAction(null);
    }
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
      isActive: true,
    });
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN': return <Crown className='w-5 h-5 text-yellow-500' />;
      case 'VENDOR': return <ShieldCheck className='w-5 h-5 text-blue-500' />;
      case 'USER': return <UserCheck className='w-5 h-5 text-green-500' />;
      default: return <Shield className='w-5 h-5 text-gray-500' />;
    }
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
    DEFAULT_PERMISSIONS.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  if (!mounted) {
    return null;
  }

  if (loading || loadingRoles || !user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Error Loading Roles</h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()} variant='outline'>
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0'>
            <div className='flex items-center space-x-3 sm:space-x-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center'>
                <Shield className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
                  Roles & Permissions
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  Manage user roles and access permissions
                </p>
              </div>
            </div>
            
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className='flex items-center space-x-2'>
                  <Plus className='w-4 h-4' />
                  <span>Create Role</span>
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='name'>Role Name</Label>
                      <Input
                        id='name'
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder='CUSTOM_ROLE'
                      />
                    </div>
                    <div>
                      <Label htmlFor='displayName'>Display Name</Label>
                      <Input
                        id='displayName'
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        placeholder='Custom Role'
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder='Role description and purpose'
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Permissions</Label>
                    <div className='mt-4 space-y-6'>
                      {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                        <div key={category} className='border rounded-lg p-4'>
                          <h4 className='font-medium text-gray-900 dark:text-white mb-3'>{category}</h4>
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            {permissions.map(permission => (
                              <div key={permission.id} className='flex items-start space-x-3'>
                                <Switch
                                  checked={formData.permissions.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        permissions: [...formData.permissions, permission.id]
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        permissions: formData.permissions.filter(p => p !== permission.id)
                                      });
                                    }
                                  }}
                                />
                                <div className='flex-1'>
                                  <Label className='text-sm font-medium'>{permission.name}</Label>
                                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className='flex items-center space-x-2'>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label>Active</Label>
                  </div>
                  
                  <div className='flex justify-end space-x-2 pt-4'>
                    <Button variant='outline' onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={processingAction === 'create'}>
                      {processingAction === 'create' ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      ) : (
                        'Create Role'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {rolesWithStats.length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.totalRoles', 'Total Roles')}
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {rolesWithStats.filter(role => role.isActive).length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.activeRoles', 'Active Roles')}
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {rolesWithStats.filter(role => role.isSystem).length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.systemRoles', 'System Roles')}
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {rolesWithStats.reduce((sum, role) => sum + role.userCount, 0)}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.totalUsers', 'Total Users')}
              </div>
            </Card>
          </div>
        </div>

        {/* Roles List */}
        {loadingRoles ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>Loading roles...</p>
          </div>
        ) : rolesWithStats.length === 0 ? (
          <Card className='p-8 text-center'>
            <Shield className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No roles found
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Create your first custom role to manage user permissions.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className='w-4 h-4 mr-2' />
              Create Role
            </Button>
          </Card>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {rolesWithStats.map((role) => (
              <Card key={role.id} className='p-6 relative'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    {getRoleIcon(role.name)}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {role.displayName}
                      </h3>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {role.name}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {role.isActive ? (
                      <Badge className='bg-green-500 text-white'>Active</Badge>
                    ) : (
                      <Badge className='bg-red-500 text-white'>Inactive</Badge>
                    )}
                    {role.isSystem && (
                      <Badge variant='outline' className='border-blue-500 text-blue-600 dark:text-blue-400'>
                        System
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className='mb-4'>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {role.description}
                  </p>
                </div>
                
                <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                  <span className='flex items-center space-x-1'>
                    <Users className='w-4 h-4' />
                    <span>{role.userCount} users</span>
                  </span>
                  <span className='flex items-center space-x-1'>
                    <ShieldAlert className='w-4 h-4' />
                    <span>{role.permissions.length} permissions</span>
                  </span>
                </div>
                
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => openEditModal(role)}
                      disabled={role.isSystem}
                    >
                      <Edit2 className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleToggleActive(role)}
                      disabled={processingAction === role.id || role.isSystem}
                    >
                      {processingAction === role.id ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500'></div>
                      ) : (
                        <Shield className='w-4 h-4' />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDelete(role.id)}
                    disabled={processingAction === role.id || role.isSystem || role.userCount > 0}
                    className='text-red-600 border-red-300 hover:bg-red-50'
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editName'>Role Name</Label>
                  <Input
                    id='editName'
                    value={formData.name}
                    disabled={selectedRole?.isSystem}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder='CUSTOM_ROLE'
                  />
                </div>
                <div>
                  <Label htmlFor='editDisplayName'>Display Name</Label>
                  <Input
                    id='editDisplayName'
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder='Custom Role'
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor='editDescription'>Description</Label>
                <Textarea
                  id='editDescription'
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder='Role description and purpose'
                  rows={3}
                />
              </div>

              {!selectedRole?.isSystem && (
                <div>
                  <Label>Permissions</Label>
                  <div className='mt-4 space-y-6'>
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className='border rounded-lg p-4'>
                        <h4 className='font-medium text-gray-900 dark:text-white mb-3'>{category}</h4>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                          {permissions.map(permission => (
                            <div key={permission.id} className='flex items-start space-x-3'>
                              <Switch
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData({
                                      ...formData,
                                      permissions: [...formData.permissions, permission.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      permissions: formData.permissions.filter(p => p !== permission.id)
                                    });
                                  }
                                }}
                              />
                              <div className='flex-1'>
                                <Label className='text-sm font-medium'>{permission.name}</Label>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className='flex items-center space-x-2'>
                <Switch
                  checked={formData.isActive}
                  disabled={selectedRole?.isSystem}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label>Active</Label>
              </div>
              
              <div className='flex justify-end space-x-2 pt-4'>
                <Button variant='outline' onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={processingAction === 'edit'}>
                  {processingAction === 'edit' ? (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  ) : (
                    'Update Role'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}