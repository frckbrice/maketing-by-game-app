import { firestoreService } from '@/lib/firebase/client-services';
import type { Winner as CoreWinner } from '@/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getMockWinners } from './data';
import type { Winner, WinnersResponse, WinnerStats } from './types';

// Query keys
export const winnerQueryKeys = {
  all: ['winners'] as const,
  winners: (period: string, page: number) => ['winners', period, page] as const,
  winner: (id: string) => ['winners', id] as const,
  stats: ['winners', 'stats'] as const,
  announcements: ['winners', 'announcements'] as const,
  leaderboard: (period: string) => ['winners', 'leaderboard', period] as const,
  byGame: (gameId: string) => ['winners', 'game', gameId] as const,
  byUser: (userId: string) => ['winners', 'user', userId] as const,
};

// Constants
const WINNERS_PER_PAGE = 12;
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

// Helper function to filter winners by period
const filterWinnersByPeriod = (
  winners: CoreWinner[],
  period: string
): CoreWinner[] => {
  if (period === 'all') return winners;

  const currentDate = new Date();
  return winners.filter(winner => {
    const winnerDate = new Date(winner.createdAt);
    switch (period) {
      case 'monthly':
        return (
          winnerDate.getMonth() === currentDate.getMonth() &&
          winnerDate.getFullYear() === currentDate.getFullYear()
        );
      case 'weekly': {
        const weekAgo = new Date(
          currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        return winnerDate >= weekAgo;
      }
      case 'daily':
        return winnerDate.toDateString() === currentDate.toDateString();
      default:
        return true;
    }
  });
};

// Helper function to convert CoreWinner to detailed Winner
const enrichWinnerData = async (winner: CoreWinner): Promise<Winner> => {
  try {
    // Convert to detailed winner format (CoreWinner -> Winner)
    const detailedWinner: Winner = {
      id: winner.id,
      userId: winner.userId,
      gameId: winner.gameId,
      ticketId: `ticket_${winner.id}`,
      prizeId: winner.productId || `prize_${winner.id}`,
      prizeType: winner.prize.toLowerCase().includes('cash')
        ? 'CASH'
        : 'PRODUCT',
      prizeValue: winner.prizeValue,
      currency: winner.currency,
      prizeName: winner.prize,
      prizeDescription: winner.prize,
      prizeImage: undefined,
      isClaimed: winner.status === 'CLAIMED' || winner.status === 'DELIVERED',
      claimedAt: winner.claimedAt,
      claimMethod: winner.status === 'PENDING' ? undefined : 'AUTOMATIC',
      status:
        winner.status === 'DELIVERED'
          ? 'DELIVERED'
          : winner.status === 'CLAIMED'
            ? 'CLAIMED'
            : 'PENDING',
      createdAt: winner.createdAt,
      updatedAt: winner.updatedAt,
    };

    return detailedWinner;
  } catch (error) {
    console.error('Error enriching winner data:', error);
    // Return basic winner data if enrichment fails
    return {
      id: winner.id,
      userId: winner.userId,
      gameId: winner.gameId,
      ticketId: `ticket_${winner.id}`,
      prizeId: winner.productId || `prize_${winner.id}`,
      prizeType: 'PRODUCT',
      prizeValue: winner.prizeValue,
      currency: winner.currency,
      prizeName: winner.prize,
      prizeDescription: winner.prize,
      isClaimed: winner.status !== 'PENDING',
      claimMethod: 'AUTOMATIC',
      status:
        winner.status === 'DELIVERED'
          ? 'DELIVERED'
          : winner.status === 'CLAIMED'
            ? 'CLAIMED'
            : 'PENDING',
      createdAt: winner.createdAt,
      updatedAt: winner.updatedAt,
    };
  }
};

// Main winners query hook with pagination
export const useWinners = (period: string = 'all', page: number = 1) => {
  return useQuery({
    queryKey: winnerQueryKeys.winners(period, page),
    queryFn: async (): Promise<WinnersResponse> => {
      try {
        // Fetch winners from Firestore
        const coreWinners = await firestoreService.getWinners();

        // Filter by period
        const filteredWinners = filterWinnersByPeriod(coreWinners, period);

        // Sort by creation date (newest first)
        const sortedWinners = filteredWinners.sort(
          (a, b) => b.createdAt - a.createdAt
        );

        // Calculate pagination
        const startIndex = (page - 1) * WINNERS_PER_PAGE;
        const endIndex = startIndex + WINNERS_PER_PAGE;
        const paginatedWinners = sortedWinners.slice(startIndex, endIndex);

        // Enrich winner data with user and game details
        const enrichedWinners = await Promise.all(
          paginatedWinners.map(enrichWinnerData)
        );

        const detailedWinners: WinnersResponse['data'] = enrichedWinners.map(
          winner => ({
            ...winner,
            user: {
              firstName: 'User',
              lastName: `${winner.userId.slice(-4)}`,
              email: 'user@example.com',
            },
            game: {
              title: `Game ${winner.gameId.slice(-4)}`,
              category: 'Electronics',
              endDate: winner.createdAt,
            },
            ticket: {
              ticketNumber: winner.ticketId.slice(-8).toUpperCase(),
              purchaseDate: winner.createdAt,
            },
          })
        );

        return {
          data: detailedWinners,
          total: filteredWinners.length,
          page,
          limit: WINNERS_PER_PAGE,
          hasMore: endIndex < filteredWinners.length,
        };
      } catch (error) {
        console.error('Error fetching winners:', error);

        // Fallback to mock data on error
        if (page === 1) {
          const mockWinners = getMockWinners();
          const mockWinnersWithDetails = mockWinners.map(winner => ({
            ...winner,
            user: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              avatar: '/images/default-avatar.png',
            },
            game: {
              title: 'Tech Lottery 2024',
              category: 'Technology',
              endDate: Date.now() + 86400000, // 1 day from now
            },
            ticket: {
              ticketNumber: `TKT-${winner.ticketId}`,
              purchaseDate: winner.createdAt,
            },
          }));
          return {
            data: mockWinnersWithDetails.slice(0, WINNERS_PER_PAGE),
            total: mockWinnersWithDetails.length,
            page: 1,
            limit: WINNERS_PER_PAGE,
            hasMore: mockWinnersWithDetails.length > WINNERS_PER_PAGE,
          };
        }

        throw error;
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Infinite winners query hook for infinite scroll
export const useInfiniteWinners = (period: string = 'all') => {
  return useInfiniteQuery({
    queryKey: ['winners', 'infinite', period],
    queryFn: async ({ pageParam = 1 }) => {
      // Create a temporary query function for this specific call
      const tempQueryFn = async (): Promise<WinnersResponse> => {
        try {
          const coreWinners = await firestoreService.getWinners();
          const filteredWinners = filterWinnersByPeriod(coreWinners, period);
          const sortedWinners = filteredWinners.sort(
            (a, b) => b.createdAt - a.createdAt
          );

          const startIndex = (pageParam - 1) * WINNERS_PER_PAGE;
          const endIndex = startIndex + WINNERS_PER_PAGE;
          const paginatedWinners = sortedWinners.slice(startIndex, endIndex);

          const enrichedWinners = await Promise.all(
            paginatedWinners.map(enrichWinnerData)
          );

          const detailedWinners: WinnersResponse['data'] = enrichedWinners.map(
            winner => ({
              ...winner,
              user: {
                firstName: 'User',
                lastName: `${winner.userId.slice(-4)}`,
                email: 'user@example.com',
              },
              game: {
                title: `Game ${winner.gameId.slice(-4)}`,
                category: 'Electronics',
                endDate: winner.createdAt,
              },
              ticket: {
                ticketNumber: winner.ticketId.slice(-8).toUpperCase(),
                purchaseDate: winner.createdAt,
              },
            })
          );

          return {
            data: detailedWinners,
            total: filteredWinners.length,
            page: pageParam,
            limit: WINNERS_PER_PAGE,
            hasMore: endIndex < filteredWinners.length,
          };
        } catch (error) {
          console.error('Error fetching winners:', error);
          throw error;
        }
      };

      return tempQueryFn();
    },
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

// All winners query hook (for admin purposes)
export const useAllWinners = () => {
  return useQuery({
    queryKey: winnerQueryKeys.all,
    queryFn: async (): Promise<Winner[]> => {
      try {
        const coreWinners = await firestoreService.getWinners();

        // Convert to detailed winners
        const detailedWinners = await Promise.all(
          coreWinners.map(enrichWinnerData)
        );

        return detailedWinners;
      } catch (error) {
        console.error('Error fetching all winners:', error);
        // Fallback to mock data
        const mockWinners = getMockWinners();
        return mockWinners.map(winner => ({
          ...winner,
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            avatar: '/images/default-avatar.png',
          },
          game: {
            title: 'Tech Lottery 2024',
            category: 'Technology',
            endDate: Date.now() + 86400000,
          },
          ticket: {
            ticketNumber: `TKT-${winner.ticketId}`,
            purchaseDate: winner.createdAt,
          },
        }));
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
};

// Winner details query hook
export const useWinner = (id: string) => {
  return useQuery({
    queryKey: winnerQueryKeys.winner(id),
    queryFn: async (): Promise<Winner | null> => {
      if (!id) return null;

      try {
        const coreWinners = await firestoreService.getWinners();
        const coreWinner = coreWinners.find(winner => winner.id === id);

        if (!coreWinner) return null;

        return await enrichWinnerData(coreWinner);
      } catch (error) {
        console.error('Error fetching winner:', error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
};

// Winner statistics query hook
export const useWinnerStats = () => {
  return useQuery({
    queryKey: winnerQueryKeys.stats,
    queryFn: async (): Promise<WinnerStats> => {
      try {
        const coreWinners = await firestoreService.getWinners();

        const totalWinners = coreWinners.length;
        const totalPrizeValue = coreWinners.reduce(
          (sum, winner) => sum + winner.prizeValue,
          0
        );
        const averagePrizeValue =
          totalWinners > 0 ? totalPrizeValue / totalWinners : 0;
        const topPrizeValue = Math.max(
          ...coreWinners.map(w => w.prizeValue),
          0
        );

        // Calculate winners this month
        const currentDate = new Date();
        const winnersThisMonth = coreWinners.filter(winner => {
          const winnerDate = new Date(winner.createdAt);
          return (
            winnerDate.getMonth() === currentDate.getMonth() &&
            winnerDate.getFullYear() === currentDate.getFullYear()
          );
        }).length;

        // Calculate winners this year
        const winnersThisYear = coreWinners.filter(winner => {
          const winnerDate = new Date(winner.createdAt);
          return winnerDate.getFullYear() === currentDate.getFullYear();
        }).length;

        // Calculate prize distribution by type
        const prizeDistribution = coreWinners.reduce(
          (acc, winner) => {
            const prizeType = winner.prize.toLowerCase().includes('cash')
              ? 'Cash'
              : 'Product';
            const existing = acc.find(p => p.prizeType === prizeType);
            if (existing) {
              existing.count++;
              existing.totalValue += winner.prizeValue;
            } else {
              acc.push({
                prizeType,
                count: 1,
                totalValue: winner.prizeValue,
                percentage: 0,
              });
            }
            return acc;
          },
          [] as Array<{
            prizeType: string;
            count: number;
            totalValue: number;
            percentage: number;
          }>
        );

        // Calculate percentages
        prizeDistribution.forEach(p => {
          p.percentage = totalWinners > 0 ? (p.count / totalWinners) * 100 : 0;
        });

        // Calculate category winners (mock for now)
        const categoryWinners = [
          {
            category: 'Electronics',
            winnerCount: Math.floor(totalWinners * 0.4),
            totalPrizeValue: totalPrizeValue * 0.5,
            averagePrizeValue: 0,
          },
          {
            category: 'Fashion',
            winnerCount: Math.floor(totalWinners * 0.3),
            totalPrizeValue: totalPrizeValue * 0.3,
            averagePrizeValue: 0,
          },
          {
            category: 'Home & Garden',
            winnerCount: Math.floor(totalWinners * 0.2),
            totalPrizeValue: totalPrizeValue * 0.15,
            averagePrizeValue: 0,
          },
          {
            category: 'Sports',
            winnerCount: Math.floor(totalWinners * 0.1),
            totalPrizeValue: totalPrizeValue * 0.05,
            averagePrizeValue: 0,
          },
        ];

        // Calculate average prize values for categories
        categoryWinners.forEach(c => {
          c.averagePrizeValue =
            c.winnerCount > 0 ? c.totalPrizeValue / c.winnerCount : 0;
        });

        return {
          totalWinners,
          totalPrizeValue,
          averagePrizeValue,
          topPrizeValue,
          winnersThisMonth,
          winnersThisYear,
          prizeDistribution,
          categoryWinners,
        };
      } catch (error) {
        console.error('Error fetching winner stats:', error);
        // Return default stats
        return {
          totalWinners: 0,
          totalPrizeValue: 0,
          averagePrizeValue: 0,
          topPrizeValue: 0,
          winnersThisMonth: 0,
          winnersThisYear: 0,
          prizeDistribution: [],
          categoryWinners: [],
        };
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Winners by game query hook
export const useWinnersByGame = (gameId: string) => {
  return useQuery({
    queryKey: winnerQueryKeys.byGame(gameId),
    queryFn: async (): Promise<Winner[]> => {
      if (!gameId) return [];

      try {
        const coreWinners = await firestoreService.getWinners(gameId);

        // Convert to detailed winners
        const detailedWinners = await Promise.all(
          coreWinners.map(enrichWinnerData)
        );

        return detailedWinners.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.error('Error fetching winners by game:', error);
        return [];
      }
    },
    enabled: !!gameId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
};

// Winners by user query hook
export const useWinnersByUser = (userId: string) => {
  return useQuery({
    queryKey: winnerQueryKeys.byUser(userId),
    queryFn: async (): Promise<Winner[]> => {
      if (!userId) return [];

      try {
        const coreWinners = await firestoreService.getWinners();
        const userWinners = coreWinners.filter(
          winner => winner.userId === userId
        );

        // Convert to detailed winners
        const detailedWinners = await Promise.all(
          userWinners.map(enrichWinnerData)
        );

        return detailedWinners.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.error('Error fetching winners by user:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
};

// Winner announcements query hook
export const useWinnerAnnouncements = (
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: [...winnerQueryKeys.announcements, page, limit],
    queryFn: async () => {
      try {
        // For now, return empty array since announcements are separate feature
        return {
          data: [],
          total: 0,
          page,
          limit,
          hasMore: false,
        };
      } catch (error) {
        console.error('Error fetching winner announcements:', error);
        return {
          data: [],
          total: 0,
          page,
          limit,
          hasMore: false,
        };
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
};

// Recent winners query hook (for home page display)
export const useRecentWinners = (limit: number = 5) => {
  return useQuery({
    queryKey: ['winners', 'recent', limit],
    queryFn: async (): Promise<Winner[]> => {
      try {
        const coreWinners = await firestoreService.getWinners();

        // Sort by creation date and take latest
        const recentWinners = coreWinners
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit);

        // Convert to detailed winners
        const detailedWinners = await Promise.all(
          recentWinners.map(enrichWinnerData)
        );

        return detailedWinners;
      } catch (error) {
        console.error('Error fetching recent winners:', error);
        // Fallback to mock data
        const mockWinners = getMockWinners();
        return mockWinners.slice(0, limit).map(winner => ({
          ...winner,
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            avatar: '/images/default-avatar.png',
          },
          game: {
            title: 'Tech Lottery 2024',
            category: 'Technology',
            endDate: Date.now() + 86400000,
          },
          ticket: {
            ticketNumber: `TKT-${winner.ticketId}`,
            purchaseDate: winner.createdAt,
          },
        }));
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for recent winners
  });
};
