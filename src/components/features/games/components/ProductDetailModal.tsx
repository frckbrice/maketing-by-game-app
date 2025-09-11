'use client';

import { formatCurrency } from '@/lib/utils/currency';
import { Product, Review } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  Share2,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ProductDetailModalProps {
  product: Product | null;
  relatedProducts?: Product[];
  reviews?: Review[];
  isOpen: boolean;
  onClose: () => void;
  onLikeProduct?: (productId: string) => Promise<void>;
  onFollowShop?: (shopId: string) => Promise<void>;
  onPlayGame?: (productId: string) => void;
  onBuyNow?: (productId: string, selectedSize?: string) => void;
  onShare?: (productId: string) => void;
  likedProducts?: Set<string>;
  followedShops?: Set<string>;
}

type TabType = 'description' | 'specifications' | 'reviews';

export const ProductDetailModal = React.memo<ProductDetailModalProps>(
  function ProductDetailModal({
    product,
    relatedProducts = [],
    reviews = [],
    isOpen,
    onClose,
    onLikeProduct,
    onFollowShop,
    onPlayGame,
    onBuyNow,
    onShare,
    likedProducts = new Set(),
    followedShops = new Set(),
  }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('description');
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [isLiking, setIsLiking] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const handleShare = useCallback(async () => {
      if (!product) return;

      const url = `${window.location.origin}/products/${product.id}`;
      const shareData = {
        title: product.name,
        text: product.description,
        url: url,
      };

      try {
        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          // Fallback to clipboard
          await navigator.clipboard.writeText(url);
          // You could show a toast here
          console.log('Link copied to clipboard');
        }

        if (onShare) {
          onShare(product.id);
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }, [product, onShare]);

    const handleLike = useCallback(async () => {
      if (!product || !onLikeProduct || isLiking) return;

      setIsLiking(true);
      try {
        await onLikeProduct(product.id);
      } catch (error) {
        console.error('Failed to like product:', error);
      } finally {
        setIsLiking(false);
      }
    }, [product, onLikeProduct, isLiking]);

    const handleFollowShop = useCallback(async () => {
      if (!product || !onFollowShop || isFollowing) return;

      setIsFollowing(true);
      try {
        await onFollowShop(product.shop?.id || '');
      } catch (error) {
        console.error('Failed to follow shop:', error);
      } finally {
        setIsFollowing(false);
      }
    }, [product, onFollowShop, isFollowing]);

    const handleBuyNow = useCallback(() => {
      if (!product || !onBuyNow) return;
      onBuyNow(product.id, selectedSize);
    }, [product, onBuyNow, selectedSize]);

    const handlePlayGame = useCallback(() => {
      if (!product || !onPlayGame) return;
      onPlayGame(product.id);
    }, [product, onPlayGame]);

    if (!isOpen || !product) return null;

    const isLiked = likedProducts.has(product.id);
    const isShopFollowed = followedShops.has(product.shop?.id || '');
    const hasDiscount =
      product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount
      ? Math.round(
          ((product.originalPrice! - product.price) / product.originalPrice!) *
            100
        )
      : 0;

    return (
      <div className='fixed inset-0 z-50 overflow-y-auto'>
        <div className='flex min-h-screen items-center justify-center p-4'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
          />

          {/* Modal */}
          <div className='relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white truncate'>
                {product.name}
              </h2>
              <button
                onClick={onClose}
                className='w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-6'>
              {/* Left: Images */}
              <div>
                {/* Main Image */}
                <div className='relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4'>
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[selectedImage] || product.images[0]}
                      alt={product.name}
                      fill
                      className='object-cover'
                      sizes='(max-width: 1024px) 100vw, 50vw'
                    />
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <div className='text-8xl opacity-50'>📦</div>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className='absolute top-4 left-4 flex flex-col space-y-2'>
                    {product.isNew && (
                      <div className='bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
                        {t('marketplace.new')}
                      </div>
                    )}
                    {hasDiscount && (
                      <div className='bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
                        -{discountPercentage}%
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className='absolute top-4 right-4 flex flex-col space-y-2'>
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isLiked
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                      } ${isLiking ? 'opacity-70' : ''}`}
                    >
                      {isLiking ? (
                        <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                      ) : (
                        <Heart
                          className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                        />
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className='w-10 h-10 bg-white/80 text-gray-600 hover:bg-blue-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-200'
                    >
                      <Share2 className='w-5 h-5' />
                    </button>
                  </div>

                  {/* Image Navigation */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImage(prev =>
                            prev === 0 ? product.images.length - 1 : prev - 1
                          )
                        }
                        className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors'
                      >
                        <ChevronLeft className='w-5 h-5' />
                      </button>

                      <button
                        onClick={() =>
                          setSelectedImage(
                            prev => (prev + 1) % product.images.length
                          )
                        }
                        className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors'
                      >
                        <ChevronRight className='w-5 h-5' />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className='grid grid-cols-4 gap-2'>
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          index === selectedImage
                            ? 'border-orange-500'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          width={80}
                          height={80}
                          className='w-full h-full object-cover'
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className='flex flex-col'>
                {/* Pricing */}
                <div className='mb-6'>
                  <div className='flex items-center space-x-3 mb-2'>
                    {hasDiscount && (
                      <span className='text-lg text-gray-500 dark:text-gray-400 line-through'>
                        {formatCurrency(
                          product.originalPrice!,
                          product.currency
                        )}
                      </span>
                    )}
                    <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                      {formatCurrency(product.price, product.currency)}
                    </span>
                  </div>

                  {product.isLotteryEnabled && product.lotteryPrice && (
                    <div className='flex items-center text-orange-600 dark:text-orange-400'>
                      <Play className='w-4 h-4 mr-2' />
                      <span>
                        {t('marketplace.playFor')}{' '}
                        {formatCurrency(product.lotteryPrice, product.currency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sizes */}
                {(product as any).sizes &&
                  (product as any).sizes.length > 0 && (
                    <div className='mb-6'>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-white mb-3'>
                        {t('marketplace.availableSizes')}
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {(product as any).sizes.map((size: string) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border rounded-lg transition-colors ${
                              selectedSize === size
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Stock Indicator */}
                <div className='mb-6'>
                  {(product.stockQuantity || 0) > 0 ? (
                    <div className='flex items-center text-green-600 dark:text-green-400'>
                      <div className='w-2 h-2 bg-green-500 rounded-full mr-2' />
                      <span className='text-sm'>
                        {(product.stockQuantity || 0) > 10
                          ? t('marketplace.inStock')
                          : t('marketplace.lowStock', {
                              count: product.stockQuantity || 0,
                            })}
                      </span>
                    </div>
                  ) : (
                    <div className='flex items-center text-red-600 dark:text-red-400'>
                      <div className='w-2 h-2 bg-red-500 rounded-full mr-2' />
                      <span className='text-sm'>
                        {t('marketplace.outOfStock')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='space-y-3 mb-6'>
                  {product.isLotteryEnabled && (
                    <button
                      onClick={handlePlayGame}
                      disabled={product.status === 'OUT_OF_STOCK'}
                      className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center'
                    >
                      <Play className='w-5 h-5 mr-2' />
                      {product.status === 'OUT_OF_STOCK'
                        ? t('marketplace.outOfStock')
                        : t('marketplace.playNow')}
                    </button>
                  )}

                  <button
                    onClick={handleBuyNow}
                    disabled={product.status === 'OUT_OF_STOCK'}
                    className='w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center'
                  >
                    <ShoppingCart className='w-5 h-5 mr-2' />
                    {product.status === 'OUT_OF_STOCK'
                      ? t('marketplace.outOfStock')
                      : t('marketplace.buyNow')}
                  </button>

                  <button
                    onClick={handleFollowShop}
                    disabled={isFollowing}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                      isShopFollowed
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700'
                        : 'border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                    } ${isFollowing ? 'opacity-70' : ''}`}
                  >
                    {isFollowing ? (
                      <div className='w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                    ) : (
                      <Heart
                        className={`w-5 h-5 mr-2 ${isShopFollowed ? 'fill-current' : ''}`}
                      />
                    )}
                    {isShopFollowed
                      ? t('marketplace.following')
                      : t('marketplace.followShop')}
                  </button>
                </div>

                {/* Stats */}
                <div className='grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <div className='text-center'>
                    <div className='font-semibold text-gray-900 dark:text-white'>
                      {product.likeCount}
                    </div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>
                      {t('marketplace.likes')}
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='font-semibold text-gray-900 dark:text-white'>
                      {product.reviewsCount}
                    </div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>
                      {t('marketplace.played')}
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='font-semibold text-gray-900 dark:text-white flex items-center justify-center'>
                      <Star className='w-4 h-4 text-yellow-500 mr-1 fill-current' />
                      {product.rating.toFixed(1)}
                    </div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>
                      ({product.reviewsCount})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className='border-t border-gray-200 dark:border-gray-700'>
              {/* Tab Navigation */}
              <div className='flex border-b border-gray-200 dark:border-gray-700 px-6'>
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-4 px-6 font-medium transition-colors ${
                    activeTab === 'description'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  📝 {t('marketplace.description')}
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-4 px-6 font-medium transition-colors ${
                    activeTab === 'specifications'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  ⚙️ {t('marketplace.specifications')}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 px-6 font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  ⭐ {t('marketplace.reviews')} ({reviews.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className='p-6'>
                {activeTab === 'description' && (
                  <div>
                    <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    {product.specifications &&
                    Object.keys(product.specifications).length > 0 ? (
                      <div className='space-y-3'>
                        {Object.entries(product.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'
                            >
                              <span className='font-medium text-gray-900 dark:text-white'>
                                {key}
                              </span>
                              <span className='text-gray-600 dark:text-gray-400'>
                                {value}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className='text-gray-500 dark:text-gray-400 italic'>
                        {t('marketplace.noSpecifications')}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length > 0 ? (
                      <div className='space-y-4'>
                        {reviews.map(review => (
                          <div
                            key={review.id}
                            className='border-b border-gray-100 dark:border-gray-800 pb-4'
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <div className='flex items-center'>
                                <div className='flex'>
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className='ml-2 text-sm font-medium text-gray-900 dark:text-white'>
                                  {(review as any).title || 'Review'}
                                </span>
                              </div>
                              <span className='text-sm text-gray-500'>
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className='text-gray-600 dark:text-gray-400'>
                              {review.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-gray-500 dark:text-gray-400 italic'>
                        {t('marketplace.noReviews')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className='border-t border-gray-200 dark:border-gray-700 p-6'>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                  {t('marketplace.relatedProducts')}
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {relatedProducts.slice(0, 4).map(relatedProduct => (
                    <div
                      key={relatedProduct.id}
                      className='group cursor-pointer'
                    >
                      <div className='aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2'>
                        {relatedProduct.images.length > 0 ? (
                          <Image
                            src={relatedProduct.images[0]}
                            alt={relatedProduct.name}
                            width={150}
                            height={150}
                            className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                          />
                        ) : (
                          <div className='flex items-center justify-center h-full'>
                            <div className='text-4xl opacity-50'>📦</div>
                          </div>
                        )}
                      </div>
                      <h4 className='font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1'>
                        {relatedProduct.name}
                      </h4>
                      <p className='text-orange-600 font-semibold'>
                        {formatCurrency(
                          relatedProduct.price,
                          relatedProduct.currency
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
