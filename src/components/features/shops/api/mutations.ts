import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Development environment check
const isDev = process.env.NODE_ENV === 'development';

// Simulate API delays for realistic UX
const simulateDelay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Follow/Unfollow shop mutation with optimistic updates
export const useFollowShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shopId,
      action,
    }: {
      shopId: string;
      action: 'follow' | 'unfollow';
    }) => {
      if (isDev) {
        await simulateDelay();
        return { success: true, action, shopId };
      }

      const response = await fetch(`/api/shops/${shopId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} shop`);
      }

      return response.json();
    },
    // Optimistic update
    onMutate: async ({ shopId, action }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['shop', shopId] });
      await queryClient.cancelQueries({ queryKey: ['shops'] });

      // Snapshot the previous values
      const previousShop = queryClient.getQueryData(['shop', shopId]);
      const previousShops = queryClient.getQueryData(['shops']);

      // Optimistically update shop data
      queryClient.setQueryData(['shop', shopId], (old: any) => {
        if (!old) return old;
        const isFollowing = action === 'follow';
        return {
          ...old,
          isFollowed: isFollowing,
          followersCount: (old.followersCount || 0) + (isFollowing ? 1 : -1),
        };
      });

      // Optimistically update shops list
      queryClient.setQueryData(['shops'], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((shop: any) =>
          shop.id === shopId
            ? {
                ...shop,
                isFollowed: action === 'follow',
                followersCount:
                  (shop.followersCount || 0) + (action === 'follow' ? 1 : -1),
              }
            : shop
        );
      });

      // Return context with previous data
      return { previousShop, previousShops, shopId };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousShop) {
        queryClient.setQueryData(
          ['shop', context.shopId],
          context.previousShop
        );
      }
      if (context?.previousShops) {
        queryClient.setQueryData(['shops'], context.previousShops);
      }

      console.error('Follow shop error:', error);
      toast.error('Failed to update shop follow status');
    },
    onSuccess: data => {
      // Invalidate to refetch latest data from server
      queryClient.invalidateQueries({ queryKey: ['shop', data.shopId] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });

      const actionText = data.action === 'follow' ? 'followed' : 'unfollowed';
      toast.success(`Shop ${actionText} successfully!`);
    },
  });
};

// Like/Unlike product mutation with optimistic updates
export const useLikeProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      action,
    }: {
      productId: string;
      action: 'like' | 'unlike';
    }) => {
      if (isDev) {
        await simulateDelay();
        return { success: true, action, productId };
      }

      const response = await fetch(`/api/products/${productId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} product`);
      }

      return response.json();
    },
    // Optimistic update for instant UI feedback
    onMutate: async ({ productId, action }) => {
      await queryClient.cancelQueries({ queryKey: ['product', productId] });
      await queryClient.cancelQueries({ queryKey: ['products'] });

      const previousProduct = queryClient.getQueryData(['product', productId]);
      const previousProducts = queryClient.getQueryData(['products']);

      // Optimistically update product
      queryClient.setQueryData(['product', productId], (old: any) => {
        if (!old) return old;
        const isLiked = action === 'like';
        return {
          ...old,
          isLiked,
          likesCount: (old.likesCount || 0) + (isLiked ? 1 : -1),
        };
      });

      // Update products in lists
      queryClient.setQueryData(['products'], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((product: any) =>
          product.id === productId
            ? {
                ...product,
                isLiked: action === 'like',
                likesCount:
                  (product.likesCount || 0) + (action === 'like' ? 1 : -1),
              }
            : product
        );
      });

      return { previousProduct, previousProducts, productId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(
          ['product', context.productId],
          context.previousProduct
        );
      }
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }

      console.error('Like product error:', error);
      toast.error('Failed to update product like status');
    },
    onSuccess: data => {
      // Revalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      const actionText = data.action === 'like' ? 'liked' : 'unliked';
      toast.success(`Product ${actionText}!`);
    },
  });
};

// Share product mutation
export const useShareProduct = () => {
  return useMutation({
    mutationFn: async ({
      productId,
      method,
    }: {
      productId: string;
      method: 'native' | 'clipboard' | 'social';
    }) => {
      await simulateDelay(200);

      if (isDev) {
        // Mock analytics tracking
        console.log('Share analytics:', {
          productId,
          method,
          timestamp: Date.now(),
        });
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
    onSuccess: data => {
      if (data.method === 'clipboard') {
        toast.success('Product link copied to clipboard!');
      } else {
        toast.success('Product shared successfully!');
      }
    },
    onError: error => {
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
          gameResult: Math.random() > 0.9 ? 'winner' : 'try_again',
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
    onSuccess: data => {
      // Update product play count in cache
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      if (data.gameResult === 'winner') {
        toast.success('Congratulations! You won! 🎉');
      } else {
        toast.success('Game played! Better luck next time! 🎮');
      }
    },
    onError: error => {
      console.error('Play game error:', error);
      toast.error('Failed to play game. Please try again.');
    },
  });
};

// Buy now mutation - opens payment modal instead of redirecting
export const useBuyNow = (options?: { onSuccess?: (data: any) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      await simulateDelay();

      if (isDev) {
        // Mock buy now response - return product data for payment modal
        const products = queryClient.getQueryData(['products']) as any[];
        const product = products?.find(p => p.id === productId);

        return {
          success: true,
          productId,
          quantity,
          product,
          paymentType: 'PRODUCT',
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
    onSuccess: data => {
      // Update product data in cache
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });

      // Success message will be handled by the component that opens the payment modal
      console.log('Buy now initiated for product:', data.productId);

      // Call the custom onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: error => {
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
        console.log('Banner click tracked:', {
          bannerId,
          timestamp: Date.now(),
        });
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
    onError: error => {
      console.error('Banner click tracking error:', error);
      // Don't show error toast for analytics failures
    },
  });
};
