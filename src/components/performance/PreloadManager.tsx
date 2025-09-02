'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface PreloadManagerProps {
  criticalResources?: string[];
  prefetchRoutes?: string[];
}

const PreloadManager = ({
  criticalResources = [],
  prefetchRoutes = ['/shops', '/products', '/profile']
}: PreloadManagerProps) => {
  const router = useRouter();
  const hasPreloaded = useRef(false);

  useEffect(() => {
    if (hasPreloaded.current || typeof window === 'undefined') return;

    // Skip preloading on slow connections to save data
    const connection = (navigator as any).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g') {
      console.log('⚡ Skipping preload on slow connection');
      return;
    }

    const preloadCriticalResources = () => {
      criticalResources.forEach((resource) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;

        if (resource.includes('.js')) {
          link.as = 'script';
        } else if (resource.includes('.css')) {
          link.as = 'style';
        } else if (resource.includes('.woff')) {
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
        }

        document.head.appendChild(link);
      });
    };

    const prefetchPages = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          prefetchRoutes.forEach((route) => {
            router.prefetch(route);
          });
        });
      } else {
        setTimeout(() => {
          prefetchRoutes.forEach((route) => {
            router.prefetch(route);
          });
        }, 2000);
      }
    };

    const optimizeResourceLoading = () => {
      // Add dns-prefetch for external domains
      const externalDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'firebaseapp.com',
        'googleapis.com'
      ];

      externalDomains.forEach((domain) => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });

      // Preconnect to critical origins
      const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      preconnectDomains.forEach((domain) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        if (domain.includes('gstatic')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      });
    };

    const initializePreloading = async () => {
      preloadCriticalResources();
      optimizeResourceLoading();

      // Wait for initial render to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      prefetchPages();

      hasPreloaded.current = true;
    };

    // Start preloading after initial paint
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializePreloading);
    } else {
      initializePreloading();
    }

    return () => {
      if (document.readyState === 'loading') {
        document.removeEventListener('DOMContentLoaded', initializePreloading);
      }
    };
  }, [criticalResources, prefetchRoutes, router]);

  return null;
};

export default PreloadManager;
