import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Development environment check
const isDev = process.env.NODE_ENV === 'development';

// Simulate API delays for realistic UX
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Follow/Unfollow shop mutation
export const useFollowShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, action }: { shopId: string; action: 'follow' | 'unfollow' }) => {
      await simulateDelay();

      if (isDev) {
        // Mock success response
        return { success: true, action, shopId };
      }

      // Production API call
      const response = await fetch(`/api/shops/${shopId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} shop`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update shop data in cache
      queryClient.invalidateQueries({ queryKey: ['shop', data.shopId] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      
      const actionText = data.action === 'follow' ? 'followed' : 'unfollowed';
      toast.success(`Shop ${actionText} successfully!`);
    },
    onError: (error) => {
      console.error('Follow shop error:', error);
      toast.error('Failed to update shop follow status');
    },
  });
};

// Like/Unlike product mutation
export const useLikeProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, action }: { productId: string; action: 'like' | 'unlike' }) => {
      await simulateDelay();

      if (isDev) {
        // Mock success response
        return { success: true, action, productId };
      }

      // Production API call
      const response = await fetch(`/api/products/${productId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} product`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update product data in cache
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      const actionText = data.action === 'like' ? 'liked' : 'unliked';
      toast.success(`Product ${actionText}!`);
    },
    onError: (error) => {
      console.error('Like product error:', error);
      toast.error('Failed to update product like status');
    },
  });
};

// Share product mutation
export const useShareProduct = () => {
  return useMutation({
    mutationFn: async ({ productId, method }: { productId: string; method: 'native' | 'clipboard' | 'social' }) => {
      await simulateDelay(200);

      if (isDev) {
        // Mock analytics tracking
        console.log('Share analytics:', { productId, method, timestamp: Date.now() });
        return { success: true, productId, method };
      }

      // Production API call to track shares
      const response = await fetch(`/api/products/${productId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });

      if (!response.ok) {
        throw new Error('Failed to track product share');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.method === 'clipboard') {
        toast.success('Product link copied to clipboard!');
      } else {
        toast.success('Product shared successfully!');
      }
    },
    onError: (error) => {
      console.error('Share product error:', error);
      toast.error('Failed to share product');
    },
  });
};

// Play game mutation (for lottery products)
export const usePlayGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      await simulateDelay();

      if (isDev) {
        // Mock game play response
        return { 
          success: true, 
          productId,
          ticketId: `ticket-${Date.now()}`,
          gameResult: Math.random() > 0.9 ? 'winner' : 'try_again'
        };
      }

      // Production API call
      const response = await fetch(`/api/products/${productId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to play game');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update product play count in cache
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (data.gameResult === 'winner') {
        toast.success('Congratulations! You won! 🎉');
      } else {
        toast.success('Game played! Better luck next time! 🎮');
      }
    },
    onError: (error) => {
      console.error('Play game error:', error);
      toast.error('Failed to play game. Please try again.');
    },
  });
};

// Buy now mutation
export const useBuyNow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      await simulateDelay();

      if (isDev) {
        // Mock buy now response
        return { 
          success: true, 
          productId,
          quantity,
          orderId: `order-${Date.now()}`,
          redirectUrl: `/checkout/${productId}`
        };
      }

      // Production API call
      const response = await fetch(`/api/products/${productId}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate purchase');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update product data in cache
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
      
      toast.success('Redirecting to checkout...');
      
      // In real app, redirect to checkout
      console.log('Redirect to:', data.redirectUrl);
    },
    onError: (error) => {
      console.error('Buy now error:', error);
      toast.error('Failed to start purchase. Please try again.');
    },
  });
};

// Track banner click mutation
export const useTrackBannerClick = () => {
  return useMutation({
    mutationFn: async ({ bannerId }: { bannerId: string }) => {
      await simulateDelay(100);

      if (isDev) {
        // Mock analytics tracking
        console.log('Banner click tracked:', { bannerId, timestamp: Date.now() });
        return { success: true, bannerId };
      }

      // Production API call
      const response = await fetch(`/api/vendor-banners/${bannerId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to track banner click');
      }

      return response.json();
    },
    onError: (error) => {
      console.error('Banner click tracking error:', error);
      // Don't show error toast for analytics failures
    },
  });
};