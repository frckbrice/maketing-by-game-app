'use client';

import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../../../types';
import { ProductCard } from './ProductCard';

// Featured Products Types
export interface FeaturedProductsProps {
  products: Product[];
  onLikeProduct?: (productId: string) => Promise<void>;
  onFollowShop?: (shopId: string) => Promise<void>;
  onPlayGame?: (productId: string) => void;
  onBuyNow?: (productId: string) => void;
  onShare?: (productId: string) => void;
  likedProducts?: Set<string>;
  followedShops?: Set<string>;
  loading?: boolean;
  className?: string;
}

export const FeaturedProducts = React.memo<FeaturedProductsProps>(function FeaturedProducts({
  products = [],
  onLikeProduct,
  onFollowShop,
  onPlayGame,
  onBuyNow,
  onShare,
  likedProducts = new Set(),
  followedShops = new Set(),
  loading = false,
  className = '',
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollProducts = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`mb-16 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white mr-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('marketplace.featuredProducts')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('marketplace.hotPicksHighParticipation')}
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm flex items-center"
        >
          {t('marketplace.viewAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Horizontally Scrollable Products */}
      <div className="relative">
        {/* Navigation Buttons */}
        {products.length > 4 && (
          <>
            <button
              onClick={() => scrollProducts('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
              aria-label={t('marketplace.scrollLeft')}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={() => scrollProducts('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
              aria-label={t('marketplace.scrollRight')}
            >
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </>
        )}

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-6 px-16 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => (
            <div key={product.id} className="flex-shrink-0 w-80">
              <ProductCard
                product={product}
                onPlayGame={onPlayGame}
                onBuyNow={onBuyNow}
                onShare={onShare}
                showBuyNow={false} // Hide buy now on game page
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* See All Section */}
      {products.length >= 4 && (
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {t('marketplace.exploreAllProducts')}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
});