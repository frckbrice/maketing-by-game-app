import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '@/lib/api/vendorService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { GameFormData } from './types';

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      vendorId,
      gameData,
    }: {
      vendorId: string;
      gameData: GameFormData;
    }) => {
      return await vendorService.createGame(vendorId, gameData);
    },
    onMutate: async ({ gameData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vendor-games'] });

      // Snapshot previous value
      const previousGames = queryClient.getQueryData(['vendor-games']);

      // Optimistically update the cache with the new game
      queryClient.setQueryData(['vendor-games'], (old: any) => {
        if (!old) return old;

        const optimisticGame = {
          id: `temp-${Date.now()}`,
          ...gameData,
          status: 'PENDING',
          isActive: false,
          currentParticipants: 0,
          totalPrizePool: gameData.prizes.reduce(
            (sum, prize) => sum + prize.value,
            0
          ),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        return {
          ...old,
          data: [optimisticGame, ...(old.data || [])],
          total: (old.total || 0) + 1,
        };
      });

      return { previousGames };
    },
    onSuccess: gameId => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['vendor-games'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });

      toast.success(
        t('vendor.gameCreatedSuccess') ||
          'Game created successfully! It will be reviewed by admin before going live.'
      );
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousGames) {
        queryClient.setQueryData(['vendor-games'], context.previousGames);
      }

      console.error('Error creating game:', error);
      toast.error(t('vendor.gameCreatedError') || 'Failed to create game');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['vendor-games'] });
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      gameId,
      vendorId,
      gameData,
    }: {
      gameId: string;
      vendorId: string;
      gameData: Partial<GameFormData>;
    }) => {
      return await vendorService.updateGame(gameId, vendorId, gameData);
    },
    onMutate: async ({ gameId, vendorId, gameData }) => {
      await queryClient.cancelQueries({ queryKey: ['vendor-games'] });
      await queryClient.cancelQueries({ queryKey: ['game', gameId] });

      const previousGames = queryClient.getQueryData(['vendor-games']);
      const previousGame = queryClient.getQueryData(['game', gameId]);

      // Optimistically update games list
      queryClient.setQueryData(['vendor-games'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((game: any) =>
            game.id === gameId
              ? { ...game, ...gameData, updatedAt: Date.now() }
              : game
          ),
        };
      });

      // Optimistically update individual game
      queryClient.setQueryData(['game', gameId], (old: any) => {
        if (!old) return old;
        return { ...old, ...gameData, updatedAt: Date.now() };
      });

      return { previousGames, previousGame };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-games'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
      toast.success(
        t('vendor.gameUpdatedSuccess') || 'Game updated successfully!'
      );
    },
    onError: (error, { gameId }, context) => {
      if (context?.previousGames) {
        queryClient.setQueryData(['vendor-games'], context.previousGames);
      }
      if (context?.previousGame) {
        queryClient.setQueryData(['game', gameId], context.previousGame);
      }

      console.error('Error updating game:', error);
      toast.error(t('vendor.gameUpdatedError') || 'Failed to update game');
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      return response.json();
    },
    onMutate: async gameId => {
      await queryClient.cancelQueries({ queryKey: ['vendor-games'] });

      const previousGames = queryClient.getQueryData(['vendor-games']);

      // Optimistically remove the game
      queryClient.setQueryData(['vendor-games'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((game: any) => game.id !== gameId),
          total: Math.max(0, (old.total || 0) - 1),
        };
      });

      return { previousGames };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-games'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-stats'] });
      toast.success(
        t('vendor.gameDeletedSuccess') || 'Game deleted successfully!'
      );
    },
    onError: (error, gameId, context) => {
      if (context?.previousGames) {
        queryClient.setQueryData(['vendor-games'], context.previousGames);
      }

      console.error('Error deleting game:', error);
      toast.error(t('vendor.gameDeletedError') || 'Failed to delete game');
    },
  });
};

export const useSaveGameDraft = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ gameData }: { gameData: Partial<GameFormData> }) => {
      // Save to localStorage for now, implement server-side drafts later
      const draftKey = `game-draft-${Date.now()}`;
      localStorage.setItem(draftKey, JSON.stringify(gameData));
      return draftKey;
    },
    onSuccess: () => {
      toast.success(
        t('vendor.draftSavedSuccess') || 'Game saved as draft successfully!'
      );
    },
    onError: error => {
      console.error('Error saving draft:', error);
      toast.error(t('vendor.draftSavedError') || 'Failed to save draft');
    },
  });
};
