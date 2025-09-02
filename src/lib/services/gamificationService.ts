import { adminFirestore } from '@/lib/firebase/admin';
import { 
  UserLoyaltyProfile, 
  LoyaltyPointTransaction, 
  LoyaltyPointTransactionType,
  Referral,
  UserReferralProfile,
  DailyStreak,
  Badge,
  UserBadge,
  LoyaltyLevel,
  UserRedemption,
  GamificationNotification
} from '@/types';

class GamificationService {
  // Loyalty Points Management
  async getUserLoyaltyProfile(userId: string): Promise<UserLoyaltyProfile | null> {
    try {
      const doc = await adminFirestore
        .collection('userLoyaltyProfiles')
        .doc(userId)
        .get();
      
      if (!doc.exists) {
        return await this.createDefaultLoyaltyProfile(userId);
      }
      
      return { id: doc.id, ...doc.data() } as UserLoyaltyProfile;
    } catch (error) {
      console.error('Error fetching user loyalty profile:', error);
      return null;
    }
  }

  async createDefaultLoyaltyProfile(userId: string): Promise<UserLoyaltyProfile> {
    const profile: Omit<UserLoyaltyProfile, 'id'> = {
      userId,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      currentBalance: 0,
      pointsExpiring30Days: 0,
      consecutiveDaysStreak: 0,
      longestStreak: 0,
      lastLoginDate: Date.now(),
      level: 1,
      levelName: 'Bronze',
      nextLevelThreshold: 1000,
      lifetimeGamesPlayed: 0,
      lifetimeReferrals: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await adminFirestore
      .collection('userLoyaltyProfiles')
      .doc(userId)
      .set(profile);

    return { id: userId, ...profile };
  }

  async awardPoints(
    userId: string,
    points: number,
    type: LoyaltyPointTransactionType,
    description: string,
    referenceId?: string,
    referenceType?: 'GAME' | 'ORDER' | 'REFERRAL' | 'DAILY_LOGIN' | 'STREAK'
  ): Promise<boolean> {
    try {
      const batch = adminFirestore.batch();
      
      // Create points transaction
      const transactionRef = adminFirestore.collection('loyaltyPointTransactions').doc();
      const transaction: Omit<LoyaltyPointTransaction, 'id'> = {
        userId,
        type,
        points,
        description,
        referenceId,
        referenceType,
        createdAt: Date.now(),
      };
      
      // Set expiration for earned points (1 year)
      if (points > 0) {
        transaction.expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
      }
      
      batch.set(transactionRef, transaction);
      
      // Update user loyalty profile
      const profileRef = adminFirestore.collection('userLoyaltyProfiles').doc(userId);
      const profileDoc = await profileRef.get();
      
      let profile = profileDoc.exists 
        ? { id: profileDoc.id, ...profileDoc.data() } as UserLoyaltyProfile
        : await this.createDefaultLoyaltyProfile(userId);

      const updatedBalance = profile.currentBalance + points;
      const updatedTotalEarned = points > 0 ? profile.totalPointsEarned + points : profile.totalPointsEarned;
      const updatedTotalSpent = points < 0 ? profile.totalPointsSpent + Math.abs(points) : profile.totalPointsSpent;
      
      // Check for level up
      const newLevel = await this.calculateUserLevel(updatedTotalEarned);
      const leveledUp = newLevel.level > profile.level;
      
      const updatedProfile = {
        ...profile,
        currentBalance: updatedBalance,
        totalPointsEarned: updatedTotalEarned,
        totalPointsSpent: updatedTotalSpent,
        level: newLevel.level,
        levelName: newLevel.name,
        nextLevelThreshold: newLevel.nextThreshold,
        updatedAt: Date.now(),
      };

      batch.update(profileRef, updatedProfile);

      // Create notification for points earned
      if (points > 0) {
        const notificationRef = adminFirestore.collection('gamificationNotifications').doc();
        const notification: Omit<GamificationNotification, 'id'> = {
          userId,
          type: 'POINTS_EARNED',
          title: `+${points} Points Earned!`,
          message: description,
          points,
          isRead: false,
          createdAt: Date.now(),
        };
        batch.set(notificationRef, notification);
      }

      // Create level up notification
      if (leveledUp) {
        const levelNotificationRef = adminFirestore.collection('gamificationNotifications').doc();
        const levelNotification: Omit<GamificationNotification, 'id'> = {
          userId,
          type: 'LEVEL_UP',
          title: `Level Up! You're now ${newLevel.name}!`,
          message: `Congratulations! You've reached level ${newLevel.level}.`,
          level: newLevel.level,
          isRead: false,
          createdAt: Date.now(),
        };
        batch.set(levelNotificationRef, levelNotification);
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  }

  async calculateUserLevel(totalPoints: number): Promise<{ level: number; name: string; nextThreshold: number }> {
    const levels = [
      { level: 1, name: 'Bronze', minPoints: 0, nextThreshold: 1000 },
      { level: 2, name: 'Silver', minPoints: 1000, nextThreshold: 2500 },
      { level: 3, name: 'Gold', minPoints: 2500, nextThreshold: 5000 },
      { level: 4, name: 'Platinum', minPoints: 5000, nextThreshold: 10000 },
      { level: 5, name: 'Diamond', minPoints: 10000, nextThreshold: 25000 },
      { level: 6, name: 'Elite', minPoints: 25000, nextThreshold: 50000 },
      { level: 7, name: 'Legend', minPoints: 50000, nextThreshold: Number.MAX_SAFE_INTEGER },
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalPoints >= levels[i].minPoints) {
        return levels[i];
      }
    }
    
    return levels[0]; // Default to Bronze
  }

  // Daily Streak Management
  async updateDailyStreak(userId: string): Promise<{ streakUpdated: boolean; pointsAwarded: number }> {
    try {
      const streakRef = adminFirestore.collection('dailyStreaks').doc(userId);
      const streakDoc = await streakRef.get();
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      let streak: DailyStreak;
      let pointsAwarded = 0;
      
      if (!streakDoc.exists) {
        // Create new streak
        streak = {
          id: userId,
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: Date.now(),
          streakBonuses: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        pointsAwarded = await this.awardStreakBonus(userId, 1);
      } else {
        streak = { id: streakDoc.id, ...streakDoc.data() } as DailyStreak;
        const lastLoginDay = new Date(streak.lastLoginDate).toDateString();
        
        if (lastLoginDay === today) {
          // Already logged in today
          return { streakUpdated: false, pointsAwarded: 0 };
        }
        
        if (lastLoginDay === yesterday) {
          // Consecutive day - increase streak
          streak.currentStreak += 1;
          streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
          pointsAwarded = await this.awardStreakBonus(userId, streak.currentStreak);
        } else {
          // Streak broken - reset
          streak.currentStreak = 1;
        }
        
        streak.lastLoginDate = Date.now();
        streak.updatedAt = Date.now();
      }

      await streakRef.set(streak);
      
      // Award daily login points
      if (pointsAwarded > 0) {
        await this.awardPoints(
          userId,
          pointsAwarded,
          'EARNED_DAILY_LOGIN',
          `Daily login streak: ${streak.currentStreak} days`,
          undefined,
          'DAILY_LOGIN'
        );
      }

      return { streakUpdated: true, pointsAwarded };
    } catch (error) {
      console.error('Error updating daily streak:', error);
      return { streakUpdated: false, pointsAwarded: 0 };
    }
  }

  private async awardStreakBonus(userId: string, streakDays: number): Promise<number> {
    // Bonus points for consecutive days
    const bonusPoints = Math.min(streakDays * 10, 100); // Cap at 100 points
    
    // Special milestones
    if (streakDays === 7) return 150; // Weekly bonus
    if (streakDays === 30) return 500; // Monthly bonus
    if (streakDays === 100) return 1000; // 100-day milestone
    
    return bonusPoints;
  }

  // Referral System
  async generateReferralCode(userId: string): Promise<string> {
    const code = `REF${userId.slice(-6).toUpperCase()}${Date.now().toString().slice(-4)}`;
    
    // Check if user already has a referral profile
    const profileRef = adminFirestore.collection('userReferralProfiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      const profile: Omit<UserReferralProfile, 'id'> = {
        userId,
        personalReferralCode: code,
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalRewardsEarned: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await profileRef.set(profile);
    }
    
    return code;
  }

  async processReferral(referralCode: string, newUserId: string): Promise<boolean> {
    try {
      // Find the referrer by referral code
      const referralProfilesSnapshot = await adminFirestore
        .collection('userReferralProfiles')
        .where('personalReferralCode', '==', referralCode)
        .limit(1)
        .get();

      if (referralProfilesSnapshot.empty) {
        return false; // Invalid referral code
      }

      const referrerProfile = referralProfilesSnapshot.docs[0];
      const referrerId = referrerProfile.data().userId;

      // Check if this user was already referred
      const existingReferralSnapshot = await adminFirestore
        .collection('referrals')
        .where('refereeId', '==', newUserId)
        .limit(1)
        .get();

      if (!existingReferralSnapshot.empty) {
        return false; // User already referred
      }

      // Create referral record
      const referralRef = adminFirestore.collection('referrals').doc();
      const referral: Omit<Referral, 'id'> = {
        referrerId,
        refereeId: newUserId,
        referralCode,
        status: 'PENDING',
        rewardClaimed: false,
        refereeGamesPlayed: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await referralRef.set(referral);

      // Update referrer's profile
      await adminFirestore.collection('userReferralProfiles').doc(referrerId).update({
        totalReferrals: adminFirestore.FieldValue.increment(1),
        pendingReferrals: adminFirestore.FieldValue.increment(1),
        lastReferralAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Award initial referral points to referrer (signup bonus)
      await this.awardPoints(
        referrerId,
        100,
        'EARNED_REFERRAL',
        'Friend signed up with your referral code',
        referralRef.id,
        'REFERRAL'
      );

      return true;
    } catch (error) {
      console.error('Error processing referral:', error);
      return false;
    }
  }

  async updateReferralProgress(userId: string, gamesPlayed: number): Promise<void> {
    try {
      // Find referral record where this user is the referee
      const referralSnapshot = await adminFirestore
        .collection('referrals')
        .where('refereeId', '==', userId)
        .where('status', '==', 'PENDING')
        .limit(1)
        .get();

      if (referralSnapshot.empty) return;

      const referralDoc = referralSnapshot.docs[0];
      const referral = { id: referralDoc.id, ...referralDoc.data() } as Referral;

      // Update games played
      await referralDoc.ref.update({
        refereeGamesPlayed: gamesPlayed,
        updatedAt: Date.now(),
      });

      // Check if referral should be completed (referee played 3+ games)
      if (gamesPlayed >= 3 && referral.status === 'PENDING') {
        await this.completeReferral(referral.id);
      }
    } catch (error) {
      console.error('Error updating referral progress:', error);
    }
  }

  private async completeReferral(referralId: string): Promise<void> {
    try {
      const referralRef = adminFirestore.collection('referrals').doc(referralId);
      const referralDoc = await referralRef.get();
      
      if (!referralDoc.exists) return;
      
      const referral = { id: referralDoc.id, ...referralDoc.data() } as Referral;
      
      // Mark referral as completed
      await referralRef.update({
        status: 'COMPLETED',
        completedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update referrer's profile
      await adminFirestore.collection('userReferralProfiles').doc(referral.referrerId).update({
        successfulReferrals: adminFirestore.FieldValue.increment(1),
        pendingReferrals: adminFirestore.FieldValue.increment(-1),
        totalRewardsEarned: adminFirestore.FieldValue.increment(300),
        updatedAt: Date.now(),
      });

      // Award completion bonus to referrer
      await this.awardPoints(
        referral.referrerId,
        300,
        'EARNED_REFERRAL',
        'Referral completed! Your friend played 3+ games',
        referralId,
        'REFERRAL'
      );

      // Award bonus to referee as well
      await this.awardPoints(
        referral.refereeId,
        150,
        'EARNED_REFERRAL',
        'Welcome bonus for being referred!',
        referralId,
        'REFERRAL'
      );
    } catch (error) {
      console.error('Error completing referral:', error);
    }
  }

  // Badge System
  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    try {
      const loyaltyProfile = await this.getUserLoyaltyProfile(userId);
      if (!loyaltyProfile) return [];

      // Get all active badges
      const badgesSnapshot = await adminFirestore
        .collection('badges')
        .where('isActive', '==', true)
        .get();

      const badges = badgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Badge[];

      // Get user's current badges
      const userBadgesSnapshot = await adminFirestore
        .collection('userBadges')
        .where('userId', '==', userId)
        .get();

      const earnedBadgeIds = new Set(
        userBadgesSnapshot.docs.map(doc => doc.data().badgeId)
      );

      const newBadges: UserBadge[] = [];

      for (const badge of badges) {
        if (earnedBadgeIds.has(badge.id)) continue; // Already earned

        let qualified = false;

        // Check requirements
        if (badge.requirements.gamesPlayed && loyaltyProfile.lifetimeGamesPlayed >= badge.requirements.gamesPlayed) {
          qualified = true;
        }
        
        if (badge.requirements.totalSpent && loyaltyProfile.totalPointsEarned >= badge.requirements.totalSpent) {
          qualified = true;
        }

        if (badge.requirements.referrals) {
          const referralProfile = await this.getUserReferralProfile(userId);
          if (referralProfile && referralProfile.successfulReferrals >= badge.requirements.referrals) {
            qualified = true;
          }
        }

        if (badge.requirements.consecutiveDays) {
          const streak = await this.getUserDailyStreak(userId);
          if (streak && streak.longestStreak >= badge.requirements.consecutiveDays) {
            qualified = true;
          }
        }

        if (qualified) {
          // Award badge
          const userBadgeRef = adminFirestore.collection('userBadges').doc();
          const userBadge: Omit<UserBadge, 'id'> = {
            userId,
            badgeId: badge.id,
            earnedAt: Date.now(),
          };

          await userBadgeRef.set(userBadge);
          
          // Award points for earning badge
          await this.awardPoints(
            userId,
            badge.rewardPoints,
            'EARNED_PURCHASE', // Using existing type
            `Badge earned: ${badge.name}`,
            badge.id
          );

          // Create notification
          const notificationRef = adminFirestore.collection('gamificationNotifications').doc();
          const notification: Omit<GamificationNotification, 'id'> = {
            userId,
            type: 'BADGE_EARNED',
            title: `Badge Earned: ${badge.name}!`,
            message: badge.description,
            badgeId: badge.id,
            points: badge.rewardPoints,
            isRead: false,
            createdAt: Date.now(),
          };
          await notificationRef.set(notification);

          newBadges.push({ id: userBadgeRef.id, ...userBadge });
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return [];
    }
  }

  // Helper methods
  async getUserReferralProfile(userId: string): Promise<UserReferralProfile | null> {
    try {
      const doc = await adminFirestore
        .collection('userReferralProfiles')
        .doc(userId)
        .get();
      
      return doc.exists ? { id: doc.id, ...doc.data() } as UserReferralProfile : null;
    } catch (error) {
      console.error('Error fetching user referral profile:', error);
      return null;
    }
  }

  async getUserDailyStreak(userId: string): Promise<DailyStreak | null> {
    try {
      const doc = await adminFirestore
        .collection('dailyStreaks')
        .doc(userId)
        .get();
      
      return doc.exists ? { id: doc.id, ...doc.data() } as DailyStreak : null;
    } catch (error) {
      console.error('Error fetching user daily streak:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit = 20): Promise<GamificationNotification[]> {
    try {
      const snapshot = await adminFirestore
        .collection('gamificationNotifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GamificationNotification[];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await adminFirestore
        .collection('gamificationNotifications')
        .doc(notificationId)
        .update({ isRead: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
}

export const gamificationService = new GamificationService();