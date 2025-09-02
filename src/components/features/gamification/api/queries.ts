import { useQuery } from '@tanstack/react-query';
import {
  BadgesResponse,
  LoyaltyProfileResponse,
  NotificationsResponse,
  ReferralProfileResponse,
  StreakResponse
} from './types';

const API_BASE = '/api/gamification';

const fetchWithAuth = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export const useGamificationQueries = (userId?: string) => {
  const loyaltyQuery = useQuery({
    queryKey: ['gamification', 'loyalty', userId],
    queryFn: (): Promise<LoyaltyProfileResponse> => 
      fetchWithAuth(`${API_BASE}/loyalty`),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const referralQuery = useQuery({
    queryKey: ['gamification', 'referrals', userId],
    queryFn: (): Promise<ReferralProfileResponse> => 
      fetchWithAuth(`${API_BASE}/referrals`),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const streakQuery = useQuery({
    queryKey: ['gamification', 'streak', userId],
    queryFn: (): Promise<StreakResponse> => 
      fetchWithAuth(`${API_BASE}/streak`),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  const badgesQuery = useQuery({
    queryKey: ['gamification', 'badges', userId],
    queryFn: (): Promise<BadgesResponse> => 
      fetchWithAuth(`${API_BASE}/badges`),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });

  const notificationsQuery = useQuery({
    queryKey: ['gamification', 'notifications', userId],
    queryFn: (): Promise<NotificationsResponse> => 
      fetchWithAuth(`${API_BASE}/notifications?limit=20`),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });

  return {
    loyalty: loyaltyQuery,
    referral: referralQuery,
    streak: streakQuery,
    badges: badgesQuery,
    notifications: notificationsQuery,
  };
};
