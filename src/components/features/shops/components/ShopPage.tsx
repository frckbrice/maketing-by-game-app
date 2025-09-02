'use client';

import { Button } from '@/components/ui/Button';
import { currencyService } from '@/lib/api/currencyService';
import { Shop, Product, Review } from '@/types';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Users,
  Verified,
  Eye,
  Filter,
  Search,
  Grid,
  List,
  SortAsc,
  ShoppingCart,
  Play
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Import API hooks
import { useShop, useProducts } from '../api/queries';
import { useFollowShop, useLikeProduct, useShareProduct, usePlayGame, useBuyNow } from '../api/mutations';
import { ProductCard } from '../../games/components/ProductCard';

interface ShopPageProps {
  shopId: string;
}

export function ShopPage({ shopId }: ShopPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'offers' | 'reviews'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular' | 'rating'>('newest');
  
  // API hooks
  const { data: shop, isLoading: shopLoading, error: shopError } = useShop(shopId);
  const { data: products = [], isLoading: productsLoading } = useProducts({
    shopId,
    search: searchTerm,
    sortBy,
    limit: 50
  });

  // Mutations
  const followShopMutation = useFollowShop();
  const likeProductMutation = useLikeProduct();
  const shareProductMutation = useShareProduct();
  const playGameMutation = usePlayGame();
  const buyNowMutation = useBuyNow();

  const handleFollowShop = useCallback(() => {
    if (!shop) return;
    const action = isFollowed ? 'unfollow' : 'follow';
    followShopMutation.mutate({ shopId: shop.id, action });
  }, [shop, followShopMutation]);

  const handleShareShop = useCallback(async () => {
    if (!shop) return;
    
    const url = `${window.location.origin}/shops/${shop.id}`;
    const shareData = {
      title: shop.name,
      text: shop.description,
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        shareProductMutation.mutate({ productId: shop.id, method: 'native' });
      } else {
        await navigator.clipboard.writeText(url);
        shareProductMutation.mutate({ productId: shop.id, method: 'clipboard' });
        toast.success(t('common.linkCopied'));
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [shop, shareProductMutation, t]);

  const handleChatWithShop = useCallback(() => {
    if (!shop) return;
    router.push(`/shops/${shop.id}/chat`);
  }, [shop, router]);

  // Mock data for demonstration
  const isFollowed = false; // TODO: Get from user preferences
  const likedProducts = new Set<string>(); // TODO: Get from user preferences

  // Mock offers data
  const offers = [
    {
      id: 'offer-1',
      title: 'Buy 2 Get 1 Free',
      description: 'On all electronics this month',
      discount: 30,
      validUntil: Date.now() + 7 * 24 * 60 * 60 * 1000,
      code: 'ELEC30'
    },
    {
      id: 'offer-2', 
      title: 'Free Shipping',
      description: 'On orders above 50,000 FCFA',
      discount: 0,
      validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
      code: 'FREESHIP'
    }
  ];

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 'review-1',
      userId: 'user-1',
      userName: 'John Doe',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=32&q=80',
      rating: 5,
      comment: 'Excellent products and fast delivery!',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      isVerified: true,
      likes: 12,
      productId: 'product-1'
    },
    {
      id: 'review-2',
      userId: 'user-2',
      userName: 'Marie Dubois',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=32&q=80',
      rating: 4,
      comment: 'Great customer service and quality products.',
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      isVerified: true,
      likes: 8,
      productId: 'product-2'
    }
  ];

  if (shopError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('error.shopNotFound')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('error.shopNotFoundDescription')}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  if (shopLoading || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 dark:bg-gray-700 w-full" />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-300 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(product => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return product.name.toLowerCase().includes(search) ||
             product.description.toLowerCase().includes(search) ||
             product.tags.some(tag => tag.toLowerCase().includes(search));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
      </div>

      {/* Shop Header */}
      <div className="relative">
        {/* Banner Image */}
        <div className="h-64 sm:h-80 lg:h-96 relative overflow-hidden">
          <Image
            src={shop.banner || shop.logo}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Shop Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-6">
              {/* Shop Logo */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm">
                  <Image
                    src={shop.logo}
                    alt={shop.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Shop Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold truncate">{shop.name}</h1>
                  {shop.isVerified && (
                    <Verified className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-white/90 text-lg mb-4 line-clamp-2">{shop.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold">{shop.rating}</span>
                    <span className="text-white/70">({shop.totalReviews} {t('common.reviews')})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{shop.followersCount.toLocaleString()} {t('marketplace.followers')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{shop.productsCount} {t('marketplace.products')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Button
                  onClick={handleFollowShop}
                  disabled={followShopMutation.isPending}
                  className={`px-6 py-3 font-semibold rounded-xl transition-all ${
                    isFollowed
                      ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowed ? 'fill-current' : ''}`} />
                  {isFollowed ? t('marketplace.following') : t('marketplace.follow')}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handleChatWithShop}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('marketplace.chat')}
                  </Button>

                  <Button
                    onClick={handleShareShop}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'products', name: t('marketplace.products'), icon: ShoppingCart },
              { id: 'offers', name: t('marketplace.offers'), icon: Star },
              { id: 'reviews', name: t('marketplace.reviews'), icon: MessageCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {tab.id === 'products' && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">
                      {filteredProducts.length}
                    </span>
                  )}
                  {tab.id === 'offers' && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">
                      {offers.length}
                    </span>
                  )}
                  {tab.id === 'reviews' && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">
                      {reviews.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div>
            {/* Products Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('marketplace.shopProducts')}
              </h2>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('marketplace.searchProducts')}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">{t('marketplace.sortBy.newest')}</option>
                  <option value="popular">{t('marketplace.sortBy.popular')}</option>
                  <option value="price-low">{t('marketplace.sortBy.priceLow')}</option>
                  <option value="price-high">{t('marketplace.sortBy.priceHigh')}</option>
                  <option value="rating">{t('marketplace.sortBy.rating')}</option>
                </select>

                {/* View Mode */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${
                      viewMode === 'grid'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${
                      viewMode === 'list'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('marketplace.noProductsFound')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? t('marketplace.noProductsMatchSearch')
                    : t('marketplace.shopHasNoProducts')
                  }
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onLikeProduct={async (productId) => {
                      likeProductMutation.mutate({ productId, action: 'like' });
                    }}
                    onFollowShop={async (shopId) => {
                      followShopMutation.mutate({ shopId, action: 'follow' });
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
                    likedProducts={likedProducts}
                    followedShops={new Set()}
                    showBuyNow={true} // Show buy now on shop page
                    className={viewMode === 'list' ? 'flex flex-row h-48' : 'h-full'}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('marketplace.specialOffers')}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {offers.map(offer => (
                <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {offer.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {offer.description}
                      </p>
                    </div>
                    {offer.discount > 0 && (
                      <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold">
                        -{offer.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('marketplace.validUntil')}: {new Date(offer.validUntil).toLocaleDateString()}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg font-mono text-sm">
                      {offer.code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('marketplace.customerReviews')}
            </h2>
            
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <Image
                      src={review.userAvatar}
                      alt={review.userName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {review.userName}
                        </h4>
                        {review.isVerified && (
                          <Verified className="w-4 h-4 text-blue-500" />
                        )}
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
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
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                          <Heart className="w-4 h-4" />
                          {review.likes}
                        </button>
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
  );
}