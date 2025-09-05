import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from './data';

// Join Game Mutation with optimistic updates
export const useJoinGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      ticketCount = 1,
    }: {
      gameId: string;
      ticketCount?: number;
    }) => {
      // Cache first: Check if we have cached user data
      const cachedUserGames = queryClient.getQueryData(['user-games']);

      // TODO: Real API call to Firebase
      // const response = await gameService.joinGame(gameId, ticketCount);

      // Fallback for development
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        gameId,
        ticketCount,
        timestamp: Date.now(),
      };
    },
    onMutate: async ({ gameId, ticketCount }) => {
      // Optimistic update: Update cache immediately
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.games });

      const previousGames = queryClient.getQueryData(QUERY_KEYS.games);

      // Optimistically update game participants
      queryClient.setQueryData(QUERY_KEYS.games, (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((game: any) =>
            game.id === gameId
              ? {
                  ...game,
                  currentParticipants: game.currentParticipants + ticketCount,
                }
              : game
          ),
        };
      });

      return { previousGames };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousGames) {
        queryClient.setQueryData(QUERY_KEYS.games, context.previousGames);
      }

      console.error('Failed to join game:', error);
      toast.error('Failed to join game. Please try again.');
    },
    onSuccess: data => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featuredGames });
      queryClient.invalidateQueries({ queryKey: ['user-games'] });

      toast.success(
        `Successfully joined game! Purchased ${data.ticketCount} ticket(s).`
      );
    },
  });
};

// Share Game Mutation
export const useShareGame = () => {
  return useMutation({
    mutationFn: async ({
      gameId,
      platform,
    }: {
      gameId: string;
      platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy';
    }) => {
      const gameUrl = `${window.location.origin}/games/${gameId}`;

      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(gameUrl);
          break;
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(gameUrl)}&text=Check out this amazing lottery game!`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`Check out this game: ${gameUrl}`)}`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
      }

      return { success: true, gameId, platform };
    },
    onSuccess: data => {
      const message =
        data.platform === 'copy'
          ? 'Game link copied to clipboard!'
          : 'Game shared successfully!';
      toast.success(message);
    },
    onError: error => {
      console.error('Failed to share game:', error);
      toast.error('Failed to share game. Please try again.');
    },
  });
};
