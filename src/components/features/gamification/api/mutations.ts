import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  AwardPointsRequest,
  GenerateReferralCodeRequest,
  ApplyReferralRequest,
  MarkNotificationReadRequest,
  LoyaltyProfileResponse,
  ReferralProfileResponse,
  StreakResponse,
  BadgesResponse
} from './types';

const API_BASE = '/api/gamification';

const postWithAuth = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

const patchWithAuth = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export const useGamificationMutations = (userId?: string) => {
  const queryClient = useQueryClient();

  const awardPointsMutation = useMutation({
    mutationFn: (data: AwardPointsRequest): Promise<LoyaltyProfileResponse> =>
      postWithAuth(`${API_BASE}/loyalty`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'loyalty', userId] });
      if (data.success && data.profile) {
        toast.success(`${data.profile.currentBalance} points awarded!`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to award points');
    },
  });

  const generateReferralCodeMutation = useMutation({
    mutationFn: (data: GenerateReferralCodeRequest) =>
      postWithAuth(`${API_BASE}/referrals`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'referrals', userId] });
      if (data.success && data.referralCode) {
        toast.success('Referral code generated!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate referral code');
    },
  });

  const applyReferralMutation = useMutation({
    mutationFn: (data: ApplyReferralRequest) =>
      postWithAuth(`${API_BASE}/referrals`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'referrals', userId] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'loyalty', userId] });
      if (data.success) {
        toast.success(data.message || 'Referral applied successfully!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to apply referral code');
    },
  });

  const updateStreakMutation = useMutation({
    mutationFn: (): Promise<StreakResponse> =>
      postWithAuth(`${API_BASE}/streak`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'loyalty', userId] });
      
      if (data.success && data.streakUpdated && data.pointsAwarded && data.pointsAwarded > 0) {
        toast.success(`Daily streak updated! +${data.pointsAwarded} points earned`);
      }
    },
    onError: (error: Error) => {
      console.error('Streak update error:', error);
      // Don't show error toast for streak updates as they should be silent
    },
  });

  const checkBadgesMutation = useMutation({
    mutationFn: (): Promise<BadgesResponse> =>
      postWithAuth(`${API_BASE}/badges`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'badges', userId] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'notifications', userId] });
      
      if (data.success && data.newBadges && data.newBadges.length > 0) {
        toast.success(`🎉 You earned ${data.newBadges.length} new badge(s)!`);
      }
    },
    onError: (error: Error) => {
      console.error('Badge check error:', error);
      // Silent error for badge checks
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (data: MarkNotificationReadRequest) =>
      patchWithAuth(`${API_BASE}/notifications`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'notifications', userId] });
    },
    onError: (error: Error) => {
      console.error('Mark notification read error:', error);
      // Silent error for notification updates
    },
  });

  return {
    awardPoints: awardPointsMutation,
    generateReferralCode: generateReferralCodeMutation,
    applyReferral: applyReferralMutation,
    updateStreak: updateStreakMutation,
    checkBadges: checkBadgesMutation,
    markNotificationRead: markNotificationReadMutation,
  };
};