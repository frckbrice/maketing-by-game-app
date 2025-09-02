import { gameService } from '@/lib/api/gameService';
import { useCallback, useEffect } from 'react';

interface BackgroundSyncOptions {
  syncInterval?: number; // milliseconds
  enableBackgroundFetch?: boolean;
}

export function useBackgroundSync(options: BackgroundSyncOptions = {}) {
  const { syncInterval = 30000, enableBackgroundFetch = true } = options; // 30 seconds default

  const syncData = useCallback(async () => {
    try {
      // Preload critical data in background
      const promises = [
        gameService.getCategories(),
        gameService.getFeaturedGames(6),
        gameService.getGames('all'),
      ];

      // Execute in background without blocking UI
      Promise.allSettled(promises).then(results => {
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            // Cache the data (service worker will handle this)
            const cacheKeys = ['categories', 'featured-games', 'all-games'];
            if ('caches' in window) {
              caches.open('lottery-data-v1').then(cache => {
                const response = new Response(JSON.stringify(result.value));
                cache.put(`/api/cache/${cacheKeys[index]}`, response);
              });
            }
          }
        });
      });
    } catch (error) {
      console.log('Background sync failed:', error);
    }
  }, []);

  useEffect(() => {
    if (!enableBackgroundFetch) return;

    // Initial sync
    syncData();

    // Set up periodic sync
    const interval = setInterval(syncData, syncInterval);

    // Sync on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncData();
      }
    };

    // Sync on network status change
    const handleOnline = () => {
      syncData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [syncData, syncInterval, enableBackgroundFetch]);

  return { syncData };
}
