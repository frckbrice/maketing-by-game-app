'use client';

import {
  ChatButton,
  FollowButton,
  LikeButton,
} from '@/components/features/social';
import OptimizedImage from '@/components/performance/OptimizedImage';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils/currency';
import { Play, Plus, Share2, ShoppingCart, Star, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../../../types';

interface ProductCardProps {
  product: Product;
  onLikeProduct?: (productId: string) => Promise<void>;
  onFollowShop?: (shopId: string) => Promise<void>;
  onPlayGame?: (productId: string) => void;
  onBuyNow?: (productId: string) => void;
  onShare?: (productId: string) => Promise<void>;
  likedProducts?: Set<string>;
  followedShops?: Set<string>;
  showBuyNow?: boolean; // Control whether to show buy now button
  showAddToCart?: boolean; // Control whether to show add to cart button
  className?: string;
}

export const ProductCard = React.memo<ProductCardProps>(function ProductCard({
  product,
  onLikeProduct,
  onFollowShop,
  onPlayGame,
  onBuyNow,
  onShare,
  likedProducts = new Set(),
  followedShops = new Set(),
  showBuyNow = false, // Default to false for game page
  showAddToCart = false, // Default to false for game page
  className = '',
}) {
  const { t } = useTranslation();
  const { addItem, getItemQuantity } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
      ((product.originalPrice! - product.price) / product.originalPrice!) *
      100
    )
    : 0;

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onShare) {
        onShare(product.id);
      }
    },
    [onShare, product.id]
  );

  const handlePlay = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onPlayGame) {
        onPlayGame(product.id);
      }
    },
    [onPlayGame, product.id]
  );

  const handleBuyNow = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onBuyNow) {
        onBuyNow(product.id);
      }
    },
    [onBuyNow, product.id]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (product.status === 'OUT_OF_STOCK') return;

      addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.images.length > 0 ? product.images[0] : '',
        price: product.price,
        quantity: 1,
        shopId: product.shop?.id || '',
        shopName: product.shop.name || 'Unknown Shop',
      });
    },
    [addItem, product]
  );

  const cartQuantity = getItemQuantity(product.id);

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:transform hover:scale-[1.02] h-[520px] sm:h-[540px] flex flex-col ${className}`}
    >
      {/* Status Badges */}
      <div className='absolute top-3 left-3 z-20 flex flex-col space-y-1'>
        {product.isNew && (
          <div className='bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg'>
            {t('marketplace.new')}
          </div>
        )}
        {hasDiscount && (
          <div className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg'>
            -{discountPercentage}%
          </div>
        )}
        {product.isFeatured && (
          <div className='bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg'>
            {t('marketplace.featured')}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='absolute top-3 right-3 z-20 flex flex-col space-y-2'>
        <LikeButton
          targetId={product.id}
          targetType='PRODUCT'
          variant='icon'
          showCount={false}
          size='sm'
        />

        <button
          onClick={handleShare}
          className='w-8 h-8 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-blue-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110'
        >
          <Share2 className='w-4 h-4' />
        </button>
      </div>

      {/* Product Image */}
      <Link href={`/products/${product.id}`} className='block'>
        <div className='relative h-48 bg-gray-100 dark:bg-gray-700'>
          {!imageLoaded && (
            <div className='absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-600' />
          )}

          {product.images.length > 0 ? (
            <OptimizedImage
              src={product.images[0]}
              alt={product.name}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              onLoad={() => setImageLoaded(true)}
              quality={80}
              lazy={!product.isFeatured}
              priority={product.isFeatured}
            />
          ) : (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-6xl opacity-50'>📦</div>
            </div>
          )}

          {/* Overlay for hover effects */}
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300' />
        </div>
      </Link>

      {/* Product Content */}
      <div className='p-4 flex flex-col flex-1'>
        {/* Shop Follow Button */}
        <div className='flex items-center justify-between mb-3'>
          {product.shop && product.shop.id && (
            <>
              <FollowButton
                targetId={product.shop.id}
                targetType='SHOP'
                targetName={product.shop.name || 'Shop'}
                variant='compact'
                showCount={false}
                onFollow={
                  onFollowShop
                    ? async shopId => onFollowShop(shopId)
                    : undefined
                }
              />

              <ChatButton
                targetId={product.shop.id}
                targetType='SHOP'
                targetName={product.shop.name || 'Shop'}
                variant='icon'
              />
            </>
          )}
        </div>

        {/* Product Info */}
        <Link href={`/products/${product.id}`} className='block mb-3'>
          <h3 className='font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight'>
            {product.name}
          </h3>

          <div className='flex items-center space-x-2 mb-2'>
            {hasDiscount && (
              <span className='text-sm text-gray-500 dark:text-gray-400 line-through'>
                {formatCurrency(product.originalPrice!, product.currency)}
              </span>
            )}
            <span className='text-lg font-bold text-gray-900 dark:text-white'>
              {formatCurrency(product.price, product.currency)}
            </span>
          </div>
        </Link>

        {/* Lottery Price - Outside Link to be clickable */}
        {product.isLotteryEnabled && product.lotteryPrice && (
          <button
            onClick={handlePlay}
            disabled={product.status === 'OUT_OF_STOCK'}
            className='flex items-center text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 mb-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Play className='w-4 h-4 mr-1' />
            <span className='underline'>
              {t('marketplace.playFor')}{' '}
              {formatCurrency(product.lotteryPrice, product.currency)}
            </span>
          </button>
        )}

        {/* Stats */}
        <div className='grid grid-cols-3 gap-2 mb-4'>
          <div className='text-center'>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              {t('marketplace.likes')}
            </div>
            <div className='font-semibold text-sm text-gray-900 dark:text-white'>
              {product.likeCount}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              {t('marketplace.played')}
            </div>
            <div className='font-semibold text-sm text-gray-900 dark:text-white'>
              {product.playedCount}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              {t('marketplace.rating')}
            </div>
            <div className='font-semibold text-sm text-gray-900 dark:text-white flex items-center justify-center'>
              <Star className='w-3 h-3 text-yellow-500 mr-1 fill-current' />
              {product.rating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='space-y-2 mt-auto'>
          {/* {product.isLotteryEnabled && (
            <button
              onClick={handlePlay}
              disabled={product.status === 'OUT_OF_STOCK'}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {product.status === 'OUT_OF_STOCK' ? t('marketplace.outOfStock') : t('marketplace.playNow')}
            </button>
          )} */}

          {showBuyNow && (
            <button
              onClick={handleBuyNow}
              disabled={product.status === 'OUT_OF_STOCK'}
              className='w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center'
            >
              <ShoppingCart className='w-4 h-4 mr-2' />
              {product.status === 'OUT_OF_STOCK'
                ? t('marketplace.outOfStock')
                : t('marketplace.buyNow')}
            </button>
          )}

          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={product.status === 'OUT_OF_STOCK'}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center relative'
            >
              <Plus className='w-4 h-4 mr-2' />
              {product.status === 'OUT_OF_STOCK'
                ? t('marketplace.outOfStock')
                : t('marketplace.addToCart')}
              {cartQuantity > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                  {cartQuantity}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Stock Indicator */}
        {product.stockQuantity &&
          product.stockQuantity > 0 &&
          product.stockQuantity <= 5 && (
            <div className='mt-2 text-xs text-red-600 dark:text-red-400 text-center'>
              {t('marketplace.lowStock', { count: product.stockQuantity })}
            </div>
          )}

        {/* Social Proof */}
        {product.playedCount > 0 && (
          <div className='mt-2 text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center'>
            <Users className='w-3 h-3 mr-1' />
            {t('marketplace.playedToday', { count: product.playedCount })}
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl' />
    </div>
  );
});
