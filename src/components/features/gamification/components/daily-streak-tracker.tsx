'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useGamificationQueries, useGamificationMutations } from '../api';
import { Calendar, Flame, Star, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export const DailyStreakTracker: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { streak } = useGamificationQueries(user?.id);
  const { updateStreak } = useGamificationMutations(user?.id);

  const { data: streakResponse, isLoading } = streak;
  const streakData = streakResponse?.streak;

  // Auto-update streak when component mounts (daily check-in)
  useEffect(() => {
    if (user?.id && !updateStreak.isPending) {
      updateStreak.mutate();
    }
  }, [user?.id]);

  const handleManualCheckIn = () => {
    updateStreak.mutate();
  };

  const getStreakMilestone = (days: number) => {
    if (days >= 100)
      return {
        icon: Trophy,
        color: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/20',
      };
    if (days >= 30)
      return {
        icon: Star,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      };
    if (days >= 7)
      return {
        icon: Flame,
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/20',
      };
    return {
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    };
  };

  const getNextMilestone = (days: number) => {
    if (days < 7) return 7;
    if (days < 30) return 30;
    if (days < 100) return 100;
    return days + 50; // Next 50-day milestone
  };

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

  const milestone = streakData
    ? getStreakMilestone(streakData.currentStreak)
    : getStreakMilestone(0);
  const MilestoneIcon = milestone.icon;
  const nextMilestone = streakData
    ? getNextMilestone(streakData.currentStreak)
    : 7;
  const today = new Date().toDateString();
  const lastLoginDay = streakData
    ? new Date(streakData.lastLoginDate).toDateString()
    : null;
  const isCheckedInToday = lastLoginDay === today;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <MilestoneIcon className={`w-5 h-5 ${milestone.color}`} />
            <span>{t('gamification.streak.title')}</span>
          </div>
          {streakData && (
            <Badge variant='secondary' className={milestone.bg}>
              {streakData.currentStreak} {t('gamification.streak.days')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {streakData ? (
          <div className='space-y-6'>
            {/* Current Streak Display */}
            <div className='text-center space-y-2'>
              <div
                className={`inline-flex items-center justify-center w-20 h-20 ${milestone.bg} rounded-full`}
              >
                <MilestoneIcon className={`w-10 h-10 ${milestone.color}`} />
              </div>
              <div>
                <div className='text-3xl font-bold'>
                  {streakData.currentStreak}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {t('gamification.streak.currentStreak')}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <div className='text-xl font-bold text-orange-600'>
                  {streakData.longestStreak}
                </div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>
                  {t('gamification.streak.longestStreak')}
                </div>
              </div>

              <div className='text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <div className='text-xl font-bold text-green-600'>
                  {nextMilestone - streakData.currentStreak}
                </div>
                <div className='text-xs text-gray-600 dark:text-gray-400'>
                  {t('gamification.streak.toNextMilestone')}
                </div>
              </div>
            </div>

            {/* Check-in Status */}
            <div className='text-center space-y-3'>
              {isCheckedInToday ? (
                <div className='space-y-2'>
                  <div className='flex items-center justify-center space-x-2 text-green-600'>
                    <Calendar className='w-5 h-5' />
                    <span className='font-medium'>
                      {t('gamification.streak.checkedInToday')}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('gamification.streak.comeBackTomorrow')}
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Button
                    onClick={handleManualCheckIn}
                    disabled={updateStreak.isPending}
                    className='w-full'
                  >
                    {updateStreak.isPending
                      ? t('common.loading')
                      : t('gamification.streak.checkInNow')}
                  </Button>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('gamification.streak.checkInDescription')}
                  </p>
                </div>
              )}
            </div>

            {/* Milestones */}
            <div className='space-y-3'>
              <h4 className='font-medium text-sm'>
                {t('gamification.streak.milestones')}
              </h4>
              <div className='space-y-2'>
                {[7, 30, 100].map(milestone => (
                  <div
                    key={milestone}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      streakData.currentStreak >= milestone
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : streakData.longestStreak >= milestone
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className='text-sm'>
                      {milestone} {t('gamification.streak.dayMilestone')}
                    </span>
                    <div className='flex items-center space-x-1'>
                      {streakData.currentStreak >= milestone ? (
                        <Badge
                          variant='default'
                          className='bg-green-600 text-white'
                        >
                          {t('common.achieved')}
                        </Badge>
                      ) : streakData.longestStreak >= milestone ? (
                        <Badge variant='secondary'>
                          {t('gamification.streak.previouslyAchieved')}
                        </Badge>
                      ) : (
                        <Badge variant='outline'>
                          +{milestone * 10} {t('gamification.points')}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bonuses */}
            {streakData.streakBonuses &&
              streakData.streakBonuses.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='font-medium text-sm'>
                    {t('gamification.streak.recentBonuses')}
                  </h4>
                  <div className='space-y-1'>
                    {streakData.streakBonuses.slice(-3).map((bonus, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm'
                      >
                        <span>
                          {t('gamification.streak.dayX', { day: bonus.day })}
                        </span>
                        <span className='font-medium text-orange-600'>
                          +{bonus.pointsAwarded} {t('gamification.points')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className='text-center space-y-4'>
            <Calendar className='w-16 h-16 text-gray-400 mx-auto' />
            <div>
              <h3 className='text-lg font-semibold mb-2'>
                {t('gamification.streak.getStarted')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                {t('gamification.streak.getStartedDescription')}
              </p>
              <Button
                onClick={handleManualCheckIn}
                disabled={updateStreak.isPending}
                className='flex items-center space-x-2'
              >
                <Calendar className='w-4 h-4' />
                <span>
                  {updateStreak.isPending
                    ? t('common.loading')
                    : t('gamification.streak.startStreak')}
                </span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
