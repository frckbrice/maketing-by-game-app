'use client';

import React, { memo } from 'react';
import { Heart, Share2, ShoppingCart, Eye, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OptimizedImage from './OptimizedImage';
import { MobileButton, useResponsive } from './ResponsiveContainer';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  isLiked?: boolean;
  isInStock?: boolean;
  category?: string;
  shopName?: string;
  shopId?: string;
}

interface MobileProductCardProps {
  product: Product;
  onLike?: (productId: string) => void;
  onShare?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onView?: (productId: string) => void;
  className?: string;
  layout?: 'grid' | 'list';
  showShopName?: boolean;
  priority?: boolean;
}

const MobileProductCard = memo<MobileProductCardProps>(
  ({
    product,
    onLike,
    onShare,
    onAddToCart,
    onView,
    className = '',
    layout = 'grid',
    showShopName = true,
    priority = false,
  }) => {
    const { t } = useTranslation();
    const { isMobile, isSmall } = useResponsive();

    const formatPrice = (price: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(price);
    };

    const discountedPrice = product.discount
      ? product.price * (1 - product.discount / 100)
      : product.price;

    if (layout === 'list') {
      return (
        <div
          className={cn(
            'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
            'shadow-sm hover:shadow-md transition-all duration-200',
            'p-3 sm:p-4',
            className
          )}
        >
          <div className='flex gap-3'>
            {/* Image */}
            <div className='relative flex-shrink-0'>
              <OptimizedImage
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                width={isMobile ? 80 : 100}
                height={isMobile ? 80 : 100}
                className='rounded-lg object-cover'
                sizes='(max-width: 640px) 80px, 100px'
                priority={priority}
                lazy={!priority}
                placeholder='blur'
              />
              {product.discount && (
                <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full'>
                  -{product.discount}%
                </div>
              )}
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-start mb-1'>
                <h3 className='font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate pr-2'>
                  {product.name}
                </h3>
                <button
                  onClick={() => onLike?.(product.id)}
                  className='flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
                >
                  <Heart
                    className={cn(
                      'w-4 h-4 transition-colors',
                      product.isLiked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    )}
                  />
                </button>
              </div>

              {showShopName && product.shopName && (
                <p className='text-xs text-gray-500 dark:text-gray-400 mb-1 truncate'>
                  {product.shopName}
                </p>
              )}

              {/* Rating */}
              {product.rating && (
                <div className='flex items-center gap-1 mb-2'>
                  <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    {product.rating} ({product.reviewCount || 0})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className='flex items-center gap-2 mb-2'>
                <span className='font-semibold text-gray-900 dark:text-white text-sm sm:text-base'>
                  {formatPrice(discountedPrice, product.currency)}
                </span>
                {product.discount && (
                  <span className='text-xs text-gray-500 line-through'>
                    {formatPrice(product.price, product.currency)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <MobileButton
                  size='sm'
                  variant='primary'
                  onClick={() => onAddToCart?.(product.id)}
                  disabled={!product.isInStock}
                  className='flex-1 text-xs'
                >
                  <ShoppingCart className='w-3 h-3 mr-1' />
                  {product.isInStock
                    ? t('product.addToCart')
                    : t('product.outOfStock')}
                </MobileButton>
                <button
                  onClick={() => onView?.(product.id)}
                  className='px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                >
                  <Eye className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid layout (default)
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-md transition-all duration-200',
          'overflow-hidden',
          'active:scale-[0.98] transition-transform',
          className
        )}
      >
        {/* Image */}
        <div className='relative aspect-square'>
          <OptimizedImage
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className='object-cover'
            sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
            priority={priority}
            lazy={!priority}
            placeholder='blur'
          />

          {/* Discount badge */}
          {product.discount && (
            <div className='absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium'>
              -{product.discount}%
            </div>
          )}

          {/* Quick actions overlay */}
          <div className='absolute top-2 right-2 flex flex-col gap-1'>
            <button
              onClick={() => onLike?.(product.id)}
              className='w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors'
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  product.isLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              />
            </button>
            <button
              onClick={() => onShare?.(product.id)}
              className='w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors'
            >
              <Share2 className='w-4 h-4 text-gray-600 dark:text-gray-400' />
            </button>
          </div>

          {/* Stock status */}
          {!product.isInStock && (
            <div className='absolute inset-0 bg-gray-900/50 flex items-center justify-center'>
              <span className='bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                {t('product.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className='p-3 sm:p-4'>
          {/* Shop name */}
          {showShopName && product.shopName && (
            <p className='text-xs text-orange-600 dark:text-orange-400 mb-1 truncate'>
              {product.shopName}
            </p>
          )}

          {/* Title */}
          <h3 className='font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-2 leading-tight'>
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className='flex items-center gap-1 mb-2'>
              <div className='flex items-center'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className='flex items-center gap-2 mb-3'>
            <span className='font-semibold text-gray-900 dark:text-white text-sm sm:text-base'>
              {formatPrice(discountedPrice, product.currency)}
            </span>
            {product.discount && (
              <span className='text-xs text-gray-500 dark:text-gray-400 line-through'>
                {formatPrice(product.price, product.currency)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className='flex gap-2'>
            <MobileButton
              size={isSmall ? 'sm' : 'md'}
              variant='primary'
              onClick={() => onAddToCart?.(product.id)}
              disabled={!product.isInStock}
              className='flex-1'
            >
              <ShoppingCart className='w-4 h-4 mr-1' />
              {isSmall ? t('product.buy') : t('product.addToCart')}
            </MobileButton>
            <button
              onClick={() => onView?.(product.id)}
              className='px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            >
              <Eye className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MobileProductCard.displayName = 'MobileProductCard';

export default MobileProductCard;
