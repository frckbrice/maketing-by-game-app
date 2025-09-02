'use client';

import { Shop } from '@/types';
import { ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FollowButton, ChatButton } from '@/components/features/social';

interface TopShopsProps {
  shops: Shop[];
  loading?: boolean;
  className?: string;
}

export const TopShops = React.memo<TopShopsProps>(function TopShops({
  shops = [],
  loading = false,
  className = '',
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollShops = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  if (shops.length === 0) {
    return null;
  }

  return (
    <div className={`mb-12 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('marketplace.topShops')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('marketplace.discoverAmazingVendors')}
            </p>
          </div>
        </div>

        <Link
          href="/shops"
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm flex items-center"
        >
          {t('marketplace.viewAll')}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Shops Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => scrollShops('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
          aria-label={t('marketplace.scrollLeft')}
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={() => scrollShops('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700"
          aria-label={t('marketplace.scrollRight')}
        >
          <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Shops Grid */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-6 px-16 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {shops.map(shop => {
            return (
              <div
                key={shop.id}
                className="flex-shrink-0 group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:transform hover:scale-[1.02] w-64"
              >
                {/* Shop Banner */}
                <div className="relative h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                  {shop.banner ? (
                    <Image
                      src={shop.banner}
                      alt={`${shop.name} banner`}
                      fill
                      className="object-cover"
                      sizes="256px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                  )}
                  
                  {/* Verified Badge */}
                  {shop.isVerified && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Shop Logo */}
                <div className="absolute top-16 left-4 w-16 h-16 border-4 border-white dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
                  {shop.logo ? (
                    <Image
                      src={shop.logo}
                      alt={`${shop.name} logo`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Shop Content */}
                <div className="p-4 pt-8">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {shop.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {shop.description}
                      </p>
                    </div>
                  </div>

                  {/* Shop Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {shop.productsCount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('marketplace.products')}
                      </div>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                        {shop.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ({shop.totalReviews})
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <FollowButton
                          targetId={shop.id}
                          targetType="SHOP"
                          targetName={shop.name}
                          variant="compact"
                          showCount={false}
                          className="w-full"
                        />
                      </div>

                      <ChatButton
                        targetId={shop.id}
                        targetType="SHOP"
                        targetName={shop.name}
                        variant="icon"
                        className="px-3 py-2"
                      />
                    </div>

                    <Link
                      href={`/shops/${shop.id}`}
                      className="block w-full text-center py-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                    >
                      {t('marketplace.viewShop')}
                    </Link>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});