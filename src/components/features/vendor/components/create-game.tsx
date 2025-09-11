'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  ArrowLeft,
  Award,
  Calendar,
  DollarSign,
  GamepadIcon,
  Image,
  Info,
  Plus,
  Save,
  Upload,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateGame, useSaveGameDraft } from '../api/mutations';
import type { Prize } from '../api/types';

const PRODUCT_CATEGORIES = [
  {
    id: 'phones',
    name: 'Phones (iOS & Android)',
    icon: '📱',
    products: ['iPhone 15 Pro Max', 'Samsung Galaxy S24', 'Google Pixel 8'],
  },
  {
    id: 'computers',
    name: 'Computers',
    icon: '💻',
    products: ['MacBook Pro', 'Dell XPS', 'iPad Air'],
  },
  {
    id: 'fashion-top',
    name: 'Clothes (Top)',
    icon: '👕',
    products: ['Nike T-Shirt', 'Adidas Hoodie', 'Polo Shirt'],
  },
  {
    id: 'fashion-bottom',
    name: 'Clothes (Bottom)',
    icon: '👖',
    products: ['Jeans', 'Shorts', 'Sweatpants'],
  },
  {
    id: 'shoes-sport',
    name: 'Shoes (Sport)',
    icon: '👟',
    products: ['Nike Air Jordan', 'Adidas Ultraboost', 'Puma RS-X'],
  },
  {
    id: 'shoes-professional',
    name: 'Shoes (Professional)',
    icon: '👞',
    products: ['Oxford Shoes', 'Loafers', 'Business Boots'],
  },
  {
    id: 'suits',
    name: 'Suits',
    icon: '🤵',
    products: ['Business Suit', 'Tuxedo', 'Casual Blazer'],
  },
  {
    id: 'slippers',
    name: 'Slippers',
    icon: '🩴',
    products: ['Flip Flops', 'House Slippers', 'Slide Sandals'],
  },
  {
    id: 'home-bundles',
    name: 'Home Bundles',
    icon: '🏠',
    products: ['Kitchen Set', 'Living Room Bundle', 'Bedroom Set'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📺',
    products: ['Smart TV 4K', 'Sound System', 'Gaming Console'],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: '🍳',
    products: ['Kitchen Mixer', 'Coffee Machine', 'Blender Set'],
  },
];

export function CreateGame() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  // React Query mutations
  const createGameMutation = useCreateGame();
  const saveGameDraftMutation = useSaveGameDraft();
  // Local form state with string dates for datetime-local inputs
  interface FormData {
    title: string;
    description: string;
    categoryId: string;
    ticketPrice: number;
    currency: string;
    maxParticipants: number;
    images: string[];
    prizes: Prize[];
    rules: string[];
    startDate: string;
    endDate: string;
    drawDate: string;
    videoUrl?: string;
    type: 'daily' | 'weekly' | 'special';
  }

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    categoryId: '',
    ticketPrice: 5,
    currency: 'USD',
    maxParticipants: 100,
    images: [],
    prizes: [{ name: '', description: '', value: 0 }],
    rules: [''],
    startDate: '',
    endDate: '',
    drawDate: '',
    type: 'daily',
  });
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  useEffect(() => {
    // Set default dates
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    setFormData(prev => ({
      ...prev,
      startDate: tomorrow.toISOString().slice(0, 16),
      endDate: nextWeek.toISOString().slice(0, 16),
      drawDate: nextWeek.toISOString().slice(0, 16),
    }));
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrizeChange = (index: number, field: keyof Prize, value: any) => {
    const newPrizes = [...formData.prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setFormData(prev => ({ ...prev, prizes: newPrizes }));
  };

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { name: '', description: '', value: 0 }],
    }));
  };

  const removePrize = (index: number) => {
    if (formData.prizes.length > 1) {
      setFormData(prev => ({
        ...prev,
        prizes: prev.prizes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const removeRule = (index: number) => {
    if (formData.rules.length > 1) {
      setFormData(prev => ({
        ...prev,
        rules: prev.rules.filter((_, i) => i !== index),
      }));
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    try {
      // In a real implementation, this would upload to Firebase Storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockImageUrl = `/images/${file.name}`;

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, mockImageUrl],
      }));

      toast.success(t('vendor.imageUploadSuccess'));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('vendor.imageUploadFailed'));
    } finally {
      setImageUploadLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Game title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Game description is required');
      return false;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return false;
    }
    if (formData.ticketPrice <= 0) {
      toast.error('Ticket price must be greater than 0');
      return false;
    }
    if (formData.maxParticipants <= 0) {
      toast.error('Max participants must be greater than 0');
      return false;
    }
    if (formData.prizes.some(p => !p.name.trim() || p.value <= 0)) {
      toast.error('All prizes must have a name and value');
      return false;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return false;
    }
    if (new Date(formData.drawDate) < new Date(formData.endDate)) {
      toast.error('Draw date must be at or after end date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateForm()) return;

    const gameData = {
      ...formData,
      startDate: new Date(formData.startDate).getTime(),
      endDate: new Date(formData.endDate).getTime(),
      drawDate: new Date(formData.drawDate).getTime(),
    };

    createGameMutation.mutate(
      { vendorId: user.id, gameData },
      {
        onSuccess: () => {
          router.push('/vendor-dashboard/games');
        },
      }
    );
  };

  const handleSaveDraft = async () => {
    const gameData = {
      ...formData,
      startDate: formData.startDate
        ? new Date(formData.startDate).getTime()
        : 0,
      endDate: formData.endDate ? new Date(formData.endDate).getTime() : 0,
      drawDate: formData.drawDate ? new Date(formData.drawDate).getTime() : 0,
    };

    saveGameDraftMutation.mutate({ gameData });
  };

  const calculateTotalPrizeValue = () => {
    return formData.prizes.reduce((sum, prize) => sum + prize.value, 0);
  };

  const calculateEstimatedRevenue = () => {
    return formData.ticketPrice * formData.maxParticipants;
  };

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='w-4 h-4' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              {t('vendor.createGame')}
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Design your lottery game and submit for admin approval
            </p>
          </div>
        </div>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            onClick={handleSaveDraft}
            disabled={saveGameDraftMutation.isPending}
          >
            <Save className='w-4 h-4 mr-2' />
            {saveGameDraftMutation.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createGameMutation.isPending}
          >
            {createGameMutation.isPending ? 'Creating...' : 'Submit for Review'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Form */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <GamepadIcon className='w-5 h-5 mr-2' />
                  {t('vendor.basicInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='title'>{t('vendor.gameTitle')} *</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder='e.g., iPhone 15 Pro Max Giveaway'
                    className='mt-1'
                  />
                </div>

                <div>
                  <Label htmlFor='description'>Description *</Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder='Describe your lottery game and what participants can win...'
                    rows={4}
                    className='mt-1'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='category'>Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={value =>
                        handleInputChange('categoryId', value)
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder={t('vendor.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className='flex items-center'>
                              <span className='mr-2'>{category.icon}</span>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='type'>{t('vendor.gameType')}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) =>
                        handleInputChange('type', value)
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='daily'>
                          {t('vendor.dailyGame')}
                        </SelectItem>
                        <SelectItem value='weekly'>
                          {t('vendor.weeklyGame')}
                        </SelectItem>
                        <SelectItem value='special'>
                          {t('vendor.specialEvent')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Participation */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <DollarSign className='w-5 h-5 mr-2' />
                  Pricing & Participation
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <Label htmlFor='ticketPrice'>
                      {t('vendor.ticketPrice')} *
                    </Label>
                    <div className='relative mt-1'>
                      <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                        $
                      </span>
                      <Input
                        id='ticketPrice'
                        type='number'
                        min='0.01'
                        step='0.01'
                        value={formData.ticketPrice}
                        onChange={e =>
                          handleInputChange(
                            'ticketPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='pl-8'
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='currency'>{t('vendor.currency')}</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={value =>
                        handleInputChange('currency', value)
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='USD'>USD ($)</SelectItem>
                        <SelectItem value='EUR'>EUR (€)</SelectItem>
                        <SelectItem value='XAF'>XAF (FCFA)</SelectItem>
                        <SelectItem value='XOF'>XOF (FCFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='maxParticipants'>
                      {t('vendor.maxParticipants')} *
                    </Label>
                    <Input
                      id='maxParticipants'
                      type='number'
                      min='1'
                      value={formData.maxParticipants}
                      onChange={e =>
                        handleInputChange(
                          'maxParticipants',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='mt-1'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prizes */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <Award className='w-5 h-5 mr-2' />
                    Prizes
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addPrize}
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Prize
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {formData.prizes.map((prize, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <h4 className='font-medium'>Prize {index + 1}</h4>
                      {formData.prizes.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removePrize(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <Label>Prize Name *</Label>
                        <Input
                          value={prize.name}
                          onChange={e =>
                            handlePrizeChange(index, 'name', e.target.value)
                          }
                          placeholder='e.g., iPhone 15 Pro Max'
                          className='mt-1'
                        />
                      </div>
                      <div>
                        <Label>{t('vendor.prizeValue')} *</Label>
                        <div className='relative mt-1'>
                          <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                            $
                          </span>
                          <Input
                            type='number'
                            min='0'
                            step='0.01'
                            value={prize.value}
                            onChange={e =>
                              handlePrizeChange(
                                index,
                                'value',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='pl-8'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <Label>{t('vendor.prizeDescription')}</Label>
                      <Textarea
                        value={prize.description}
                        onChange={e =>
                          handlePrizeChange(
                            index,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder='Describe the prize in detail...'
                        rows={2}
                        className='mt-1'
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <Info className='w-5 h-5 mr-2' />
                    Game Rules
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addRule}
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Rule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {formData.rules.map((rule, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-500 w-6'>
                      {index + 1}.
                    </span>
                    <Input
                      value={rule}
                      onChange={e => handleRuleChange(index, e.target.value)}
                      placeholder='Enter game rule...'
                      className='flex-1'
                    />
                    {formData.rules.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeRule(index)}
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Image className='w-5 h-5 mr-2' />
                  Game Images
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                    id='image-upload'
                  />
                  <label htmlFor='image-upload' className='cursor-pointer'>
                    <Upload className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600 dark:text-gray-400'>
                      {imageUploadLoading
                        ? 'Uploading...'
                        : 'Click to upload game images'}
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {formData.images.map((image, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={image}
                          alt={`Game image ${index + 1}`}
                          className='w-full h-32 object-cover rounded-lg border'
                        />
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={() => removeImage(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Calendar className='w-5 h-5 mr-2' />
                  Game Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <Label htmlFor='startDate'>Start Date & Time *</Label>
                    <Input
                      id='startDate'
                      type='datetime-local'
                      value={formData.startDate}
                      onChange={e =>
                        handleInputChange('startDate', e.target.value)
                      }
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <Label htmlFor='endDate'>End Date & Time *</Label>
                    <Input
                      id='endDate'
                      type='datetime-local'
                      value={formData.endDate}
                      onChange={e =>
                        handleInputChange('endDate', e.target.value)
                      }
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <Label htmlFor='drawDate'>Draw Date & Time *</Label>
                    <Input
                      id='drawDate'
                      type='datetime-local'
                      value={formData.drawDate}
                      onChange={e =>
                        handleInputChange('drawDate', e.target.value)
                      }
                      className='mt-1'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Game Preview */}
            <Card>
              <CardHeader>
                <CardTitle>{t('vendor.gamePreview')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='aspect-video bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-4 text-white'>
                  <div className='text-xs font-medium bg-white/20 px-2 py-1 rounded w-fit mb-2'>
                    {PRODUCT_CATEGORIES.find(
                      cat => cat.id === formData.categoryId
                    )?.name || 'Category'}
                  </div>
                  <h3 className='font-bold'>
                    {formData.title || t('vendor.gameTitle')}
                  </h3>
                  <p className='text-sm opacity-90 mt-1 line-clamp-2'>
                    {formData.description || 'Game description...'}
                  </p>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {t('vendor.ticketPrice')}:
                    </span>
                    <span className='font-medium'>${formData.ticketPrice}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {t('vendor.maxParticipants')}:
                    </span>
                    <span className='font-medium'>
                      {formData.maxParticipants}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {t('vendor.prizeValue')}:
                    </span>
                    <span className='font-medium'>
                      ${calculateTotalPrizeValue()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {t('vendor.estimatedRevenue')}:
                    </span>
                    <span className='font-medium'>
                      ${calculateEstimatedRevenue()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('vendor.quickStats')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                  <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                    ${calculateEstimatedRevenue().toLocaleString()}
                  </div>
                  <div className='text-sm text-blue-600/80 dark:text-blue-400/80'>
                    Potential Revenue
                  </div>
                </div>

                <div className='text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                  <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                    ${calculateTotalPrizeValue().toLocaleString()}
                  </div>
                  <div className='text-sm text-green-600/80 dark:text-green-400/80'>
                    {t('vendor.totalPrizeValue')}
                  </div>
                </div>

                <div className='text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                  <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                    {Math.round(
                      ((calculateEstimatedRevenue() -
                        calculateTotalPrizeValue()) /
                        calculateEstimatedRevenue()) *
                        100
                    )}
                    %
                  </div>
                  <div className='text-sm text-purple-600/80 dark:text-purple-400/80'>
                    {t('vendor.profitMargin')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>{t('vendor.tipsForSuccess')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm text-gray-600 dark:text-gray-400'>
                <p>• {t('vendor.tips.highQualityImages')}</p>
                <p>• {t('vendor.tips.competitivePrices')}</p>
                <p>• {t('vendor.tips.clearDescriptions')}</p>
                <p>• {t('vendor.tips.multiplePrizes')}</p>
                <p>• {t('vendor.tips.gameDuration')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
