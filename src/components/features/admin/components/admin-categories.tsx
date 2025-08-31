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
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  Edit2,
  Gamepad2,
  Grid3X3,
  Plus,
  Settings,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';


export function AdminCategoriesPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // TanStack Query hooks
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#FF5722',
    icon: 'grid',
    isActive: true,
    sortOrder: 0,
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
    if (!formData.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const categoryData: CreateCategoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      icon: formData.icon,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
    };

    createCategoryMutation.mutate(categoryData, {
      onSuccess: () => {
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          color: '#FF5722',
          icon: 'grid',
          isActive: true,
          sortOrder: 0,
        });
      },
    });
  };

  const handleEdit = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updateData: UpdateCategoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      icon: formData.icon,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
    };

    updateCategoryMutation.mutate(
      { id: selectedCategory.id, data: updateData },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedCategory(null);
        },
      }
    );
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    deleteCategoryMutation.mutate(categoryId);
  };

  const handleToggleActive = async (category: any) => {
    updateCategoryMutation.mutate({
      id: category.id,
      data: { isActive: !category.isActive },
    });
  };

  const openEditModal = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color || '#FF5722',
      icon: category.icon || 'grid',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setShowEditModal(true);
  };

  if (!mounted) {
    return null;
  }

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center'>
                <Grid3X3 className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
                  {t('admin.categoriesManagement')}
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  {t('admin.manageCategoriesDescription')}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <Button 
                onClick={() => router.push('/admin/create-game')}
                variant='outline'
                className='flex items-center space-x-2'
              >
                <Gamepad2 className='w-4 h-4' />
                <span>{t('admin.createGame')}</span>
              </Button>
              
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button className='flex items-center space-x-2'>
                    <Plus className='w-4 h-4' />
                    <span>{t('admin.createCategory')}</span>
                  </Button>
                </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>{t('admin.createNewCategory')}</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='name'>Category Name</Label>
                      <Input
                        id='name'
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder='Category name'
                      />
                    </div>
                    <div>
                      <Label htmlFor='icon'>Icon</Label>
                      <Input
                        id='icon'
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder='Icon name'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='description'>Description</Label>
                      <Textarea
                        id='description'
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder='Category description'
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor='color'>Color</Label>
                      <Input
                        id='color'
                        type='color'
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='sortOrder'>Sort Order</Label>
                      <Input
                        id='sortOrder'
                        type='number'
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                        placeholder='0'
                      />
                    </div>
                    <div className='flex items-center space-x-2 pt-6'>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <div className='flex justify-end space-x-2 pt-4'>
                    <Button variant='outline' onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={createCategoryMutation.isPending}>
                      {createCategoryMutation.isPending ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-300 mr-2'></div>
                      ) : null}
                      {createCategoryMutation.isPending ? t('common.creating') : t('admin.createCategory')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {categories.length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.totalCategories')}
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {categories.filter(cat => cat.isActive).length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.activeCategories')}
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {categories.filter(cat => !cat.isActive).length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.inactiveCategories')}
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {categories.reduce((sum, cat) => sum + (cat.gamesCount || 0), 0)}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('admin.totalGames')}
              </div>
            </Card>
          </div>
        </div>

        {/* Categories List */}
        {loadingCategories ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>{t('admin.loadingCategories')}</p>
          </div>
        ) : categories.length === 0 ? (
          <Card className='p-8 text-center'>
            <Grid3X3 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No categories found
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Create your first category to organize games.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className='w-4 h-4 mr-2' />
              Create Category
            </Button>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {categories.map((category) => (
              <Card key={category.id} className='p-6 relative'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center'>
                    <Grid3X3 className='w-5 h-5 text-white' />
                  </div>
                  <div className='flex items-center space-x-1'>
                    {category.isActive ? (
                      <Badge className='bg-green-500 text-white'>Active</Badge>
                    ) : (
                      <Badge className='bg-red-500 text-white'>Inactive</Badge>
                    )}
                  </div>
                </div>

                <div className='mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
                    {category.name}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {category.description}
                  </p>
                </div>

                <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                  <span>Order: {category.sortOrder}</span>
                  <div 
                    className='w-4 h-4 rounded border'
                    style={{ backgroundColor: category.color }}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => openEditModal(category)}
                    >
                      <Edit2 className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleToggleActive(category)}
                      disabled={updateCategoryMutation.isPending}
                    >
                      {updateCategoryMutation.isPending ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500'></div>
                      ) : (
                        <Settings className='w-4 h-4' />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteCategoryMutation.isPending}
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
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editName'>Category Name</Label>
                  <Input
                    id='editName'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Category name'
                  />
                </div>
                <div>
                  <Label htmlFor='editIcon'>Icon</Label>
                  <Input
                    id='editIcon'
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder='Icon name'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editDescription'>Description</Label>
                  <Textarea
                    id='editDescription'
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder='Category description'
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor='editColor'>Color</Label>
                  <Input
                    id='editColor'
                    type='color'
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editSortOrder'>Sort Order</Label>
                  <Input
                    id='editSortOrder'
                    type='number'
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder='0'
                  />
                </div>
                <div className='flex items-center space-x-2 pt-6'>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className='flex justify-end space-x-2 pt-4'>
                <Button variant='outline' onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={updateCategoryMutation.isPending}>
                  {updateCategoryMutation.isPending ? (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  ) : (
                    'Update Category'
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