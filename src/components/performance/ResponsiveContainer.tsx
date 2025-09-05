'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  enableSafeArea?: boolean;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
  padding = 'md',
  enableSafeArea = true,
  enablePullToRefresh = false,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-1',
    md: 'px-4 py-2',
    lg: 'px-6 py-4',
  };

  // Handle pull-to-refresh
  useEffect(() => {
    if (!enablePullToRefresh || !onRefresh) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);

      if (distance > 0) {
        setPullDistance(Math.min(distance, 100));
        if (distance > 50) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 60 && !isRefreshing && onRefresh) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      setStartY(0);
    };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh, onRefresh, isRefreshing, pullDistance, startY]);

  return (
    <div
      className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        enableSafeArea && 'pt-safe pb-safe',
        className
      )}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (pullDistance > 0 || isRefreshing) && (
        <div
          className='flex justify-center items-center py-2 transition-all duration-200 ease-out'
          style={{
            transform: `translateY(${pullDistance}px)`,
            opacity: Math.min(pullDistance / 60, 1),
          }}
        >
          <div
            className={cn(
              'w-6 h-6 border-2 border-orange-500 rounded-full transition-transform duration-200',
              isRefreshing
                ? 'animate-spin border-t-transparent'
                : 'animate-bounce',
              pullDistance > 60 && 'scale-110'
            )}
          >
            {!isRefreshing && (
              <div className='w-full h-full flex items-center justify-center'>
                <div className='w-2 h-2 bg-orange-500 rounded-full' />
              </div>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

// Hook for responsive breakpoints
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: screenSize.width < 640,
    isTablet: screenSize.width >= 640 && screenSize.width < 1024,
    isDesktop: screenSize.width >= 1024,
    isSmall: screenSize.width < 480,
    isMedium: screenSize.width >= 480 && screenSize.width < 768,
    isLarge: screenSize.width >= 768,
    orientation:
      screenSize.height > screenSize.width ? 'portrait' : 'landscape',
  };
};

// Mobile-optimized button component
interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  hapticFeedback?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  hapticFeedback = true,
}) => {
  const handleClick = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50); // Light haptic feedback
    }
    onClick?.();
  };

  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary:
      'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    ghost:
      'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'rounded-xl font-medium transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        'touch-manipulation select-none', // Mobile optimizations
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
};

// Safe area aware layout component
export const SafeAreaLayout: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={cn(
        'min-h-screen bg-gray-50 dark:bg-gray-900',
        'pt-safe pb-safe pl-safe pr-safe', // Safe area padding
        className
      )}
    >
      {children}
    </div>
  );
};
