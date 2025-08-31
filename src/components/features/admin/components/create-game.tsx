'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  productService,
  realtimeService,
} from '@/lib/firebase/services';
import {
  useCategories,
  useCreateGame,
} from '@/hooks/useApi';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Gamepad2,
  Menu,
  Package,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const createGameSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters'),
    productId: z.string().min(1, 'Please select a product'),
    categoryId: z.string().min(1, 'Please select a category'),
    ticketPrice: z.number().min(0.01, 'Ticket price must be greater than 0'),
    maxParticipants: z.number().min(1, 'Must have at least 1 participant'),
    startDate: z.string().min(1, 'Please select a start date'),
    endDate: z.string().min(1, 'Please select an end date'),
  })
  .refine(
    data => {
      if (!data.startDate || !data.endDate) return true;
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

type CreateGameFormData = z.infer<typeof createGameSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export function CreateGamePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
  });

  // TanStack Query hooks
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createGameMutation = useCreateGame();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateGameFormData>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      ticketPrice: 1.0,
      maxParticipants: 100,
    },
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await productService.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
    };

    if (user?.role === 'ADMIN') {
      fetchProducts();
    }
  }, [user]);

  const handleAddProduct = async () => {
    if (!newProductForm.name.trim() || newProductForm.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        ...newProductForm,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const productId = await productService.createProduct(productData);
      const newProduct = { id: productId, ...productData };
      setProducts(prev => [newProduct, ...prev]);
      setShowAddProductModal(false);
      setNewProductForm({ name: '', description: '', price: 0, image: '' });
      toast.success('Product added successfully');
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const onSubmit = async (data: CreateGameFormData) => {
    if (!user) return;

    const selectedCategory = categories.find(
      cat => cat.id === data.categoryId
    );
    const gameData = {
      ...data,
      createdBy: user.id,
      currentParticipants: 0,
      isPromoted: false,
      viewCount: 0,
      status: 'DRAFT' as const,
      startDate: data.startDate
        ? (() => {
            const date = new Date(data.startDate);
            return isNaN(date.getTime()) ? Date.now() : date.getTime();
          })()
        : Date.now(),
      endDate: data.endDate
        ? (() => {
            const date = new Date(data.endDate);
            return isNaN(date.getTime())
              ? Date.now() + 7 * 24 * 60 * 60 * 1000
              : date.getTime();
          })()
        : Date.now() + 7 * 24 * 60 * 60 * 1000,
      participants: 0,
      tickets: [],
      type: 'daily' as const,
      currency: 'USD',
      isActive: false,
      rules: [],
      images: [],
      drawDate: data.endDate
        ? new Date(data.endDate).getTime()
        : Date.now() + 7 * 24 * 60 * 60 * 1000,
      totalPrizePool: 0,
      totalTickets: 0,
      totalTicketsSold: 0,
      prizes: [],
      category: selectedCategory || {
        id: data.categoryId,
        name: 'Standard',
        description: 'Standard lottery game',
        icon: '🎲',
        color: '#FF5722',
        isActive: true,
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    createGameMutation.mutate(gameData, {
      onSuccess: async (gameId) => {
        // Initialize real-time counter
        await realtimeService.updateGameCounter(gameId, {
          participants: 0,
          status: 'DRAFT',
          maxParticipants: data.maxParticipants,
          lastUpdate: Date.now(),
        });
        router.push('/admin');
      },
    });
  };

  if (loading || categoriesLoading) {
    return (
      <div className='min-h-screen bg-lottery-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lottery-500'></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className='min-h-screen bg-lottery-900'>
      {/* Mobile Navigation */}
      <div className='lg:hidden'>
        <div className='bg-lottery-800/50 backdrop-blur-sm border-b border-lottery-700/30 p-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-bold text-white'>{t('admin.createGame')}</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='text-lottery-300 hover:text-white transition-colors'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className='bg-lottery-800/50 backdrop-blur-sm border-b border-lottery-700/30 p-4'>
            <nav className='space-y-2'>
              <Link
                href='/admin'
                className='block text-lottery-300 hover:text-white transition-colors py-2'
              >
                ← Back to Admin
              </Link>
              <Link
                href='/dashboard'
                className='block text-lottery-300 hover:text-white transition-colors py-2'
              >
                Dashboard
              </Link>
              <Link
                href='/'
                className='block text-lottery-300 hover:text-white transition-colors py-2'
              >
                Home
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className='hidden lg:block bg-lottery-800/50 backdrop-blur-sm border-b border-lottery-700/30'>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-white'>Create New Game</h1>
              <p className='text-lottery-300 mt-1'>
                Launch a new marketing lottery
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <Link href='/admin'>
                <Button
                  variant='outline'
                  className='border-lottery-600 text-lottery-300 hover:bg-lottery-700'
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back to Admin
                </Button>
              </Link>
              <Link href='/dashboard'>
                <Button
                  variant='outline'
                  className='border-lottery-600 text-lottery-300 hover:bg-lottery-700'
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-8 lg:px-6'>
        <div className='bg-lottery-800/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-lottery-700/30'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <Gamepad2 className='w-5 h-5 mr-2 text-lottery-500' />
                  Basic Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label
                      htmlFor='title'
                      className='block text-sm font-medium text-lottery-200 mb-2'
                    >
                      Game Title *
                    </label>
                    <input
                      {...register('title')}
                      type='text'
                      id='title'
                      className='w-full px-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                      placeholder='e.g., Weekend Special Lottery'
                    />
                    {errors.title && (
                      <p className='mt-2 text-sm text-red-400'>
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='categoryId'
                      className='block text-sm font-medium text-lottery-200 mb-2'
                    >
                      Category *
                    </label>
                    <select
                      {...register('categoryId')}
                      id='categoryId'
                      className='w-full px-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                    >
                      <option value=''>Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className='mt-2 text-sm text-red-400'>
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className='mt-6'>
                  <label
                    htmlFor='description'
                    className='block text-sm font-medium text-lottery-200 mb-2'
                  >
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    id='description'
                    rows={4}
                    className='w-full px-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                    placeholder='Describe your lottery game and what participants can win...'
                  />
                  {errors.description && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <Package className='w-5 h-5 mr-2 text-lottery-500' />
                  Product Selection
                </h3>

                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <label
                      htmlFor='productId'
                      className='block text-sm font-medium text-lottery-200'
                    >
                      Select Product *
                    </label>
                    <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
                      <DialogTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='text-xs border-lottery-600 text-lottery-300 hover:bg-lottery-700'
                        >
                          <Plus className='w-3 h-3 mr-1' />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='bg-lottery-800 border-lottery-700'>
                        <DialogHeader>
                          <DialogTitle className='text-white'>Add New Product</DialogTitle>
                        </DialogHeader>
                        <div className='space-y-4'>
                          <div>
                            <Label htmlFor='productName' className='text-lottery-200'>Product Name *</Label>
                            <Input
                              id='productName'
                              value={newProductForm.name}
                              onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                              placeholder='Product name'
                              className='bg-lottery-700/50 border-lottery-600/50 text-white'
                            />
                          </div>
                          <div>
                            <Label htmlFor='productDescription' className='text-lottery-200'>Description</Label>
                            <Textarea
                              id='productDescription'
                              value={newProductForm.description}
                              onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                              placeholder='Product description'
                              className='bg-lottery-700/50 border-lottery-600/50 text-white'
                            />
                          </div>
                          <div>
                            <Label htmlFor='productPrice' className='text-lottery-200'>Price *</Label>
                            <Input
                              id='productPrice'
                              type='number'
                              step='0.01'
                              min='0'
                              value={newProductForm.price}
                              onChange={(e) => setNewProductForm({ ...newProductForm, price: parseFloat(e.target.value) || 0 })}
                              placeholder='0.00'
                              className='bg-lottery-700/50 border-lottery-600/50 text-white'
                            />
                          </div>
                          <div>
                            <Label htmlFor='productImage' className='text-lottery-200'>Image URL</Label>
                            <Input
                              id='productImage'
                              value={newProductForm.image}
                              onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                              placeholder='https://example.com/image.jpg'
                              className='bg-lottery-700/50 border-lottery-600/50 text-white'
                            />
                          </div>
                          <div className='flex justify-end space-x-2 pt-4'>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => setShowAddProductModal(false)}
                              className='border-lottery-600 text-lottery-300'
                            >
                              Cancel
                            </Button>
                            <Button
                              type='button'
                              onClick={handleAddProduct}
                              className='bg-lottery-500 hover:bg-lottery-600'
                            >
                              Add Product
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <select
                    {...register('productId')}
                    id='productId'
                    className='w-full px-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                  >
                    <option value=''>Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                  {errors.productId && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.productId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Game Configuration */}
              <div>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <Settings className='w-5 h-5 mr-2 text-lottery-500' />
                  Game Configuration
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div>
                    <label
                      htmlFor='ticketPrice'
                      className='block text-sm font-medium text-lottery-200 mb-2'
                    >
                      Ticket Price *
                    </label>
                    <div className='relative'>
                      <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
                      <input
                        {...register('ticketPrice', { valueAsNumber: true })}
                        type='number'
                        id='ticketPrice'
                        step='0.01'
                        min='0.01'
                        className='w-full pl-10 pr-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                        placeholder='1.00'
                      />
                    </div>
                    {errors.ticketPrice && (
                      <p className='mt-2 text-sm text-red-400'>
                        {errors.ticketPrice.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='maxParticipants'
                      className='block text-sm font-medium text-lottery-200 mb-2'
                    >
                      Max Participants *
                    </label>
                    <div className='relative'>
                      <Users className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-lottery-400' />
                      <input
                        {...register('maxParticipants', {
                          valueAsNumber: true,
                        })}
                        type='number'
                        id='maxParticipants'
                        min='1'
                        className='w-full pl-10 pr-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white placeholder-lottery-400 focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                        placeholder='100'
                      />
                    </div>
                    {errors.maxParticipants && (
                      <p className='mt-2 text-sm text-red-400'>
                        {errors.maxParticipants.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='ticketPrice'
                      className='block text-sm font-medium text-lottery-200 mb-2'
                    >
                      Total Prize Pool
                    </label>
                    <div className='w-full px-4 py-3 bg-lottery-700/30 border border-lottery-600/30 rounded-xl text-lottery-300'>
                      ${watch('ticketPrice') * watch('maxParticipants') || 0}
                    </div>
                    <p className='mt-1 text-xs text-lottery-400'>
                      Based on ticket price × max participants
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <Calendar className='w-5 h-5 mr-2 text-lottery-500' />
                  Schedule
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label
                      htmlFor='startDate'
                      className='block text-sm font-medium text-lottery-200 mb-2'
                    >
                      Start Date *
                    </label>
                    <input
                      {...register('startDate')}
                      type='datetime-local'
                      id='startDate'
                      className='w-full px-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                    />
                    {errors.startDate && (
                      <p className='mt-2 text-sm text-red-400'>
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='endDate'
                      className='block text-sm font-medium text-lottery-200 mb-2'
                    >
                      End Date *
                    </label>
                    <input
                      {...register('endDate')}
                      type='datetime-local'
                      id='endDate'
                      className='w-full px-4 py-3 bg-lottery-700/50 border border-lottery-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lottery-500 focus:border-transparent transition-all duration-200'
                    />
                    {errors.endDate && (
                      <p className='mt-2 text-sm text-red-400'>
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='pt-6 border-t border-lottery-700/30'>
              <Button
                type='submit'
                disabled={createGameMutation.isPending}
                className='w-full py-3 bg-gradient-to-r from-lottery-500 to-lottery-600 hover:from-lottery-600 hover:to-lottery-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl'
              >
                {createGameMutation.isPending ? t('admin.creatingGame') : t('admin.createGame')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
