'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Store,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'orange' | 'minimal';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  className = '',
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variants = {
    default: 'text-gray-600 dark:text-gray-400',
    orange: 'text-orange-500',
    minimal: 'text-gray-400',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} ${variants[variant]} animate-spin`}
      />
      {text && <span className={`text-sm ${variants[variant]}`}>{text}</span>}
    </div>
  );
};

interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  type?: 'shop' | 'chat' | 'products' | 'games' | 'general';
  showProgress?: boolean;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  title,
  subtitle,
  type = 'general',
  showProgress = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Simulate progress for better UX
  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Cap at 90% until real loading completes
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showProgress]);

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'shop':
        return <Store className='w-12 h-12 text-orange-500' />;
      case 'chat':
        return <MessageCircle className='w-12 h-12 text-orange-500' />;
      case 'products':
        return <ShoppingBag className='w-12 h-12 text-orange-500' />;
      case 'games':
        return <Sparkles className='w-12 h-12 text-orange-500' />;
      default:
        return <Loader2 className='w-12 h-12 text-orange-500 animate-spin' />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'shop':
        return t('loading.loadingShop');
      case 'chat':
        return t('loading.loadingChat');
      case 'products':
        return t('loading.loadingProducts');
      case 'games':
        return t('loading.loadingGames');
      default:
        return t('loading.loading');
    }
  };

  const getDefaultSubtitle = () => {
    switch (type) {
      case 'shop':
        return t('loading.preparingShopData');
      case 'chat':
        return t('loading.connectingToChat');
      case 'products':
        return t('loading.fetchingProducts');
      case 'games':
        return t('loading.loadingGameData');
      default:
        return t('loading.pleaseWait');
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      <div className='text-center max-w-md mx-auto p-6'>
        {/* Icon */}
        <div className='mb-6'>{getIcon()}</div>

        {/* Title */}
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
          {title || getDefaultTitle()}
          {dots}
        </h2>

        {/* Subtitle */}
        <p className='text-gray-600 dark:text-gray-400 mb-6 text-sm'>
          {subtitle || getDefaultSubtitle()}
        </p>

        {/* Progress Bar */}
        {showProgress && (
          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4'>
            <div
              className='bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out'
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {/* Loading Spinner */}
        <LoadingSpinner variant='orange' />
      </div>
    </div>
  );
};

interface ContentSkeletonProps {
  type:
    | 'shop-header'
    | 'product-grid'
    | 'chat-messages'
    | 'game-cards'
    | 'dashboard-stats'
    | 'table';
  count?: number;
  className?: string;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  type,
  count = 6,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'shop-header':
        return (
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center gap-4 mb-4'>
              <Skeleton className='w-16 h-16 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-32' />
              </div>
              <Skeleton className='h-10 w-24' />
            </div>
            <div className='grid grid-cols-4 gap-4 mb-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='text-center'>
                  <Skeleton className='h-6 w-12 mx-auto mb-1' />
                  <Skeleton className='h-4 w-16 mx-auto' />
                </div>
              ))}
            </div>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        );

      case 'product-grid':
        return (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'
              >
                <Skeleton className='h-48 w-full' />
                <div className='p-4 space-y-3'>
                  <Skeleton className='h-5 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <div className='flex justify-between items-center'>
                    <Skeleton className='h-6 w-20' />
                    <Skeleton className='h-8 w-16' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'chat-messages':
        return (
          <div className='space-y-4'>
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-xs ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <Skeleton className='w-8 h-8 rounded-full flex-shrink-0' />
                  <div
                    className={`rounded-2xl p-3 space-y-2 ${
                      i % 2 === 0
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'bg-orange-100 dark:bg-orange-900/20'
                    }`}
                  >
                    <Skeleton className='h-4 w-32' />
                    {Math.random() > 0.5 && <Skeleton className='h-4 w-24' />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'game-cards':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
              >
                <Skeleton className='h-40 w-full' />
                <div className='p-4 space-y-3'>
                  <div className='flex justify-between items-start'>
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-6 w-16' />
                  </div>
                  <Skeleton className='h-4 w-full' />
                  <div className='flex justify-between items-center'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-10 w-full' />
                </div>
              </div>
            ))}
          </div>
        );

      case 'dashboard-stats':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'
              >
                <div className='flex items-center gap-4'>
                  <Skeleton className='w-12 h-12 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-6 w-16' />
                  </div>
                </div>
                <div className='mt-4'>
                  <Skeleton className='h-3 w-full' />
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
            <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex justify-between items-center'>
                <Skeleton className='h-8 w-48' />
                <Skeleton className='h-10 w-32' />
              </div>
            </div>
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              {[...Array(count)].map((_, i) => (
                <div key={i} className='p-4'>
                  <div className='grid grid-cols-4 gap-4'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-8 w-20' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className='space-y-4'>
            {[...Array(count)].map((_, i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </div>
        );
    }
  };

  return <div className={`animate-pulse ${className}`}>{renderSkeleton()}</div>;
};

interface SmartLoadingProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}) => {
  const { t } = useTranslation();

  if (error) {
    return (
      errorComponent || (
        <div className='text-center py-8'>
          <p className='text-red-600 dark:text-red-400'>{error.message}</p>
        </div>
      )
    );
  }

  if (isLoading) {
    return (
      loadingComponent || (
        <LoadingSpinner variant='orange' text={t('loading.loading')} />
      )
    );
  }

  if (isEmpty) {
    return (
      emptyComponent || (
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          <p>{emptyMessage || t('common.noDataFound')}</p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
