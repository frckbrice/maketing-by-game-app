'use client';

import { Button } from '@/components/ui/Button';
import { currencyService } from '@/lib/api/currencyService';
import { useAuth } from '@/lib/contexts/AuthContext';
import OptimizedImage from '../../../performance/OptimizedImage';

// Review interface for mock data
interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: number;
  updatedAt: number;
  isVerified: boolean;
  likes: number;
  productId: string;
}

import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Heart,
  MessageCircle,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  ThumbsUp,
  Truck,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Import API hooks
import { ProductCard } from '../../games/components/ProductCard';
import { useBuyNow, useLikeProduct, usePlayGame, useShareProduct } from '../../shops/api/mutations';
import { useProduct, useProducts } from '../../shops/api/queries';

interface ProductDetailsPageProps {
  productId: string;
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // API hooks
  const { data: product, isLoading: productLoading, error: productError } = useProduct(productId);
  const { data: relatedProducts = [] } = useProducts({
    category: product?.category,
    limit: 8
  });

  // Mutations
  const likeProductMutation = useLikeProduct();
  const shareProductMutation = useShareProduct();
  const playGameMutation = usePlayGame();
  const buyNowMutation = useBuyNow();

  // Mock data
  const isLiked = false; // TODO: Get from user preferences
  const sizes = ['S', 'M', 'L', 'XL']; // TODO: Get from product data

  const mockReviews: Review[] = [
    {
      id: 'review-1',
      userId: 'user-1',
      userName: 'John Doe',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=40&q=80',
      rating: 5,
      comment: 'Excellent product! Exactly as described and fast delivery.',
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      isVerified: true,
      likes: 15,
      productId: productId
    },
    {
      id: 'review-2',
      userId: 'user-2',
      userName: 'Marie Dubois',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=40&q=80',
      rating: 4,
      comment: 'Good quality product. Would recommend to others.',
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      isVerified: true,
      likes: 8,
      productId: productId
    }
  ];

