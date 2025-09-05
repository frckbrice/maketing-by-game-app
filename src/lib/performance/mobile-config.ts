/**
 * Mobile-First Performance Configuration
 * Comprehensive performance optimization settings for mobile devices
 */

export const MOBILE_PERFORMANCE_CONFIG = {
  // Core Performance Metrics
  PERFORMANCE: {
    // Time to First Byte (TTFB) - Target under 200ms
    TARGET_TTFB: 200,
    // First Contentful Paint (FCP) - Target under 1.8s
    TARGET_FCP: 1800,
    // Largest Contentful Paint (LCP) - Target under 2.5s
    TARGET_LCP: 2500,
    // Cumulative Layout Shift (CLS) - Target under 0.1
    TARGET_CLS: 0.1,
    // First Input Delay (FID) - Target under 100ms
    TARGET_FID: 100,
    // Interaction to Next Paint (INP) - Target under 200ms
    TARGET_INP: 200,
  },

  // Mobile Breakpoints (Mobile-First Approach)
  BREAKPOINTS: {
    xs: '320px', // Small phones
    sm: '640px', // Large phones
    md: '768px', // Tablets
    lg: '1024px', // Small laptops
    xl: '1280px', // Desktop
    '2xl': '1536px', // Large desktop
  },

  // Typography Scale (Mobile-First)
  TYPOGRAPHY: {
    // Font sizes optimized for mobile readability
    fontSize: {
      xs: '0.75rem', // 12px - Small labels
      sm: '0.875rem', // 14px - Body text mobile
      base: '1rem', // 16px - Body text desktop
      lg: '1.125rem', // 18px - Large body text
      xl: '1.25rem', // 20px - Small headings
      '2xl': '1.5rem', // 24px - Medium headings
      '3xl': '1.875rem', // 30px - Large headings
      '4xl': '2.25rem', // 36px - Hero text
    },

    // Line heights for better mobile readability
    lineHeight: {
      tight: '1.25', // For headings
      snug: '1.375', // For subheadings
      normal: '1.5', // For body text
      relaxed: '1.625', // For longer content
      loose: '2', // For very readable content
    },

    // Letter spacing optimized for small screens
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
    },
  },

  // Spacing Scale (Mobile-First)
  SPACING: {
    // Spacing values optimized for touch targets
    spacing: {
      0: '0px',
      1: '0.25rem', // 4px
      2: '0.5rem', // 8px
      3: '0.75rem', // 12px - Minimum touch target spacing
      4: '1rem', // 16px - Base spacing unit
      5: '1.25rem', // 20px
      6: '1.5rem', // 24px - Comfortable spacing
      8: '2rem', // 32px - Section spacing mobile
      10: '2.5rem', // 40px
      12: '3rem', // 48px - Section spacing desktop
      16: '4rem', // 64px - Large sections
      20: '5rem', // 80px
      24: '6rem', // 96px
    },
  },

  // Component Sizing (Mobile-First)
  SIZING: {
    // Button sizes optimized for touch
    buttons: {
      sm: {
        height: '36px',
        padding: '8px 12px',
        fontSize: '14px',
      },
      default: {
        height: '44px', // iOS minimum touch target
        padding: '12px 16px',
        fontSize: '16px',
      },
      lg: {
        height: '52px',
        padding: '16px 24px',
        fontSize: '18px',
      },
    },

    // Form elements optimized for mobile
    forms: {
      input: {
        height: '44px', // iOS minimum
        padding: '12px 16px',
        fontSize: '16px', // Prevents zoom on iOS
      },
      select: {
        height: '44px',
        padding: '12px 16px',
        fontSize: '16px',
      },
      textarea: {
        minHeight: '88px', // 2x button height
        padding: '12px 16px',
        fontSize: '16px',
      },
    },
  },

  // Image Optimization
  IMAGES: {
    // Responsive image breakpoints
    breakpoints: [320, 640, 768, 1024, 1280, 1536],

    // Quality settings
    quality: {
      thumbnail: 60,
      mobile: 75,
      desktop: 85,
      hero: 90,
    },

    // Format preferences (mobile-first)
    formats: ['avif', 'webp', 'jpg'],

    // Lazy loading settings
    lazyLoading: {
      threshold: '200px', // Load 200px before entering viewport
      fade: true,
      placeholder: 'blur',
    },
  },

  // Touch and Interaction
  TOUCH: {
    // Minimum touch target sizes
    minTouchTarget: '44px', // iOS HIG recommendation

    // Touch feedback timing
    feedback: {
      tapHighlight: '150ms',
      hoverDelay: '250ms',
    },

    // Gesture support
    gestures: {
      swipe: true,
      pinchZoom: false, // Disable for better control
      doubleTap: true,
    },
  },

  // Loading and Caching
  LOADING: {
    // Skeleton loading delays
    skeleton: {
      minDuration: 300, // Show skeleton for at least 300ms
      maxDuration: 3000, // Switch to error state after 3s
    },

    // Pagination settings
    pagination: {
      mobile: 6, // Items per page on mobile
      tablet: 9, // Items per page on tablet
      desktop: 12, // Items per page on desktop
    },

    // Cache durations
    cache: {
      static: 31536000, // 1 year for static assets
      api: 300, // 5 minutes for API responses
      images: 2592000, // 30 days for images
    },
  },

  // Accessibility
  A11Y: {
    // Focus management
    focus: {
      visible: true,
      skipToContent: true,
      trapFocus: true,
    },

    // Color contrast ratios
    contrast: {
      normal: 4.5, // WCAG AA
      large: 3, // WCAG AA for large text
      enhanced: 7, // WCAG AAA
    },

    // Screen reader support
    screenReader: {
      announcements: true,
      liveRegions: true,
      landmarks: true,
    },
  },

  // Animation Settings
  ANIMATION: {
    // Reduced motion support
    respectReducedMotion: true,

    // Duration preferences
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },

    // Easing functions
    easing: {
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Utility functions for performance optimization
export const performanceUtils = {
  // Check if device is mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  },

  // Get optimal image size based on viewport
  getOptimalImageSize: (baseWidth: number) => {
    if (typeof window === 'undefined') return baseWidth;
    const viewport = window.innerWidth;
    const breakpoints = MOBILE_PERFORMANCE_CONFIG.IMAGES.breakpoints;

    return breakpoints.find(bp => bp >= viewport) || Math.max(...breakpoints);
  },

  // Debounce function for performance-critical operations
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) func(...args);
      }, wait);

      if (callNow) func(...args);
    };
  },

  // Throttle function for scroll and resize events
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver: (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) => {
    if (typeof window === 'undefined') return null;

    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: MOBILE_PERFORMANCE_CONFIG.IMAGES.lazyLoading.threshold,
      threshold: 0.1,
      ...options,
    };

    return new IntersectionObserver(callback, defaultOptions);
  },
};

export default MOBILE_PERFORMANCE_CONFIG;
