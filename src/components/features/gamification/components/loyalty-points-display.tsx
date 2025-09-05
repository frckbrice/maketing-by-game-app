'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useGamificationQueries } from '../api';
import { Star, TrendingUp, Gift, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const LoyaltyPointsDisplay: React.FC = () => {
  const { user } = useAuth();
  const { loyalty } = useGamificationQueries(user?.id);

  const { data: loyaltyResponse, isLoading } = loyalty;
  const loyaltyProfile = loyaltyResponse?.profile;

  if (!user || isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='animate-pulse space-y-4'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-full'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyProfile) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-gray-500 dark:text-gray-400'>
            No loyalty profile found
          </p>
        </CardContent>
      </Card>
    );
  }

  const levelProgress =
    loyaltyProfile.nextLevelThreshold > loyaltyProfile.totalPointsEarned
      ? ((loyaltyProfile.totalPointsEarned -
          (loyaltyProfile.level === 1 ? 0 : 1000)) /
          (loyaltyProfile.nextLevelThreshold -
            (loyaltyProfile.level === 1 ? 0 : 1000))) *
        100
      : 100;

  return (
    <div className='space-y-4'>
      {/* Main Points Card */}
      <Card className='bg-gradient-to-r from-orange-500 to-red-500 text-white'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center justify-between'>
            <span className='text-lg font-bold'>Loyalty Points</span>
            <Star className='w-6 h-6' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold mb-1'>
                {loyaltyProfile.currentBalance.toLocaleString()}
              </div>
              <div className='text-orange-100 text-sm'>Available Points</div>
            </div>

            <div className='flex justify-between items-center text-sm'>
              <div className='text-center'>
                <div className='font-semibold'>
                  {loyaltyProfile.totalPointsEarned.toLocaleString()}
                </div>
                <div className='text-orange-100'>Total Earned</div>
              </div>
              <div className='text-center'>
                <div className='font-semibold'>
                  {loyaltyProfile.totalPointsSpent.toLocaleString()}
                </div>
                <div className='text-orange-100'>Total Spent</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress Card */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center justify-between'>
            <span className='text-lg font-semibold'>Level Progress</span>
            <Badge
              variant='secondary'
              className='bg-orange-100 text-orange-800'
            >
              Level {loyaltyProfile.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-bold text-orange-600'>
                {loyaltyProfile.levelName}
              </span>
              <TrendingUp className='w-5 h-5 text-orange-500' />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Progress to next level</span>
                <span className='font-medium'>
                  {loyaltyProfile.totalPointsEarned} /{' '}
                  {loyaltyProfile.nextLevelThreshold}
                </span>
              </div>
              <Progress value={Math.min(levelProgress, 100)} className='h-2' />
            </div>

            {loyaltyProfile.nextLevelThreshold >
              loyaltyProfile.totalPointsEarned && (
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {(
                  loyaltyProfile.nextLevelThreshold -
                  loyaltyProfile.totalPointsEarned
                ).toLocaleString()}{' '}
                points to next level
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg'>
                <Gift className='w-5 h-5 text-orange-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Games Played
                </p>
                <p className='text-xl font-bold'>
                  {loyaltyProfile.lifetimeGamesPlayed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
                <Clock className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Streak
                </p>
                <p className='text-xl font-bold'>
                  {loyaltyProfile.consecutiveDaysStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Points Warning */}
      {loyaltyProfile.pointsExpiring30Days > 0 && (
        <Card className='border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <Clock className='w-5 h-5 text-yellow-600' />
              <div>
                <p className='font-medium text-yellow-800 dark:text-yellow-200'>
                  {loyaltyProfile.pointsExpiring30Days} points expiring soon
                </p>
                <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                  Use them within 30 days to avoid losing them
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
