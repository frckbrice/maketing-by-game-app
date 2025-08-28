'use client';

import { ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface AdBannerProps {
  type: 'horizontal' | 'vertical' | 'square';
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaUrl: string;
  company: {
    name: string;
    logo?: string;
  };
  onClose?: () => void;
  className?: string;
}

export function AdBanner({
  type,
  title,
  description,
  imageUrl,
  ctaText,
  ctaUrl,
  company,
  onClose,
  className = '',
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleClick = () => {
    window.open(ctaUrl, '_blank', 'noopener,noreferrer');

    // Track ad click (in production, send to analytics)
    console.log('Ad clicked:', { company: company.name, title, ctaUrl });
  };

  if (!isVisible) return null;

  const getLayoutClasses = () => {
    switch (type) {
      case 'horizontal':
        return 'flex-row items-center h-32';
      case 'vertical':
        return 'flex-col h-64';
      case 'square':
        return 'flex-col aspect-square';
      default:
        return 'flex-row items-center h-32';
    }
  };

  const getImageClasses = () => {
    switch (type) {
      case 'horizontal':
        return 'w-32 h-full';
      case 'vertical':
        return 'w-full h-40';
      case 'square':
        return 'w-full flex-1';
      default:
        return 'w-32 h-full';
    }
  };

  return (
    <article
      className={`group relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer ${getLayoutClasses()} ${className}`}
      onClick={handleClick}
      role='banner'
      aria-label={`Advertisement: ${title}`}
    >
      {/* Sponsored Label */}
      <div className='absolute top-2 left-2 z-20'>
        <div className='bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm'>
          AD
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={e => {
            e.stopPropagation();
            handleClose();
          }}
          className='absolute top-2 right-2 z-20 w-6 h-6 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors'
          aria-label='Close advertisement'
        >
          <X className='w-3 h-3' />
        </button>
      )}

      {/* Image Section */}
      {imageUrl && !imageError && (
        <div
          className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ${getImageClasses()}`}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            onError={() => setImageError(true)}
            loading='lazy'
          />

          {/* Overlay */}
          <div className='absolute inset-0 bg-gradient-to-r from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>
      )}

      {/* Content Section */}
      <div className='flex-1 p-4 flex flex-col justify-center'>
        {/* Company Info */}
        <div className='flex items-center mb-2'>
          {company.logo && (
            <div className='w-6 h-6 rounded-full overflow-hidden mr-2 bg-white'>
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={24}
                height={24}
                className='object-cover'
                loading='lazy'
              />
            </div>
          )}
          <span className='text-xs text-blue-600 dark:text-blue-400 font-semibold'>
            {company.name}
          </span>
        </div>

        {/* Title */}
        <h3 className='font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
          {title}
        </h3>

        {/* Description */}
        <p className='text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2'>
          {description}
        </p>

        {/* CTA Button */}
        <div className='flex items-center justify-between'>
          <button
            onClick={e => {
              e.stopPropagation();
              handleClick();
            }}
            className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors'
            aria-label={ctaText}
          >
            {ctaText}
            <ExternalLink className='w-3 h-3 ml-1' />
          </button>

          {type === 'horizontal' && (
            <div className='text-xs text-gray-400'>Sponsored</div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
    </article>
  );
}

export function AdBannerSkeleton({
  type,
  className = '',
}: {
  type: 'horizontal' | 'vertical' | 'square';
  className?: string;
}) {
  const getLayoutClasses = () => {
    switch (type) {
      case 'horizontal':
        return 'flex-row items-center h-32';
      case 'vertical':
        return 'flex-col h-64';
      case 'square':
        return 'flex-col aspect-square';
      default:
        return 'flex-row items-center h-32';
    }
  };

  const getImageClasses = () => {
    switch (type) {
      case 'horizontal':
        return 'w-32 h-full';
      case 'vertical':
        return 'w-full h-40';
      case 'square':
        return 'w-full flex-1';
      default:
        return 'w-32 h-full';
    }
  };

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse ${getLayoutClasses()} ${className}`}
    >
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex-shrink-0 ${getImageClasses()}`}
      />
      <div className='flex-1 p-4 space-y-3'>
        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4' />
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4' />
        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-full' />
        <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3' />
      </div>
    </div>
  );
}
