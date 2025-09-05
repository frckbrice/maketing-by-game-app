'use client';

import { ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../../../performance/OptimizedImage';
import { VendorBanner as Banner } from '../../shops/api/types';

// Extended interface to match component usage
interface ExtendedBanner extends Banner {
  type?: 'VENDOR_PROMOTION' | 'PRODUCT_HIGHLIGHT';
  link?: string; // For backward compatibility
}

interface VendorBannerProps {
  banners: ExtendedBanner[];
  onBannerClick?: (bannerId: string) => void;
  className?: string;
}

export const VendorBanner = React.memo<VendorBannerProps>(
  function VendorBanner({ banners = [], onBannerClick, className = '' }) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [mounted, setMounted] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Auto-rotate banners
    useEffect(() => {
      if (!mounted || !isAutoPlaying || banners.length <= 1) return;

      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, 5000); // Change every 5 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [mounted, isAutoPlaying, banners.length]);

    const goToSlide = useCallback((index: number) => {
      setCurrentIndex(index);
      setIsAutoPlaying(false);

      // Resume auto-play after 10 seconds
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }, []);

    const goToPrevious = useCallback(() => {
      const newIndex =
        currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
      goToSlide(newIndex);
    }, [currentIndex, banners.length, goToSlide]);

    const goToNext = useCallback(() => {
      const newIndex = (currentIndex + 1) % banners.length;
      goToSlide(newIndex);
    }, [currentIndex, banners.length, goToSlide]);

    const handleBannerClick = useCallback(
      (banner: Banner) => {
        // Track banner click
        if (typeof window !== 'undefined') {
          //TODO: This would normally be sent to analytics
          console.log('Banner clicked:', banner.id);
        }

        // Call the onBannerClick prop if provided
        if (onBannerClick) {
          onBannerClick(banner.id);
        }
      },
      [onBannerClick]
    );

    if (!mounted || banners.length === 0) {
      return (
        <div
          className={`relative h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl overflow-hidden animate-pulse ${className}`}
        >
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <div className='w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 mx-auto' />
              <div className='w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto' />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`relative h-32 sm:h-40 lg:h-48 overflow-hidden rounded-2xl shadow-xl group ${className}`}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Banner Content */}
        <div className='relative w-full h-full'>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
            >
              {/* Background Image */}
              <div className='absolute inset-0'>
                <OptimizedImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className='object-cover w-full h-full'
                  priority={index === 0}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw'
                />
                <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent' />
              </div>

              {/* Content */}
              <div className='relative z-10 h-full flex items-center p-4 sm:p-6 lg:p-8'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    {banner.type === 'VENDOR_PROMOTION' && (
                      <div className='bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center'>
                        <Star className='w-3 h-3 mr-1' />
                        {t('marketplace.vendorPromotion')}
                      </div>
                    )}
                    {banner.type === 'PRODUCT_HIGHLIGHT' && (
                      <div className='bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
                        {t('marketplace.featured')}
                      </div>
                    )}
                  </div>

                  <h2 className='text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-1'>
                    {banner.title}
                  </h2>

                  <p className='text-gray-200 text-sm sm:text-base mb-4 line-clamp-2 max-w-md'>
                    {banner.description}
                  </p>

                  {(banner.link || banner.linkUrl) && (
                    <Link
                      href={banner.link || banner.linkUrl || '#'}
                      onClick={() => handleBannerClick(banner)}
                      className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 group/btn'
                    >
                      <span>{t('marketplace.shopNow')}</span>
                      <ExternalLink className='w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform' />
                    </Link>
                  )}
                </div>

                {/* Shop Logo (if it's a vendor promotion) */}
                {banner.type === 'VENDOR_PROMOTION' && banner.shopId && (
                  <div className='hidden sm:block ml-4'>
                    <div className='w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
                      <div className='w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center'>
                        {/* This would be the shop logo */}
                        <div className='text-xl lg:text-2xl'>🏪</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20'
              aria-label={t('marketplace.previousBanner')}
            >
              <ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5' />
            </button>

            <button
              onClick={goToNext}
              className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20'
              aria-label={t('marketplace.nextBanner')}
            >
              <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5' />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <div className='absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20'>
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`${t('marketplace.goToSlide')} ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Auto-play Indicator */}
        {isAutoPlaying && banners.length > 1 && (
          <div className='absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60' />
        )}
      </div>
    );
  }
);
