import { useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useGamificationMutations } from '@/components/features/gamification/api';
import { gamificationService } from '@/lib/services/gamificationService';

interface UseGamificationOptions {
  enableAutoStreak?: boolean;
  enableAutoBadgeCheck?: boolean;
}

export const useGamification = (options: UseGamificationOptions = {}) => {
  const { enableAutoStreak = true, enableAutoBadgeCheck = true } = options;
  const { user } = useAuth();
  const { updateStreak, checkBadges } = useGamificationMutations(user?.id);

  // Auto-update daily streak on user activity
  useEffect(() => {
    if (user?.id && enableAutoStreak && !updateStreak.isPending) {
      updateStreak.mutate();
    }
  }, [user?.id, enableAutoStreak]);

  // Award points for game play
  const awardGamePlayPoints = useCallback(async (
    gameId: string, 
    isWin: boolean = false
  ) => {
    if (!user?.id) return;

    try {
      const basePoints = isWin ? 50 : 25; // Winners get more points
      await gamificationService.awardPoints(
        user.id,
        basePoints,
        'EARNED_GAME_PLAY',
        `Game played: ${isWin ? 'Won' : 'Played'}`,
        gameId,
        'GAME'
      );

      // Update referral progress
      const loyaltyProfile = await gamificationService.getUserLoyaltyProfile(user.id);
      if (loyaltyProfile) {
        await gamificationService.updateReferralProgress(
          user.id, 
          loyaltyProfile.lifetimeGamesPlayed + 1
        );
      }

      // Check for new badges after game play
      if (enableAutoBadgeCheck && !checkBadges.isPending) {
        checkBadges.mutate();
      }
    } catch (error) {
      console.error('Error awarding game play points:', error);
    }
  }, [user?.id, enableAutoBadgeCheck, checkBadges]);

  // Award points for purchases/orders
  const awardPurchasePoints = useCallback(async (
    orderId: string,
    amount: number
  ) => {
    if (!user?.id) return;

    try {
      // 1 point per dollar spent
      const points = Math.floor(amount);
      await gamificationService.awardPoints(
        user.id,
        points,
        'EARNED_PURCHASE',
        `Purchase reward: $${amount}`,
        orderId,
        'ORDER'
      );

      // Check for new badges after purchase
      if (enableAutoBadgeCheck && !checkBadges.isPending) {
        checkBadges.mutate();
      }
    } catch (error) {
      console.error('Error awarding purchase points:', error);
    }
  }, [user?.id, enableAutoBadgeCheck, checkBadges]);

  // Manual badge check trigger
  const triggerBadgeCheck = useCallback(() => {
    if (user?.id && !checkBadges.isPending) {
      checkBadges.mutate();
    }
  }, [user?.id, checkBadges]);

  // Manual streak update
  const triggerStreakUpdate = useCallback(() => {
    if (user?.id && !updateStreak.isPending) {
      updateStreak.mutate();
    }
  }, [user?.id, updateStreak]);

  return {
    awardGamePlayPoints,
    awardPurchasePoints,
    triggerBadgeCheck,
    triggerStreakUpdate,
    isUpdatingStreak: updateStreak.isPending,
    isCheckingBadges: checkBadges.isPending,
  };
};