  const handlePreviousImage = useCallback(() => {
    if (!product) return;
    setCurrentImageIndex(prev =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  }, [product]);

  const handleNextImage = useCallback(() => {
    if (!product) return;
    setCurrentImageIndex(prev =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  }, [product]);

  const handleLike = useCallback(() => {
    if (!product) return;
    const action = isLiked ? 'unlike' : 'like';
    likeProductMutation.mutate({ productId: product.id, action });
  }, [product, isLiked, likeProductMutation]);

  const handleShare = useCallback(async () => {
    if (!product) return;

    const url = `${window.location.origin}/products/${product.id}`;
    const shareData = {
      title: product.name,
      text: product.description,
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        shareProductMutation.mutate({ productId: product.id, method: 'native' });
      } else {
        await navigator.clipboard.writeText(url);
        shareProductMutation.mutate({ productId: product.id, method: 'clipboard' });
        toast.success(t('common.linkCopied'));
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [product, shareProductMutation, t]);

  const handlePlayGame = useCallback(() => {
    if (!product) return;
    playGameMutation.mutate({ productId: product.id });
  }, [product, playGameMutation]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (sizes.length > 0 && !selectedSize) {
      toast.error(t('product.selectSize'));
      return;
    }
    buyNowMutation.mutate({ productId: product.id, quantity });
  }, [product, selectedSize, quantity, sizes.length, buyNowMutation, t]);

  if (productError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('error.productNotFound')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('error.productNotFoundDescription')}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  if (productLoading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const filteredRelatedProducts = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
              <OptimizedImage
                src={product.images[currentImageIndex] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t('marketplace.new')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{discountPercentage}%
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    {t('marketplace.featured')}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                      ? 'border-orange-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    <OptimizedImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <Link
                href={`/shops/${product.shop.shopId}`}
                className="text-sm text-orange-600 dark:text-orange-400 hover:underline mb-2 block"
              >
                {t('marketplace.visitShop')}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(averageRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {averageRating.toFixed(1)} ({mockReviews.length} {t('common.reviews')})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  {product.reviewCount} {t('marketplace.reviews')}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              {hasDiscount && (
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                  {currencyService.formatCurrency(product.originalPrice!, product.currency)}
                </span>
              )}
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {currencyService.formatCurrency(product.price, product.currency)}
              </span>
              {product.isLotteryEnabled && product.lotteryPrice && (
                <div className="ml-4 flex items-center text-orange-600 dark:text-orange-400">
                  <Play className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {t('marketplace.playFor')} {currencyService.formatCurrency(product.lotteryPrice, product.currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('product.selectSize')}
                </h3>
                <div className="flex gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${selectedSize === size
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('product.quantity')}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center text-lg font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 0, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stockQuantity && product.stockQuantity > 10 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : product.stockQuantity && product.stockQuantity > 0 ? (
                <CheckCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${product.stockQuantity && product.stockQuantity > 10
                ? 'text-green-600 dark:text-green-400'
                : product.stockQuantity && product.stockQuantity > 0
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                {product.stockQuantity && product.stockQuantity > 10
                  ? t('product.inStock')
                  : product.stockQuantity && product.stockQuantity > 0
                    ? t('product.lowStock', { count: product.stockQuantity })
                    : t('product.outOfStock')
                }
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {product.isLotteryEnabled && (
                <Button
                  onClick={handlePlayGame}
                  disabled={product.status === 'OUT_OF_STOCK'}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {product.status === 'OUT_OF_STOCK' ? t('marketplace.outOfStock') : t('marketplace.playNow')}
                </Button>
              )}

              <Button
                onClick={handleBuyNow}
                disabled={product.status === 'OUT_OF_STOCK' || (sizes.length > 0 && !selectedSize)}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-4 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.status === 'OUT_OF_STOCK' ? t('marketplace.outOfStock') : t('marketplace.buyNow')}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push(`/shops/${product.shop.shopId}/chat`)}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('marketplace.chatWithShop')}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">{t('product.freeShipping')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">{t('product.securePayment')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">{t('product.easyReturns')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">{product.playedCount} {t('product.played')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'description', name: t('product.description') },
                { id: 'specifications', name: t('product.specifications') },
                { id: 'reviews', name: t('product.reviews') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                >
                  {tab.name}
                  {tab.id === 'reviews' && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">
                      {mockReviews.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {product.description}
                </p>
                {product.features && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {t('product.keyFeatures')}
                    </h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {t('product.technicalSpecifications')}
                </h3>
                {product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <span className="font-medium text-gray-900 dark:text-white">{key}</span>
                        <span className="text-gray-600 dark:text-gray-400">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('product.noSpecificationsAvailable')}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('product.customerReviews')}
                  </h3>
                  <Button variant="outline" size="sm">
                    {t('product.writeReview')}
                  </Button>
                </div>

                {/* Reviews Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {averageRating.toFixed(1)}
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(averageRating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {mockReviews.length} {t('common.reviews')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <OptimizedImage
                          src={review.userAvatar}
                          alt={review.userName}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {review.userName}
                            </h4>
                            {review.isVerified && (
                              <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                                {t('product.verifiedPurchase')}
                              </span>
                            )}
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {review.comment}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                <ThumbsUp className="w-4 h-4" />
                                {review.likes}
                              </button>
                              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                <Flag className="w-4 h-4" />
                                {t('product.report')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {filteredRelatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {t('product.relatedProducts')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRelatedProducts.map(relatedProduct => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onLikeProduct={async (productId) => {
                    likeProductMutation.mutate({ productId, action: 'like' });
                  }}
                  onPlayGame={(productId) => {
                    playGameMutation.mutate({ productId });
                  }}
                  onBuyNow={(productId) => {
                    buyNowMutation.mutate({ productId });
                  }}
                  onShare={(productId) => {
                    shareProductMutation.mutate({ productId, method: 'native' });
                  }}
                  likedProducts={new Set()}
                  followedShops={new Set()}
                  showBuyNow={true}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}