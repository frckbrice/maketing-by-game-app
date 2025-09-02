'use client';

import { Heart, Sparkles } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../../../types';
import { ProductCard } from './ProductCard';

interface PersonalizedRecommendationsProps {
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

export const PersonalizedRecommendations = React.memo<PersonalizedRecommendationsProps>(function PersonalizedRecommendations({
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

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`mb-16 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl text-white mr-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('marketplace.productsYouMightLike')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('marketplace.personalizedRecommendations')}
            </p>
          </div>
        </div>

        <div className="flex items-center text-pink-600 dark:text-pink-400">
          <Heart className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            {t('marketplace.basedOnYourLikes')}
          </span>
        </div>
      </div>

      {/* Products Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.slice(0, 8).map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onLikeProduct={onLikeProduct}
            onFollowShop={onFollowShop}
            onPlayGame={onPlayGame}
            onBuyNow={onBuyNow}
            onShare={onShare}
            likedProducts={likedProducts}
            followedShops={followedShops}
            showBuyNow={false}
            className="h-full"
          />
        ))}
      </div>

      {/* Personalization Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t('marketplace.personalizationNote')}
        </p>
      </div>
    </div>
  );
});