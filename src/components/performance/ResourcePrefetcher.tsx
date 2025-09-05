'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ResourcePrefetcherProps {
  prefetchImages?: string[];
  prefetchRoutes?: string[];
  prefetchOnHover?: boolean;
  prefetchOnVisible?: boolean;
}

const ResourcePrefetcher = ({
  prefetchImages = [],
  prefetchRoutes = [],
  prefetchOnHover = true,
  prefetchOnVisible = true,
}: ResourcePrefetcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const prefetchedImages = useRef(new Set<string>());
  const prefetchedRoutes = useRef(new Set<string>());

  // Prefetch images
  useEffect(() => {
    if (prefetchImages.length === 0) return;

    const prefetchImage = (src: string) => {
      if (prefetchedImages.current.has(src)) return;

      const img = new Image();
      img.src = src;
      prefetchedImages.current.add(src);
    };

    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        prefetchImages.forEach(prefetchImage);
      });
    } else {
      setTimeout(() => {
        prefetchImages.forEach(prefetchImage);
      }, 100);
    }
  }, [prefetchImages]);

  // Prefetch routes
  useEffect(() => {
    if (prefetchRoutes.length === 0) return;

    const prefetchRoute = (route: string) => {
      if (prefetchedRoutes.current.has(route) || route === pathname) return;

      router.prefetch(route);
      prefetchedRoutes.current.add(route);
    };

    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        prefetchRoutes.forEach(prefetchRoute);
      });
    } else {
      setTimeout(() => {
        prefetchRoutes.forEach(prefetchRoute);
      }, 200);
    }
  }, [prefetchRoutes, router, pathname]);

  // Prefetch on hover
  useEffect(() => {
    if (!prefetchOnHover) return;

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;

      if (!link || !link.href) return;

      const url = new URL(link.href);
      const route = url.pathname;

      if (!prefetchedRoutes.current.has(route) && route !== pathname) {
        router.prefetch(route);
        prefetchedRoutes.current.add(route);
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [router, pathname, prefetchOnHover]);

  // Prefetch on visible (intersection observer)
  useEffect(() => {
    if (!prefetchOnVisible) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const link = target.querySelector(
              'a[href^="/"]'
            ) as HTMLAnchorElement;

            if (link && link.href) {
              const url = new URL(link.href);
              const route = url.pathname;

              if (!prefetchedRoutes.current.has(route) && route !== pathname) {
                router.prefetch(route);
                prefetchedRoutes.current.add(route);
              }
            }

            // Also prefetch images in viewport
            const images = target.querySelectorAll('img[data-src]');
            images.forEach(img => {
              const src = img.getAttribute('data-src');
              if (src && !prefetchedImages.current.has(src)) {
                const preloadImg = new Image();
                preloadImg.src = src;
                prefetchedImages.current.add(src);
              }
            });
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    // Observe all cards and interactive elements
    const cards = document.querySelectorAll(
      '[class*="card"], [class*="item"], [class*="product"]'
    );
    cards.forEach(card => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, [router, pathname, prefetchOnVisible]);

  // Strategic route prefetching based on current page
  useEffect(() => {
    const strategicRoutes: Record<string, string[]> = {
      '/': ['/games', '/shops', '/products', '/profile'],
      '/games': ['/shops', '/products', '/profile', '/games/categories'],
      '/shops': ['/products', '/profile', '/games'],
      '/products': ['/shops', '/profile', '/orders'],
      '/profile': ['/orders', '/games', '/shops'],
      '/orders': ['/profile', '/shops', '/products'],
    };

    const routesToPrefetch = strategicRoutes[pathname] || [];

    if (routesToPrefetch.length > 0) {
      // Use requestIdleCallback to prefetch during idle time
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          routesToPrefetch.forEach(route => {
            if (!prefetchedRoutes.current.has(route)) {
              router.prefetch(route);
              prefetchedRoutes.current.add(route);
            }
          });
        });
      }
    }
  }, [pathname, router]);

  return null;
};

export default ResourcePrefetcher;
