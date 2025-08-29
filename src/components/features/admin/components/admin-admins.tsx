'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Edit,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy: string;
}

export function AdminAdminsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    role: 'ALL',
    status: 'ALL',
    search: '',
  });

  // Mock data
  const mockAdmins: AdminUser[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@lottery.com',
      role: 'SUPER_ADMIN',
      permissions: ['ALL'],
      isActive: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      createdBy: 'system',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@lottery.com',
      role: 'ADMIN',
      permissions: ['USERS', 'GAMES', 'VENDORS'],
      isActive: true,
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      createdBy: 'john.doe@lottery.com',
    },
  ];

  // Auth protection
  useEffect(() => {
    if (!loading && (!user || user?.role !== 'ADMIN')) {
      router.push('/en/auth/login');
    }
  }, [user, loading, router]);

  // Load admins
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setAdmins(mockAdmins);
      } catch (error) {
        console.error('Error loading admins:', error);
      } finally {
        setPageLoading(false);
      }
    };

    if (user && user.role === 'ADMIN') {
      loadAdmins();
    }
  }, [user]);

  // Filter admins
  const filteredAdmins = admins.filter(admin => {
    if (filters.role !== 'ALL' && admin.role !== filters.role) return false;
    if (filters.status !== 'ALL' && admin.isActive !== (filters.status === 'ACTIVE')) return false;
    if (filters.search && !admin.firstName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !admin.lastName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !admin.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage system administrators and their permissions
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <Select
                value={filters.role}
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search admins..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Admins List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <Card key={admin.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {admin.firstName} {admin.lastName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(admin.role)}>
                    {admin.role.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(admin.isActive)}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {admin.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Last login: {admin.lastLogin ? admin.lastLogin.toLocaleDateString() : 'Never'}</span>
                  <span>Created: {admin.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={admin.isActive
                    ? 'text-red-600 border-red-600 hover:bg-red-50'
                    : 'text-green-600 border-green-600 hover:bg-green-50'
                  }
                >
                  {admin.isActive ? 'Deactivate' : 'Activate'}
                </Button>

                {admin.role !== 'SUPER_ADMIN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Create Admin Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-400">
                Admin creation form will be implemented here.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
