'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useGamificationQueries, useGamificationMutations } from '../api';
import { UserBadgeWithDetails } from '../api/types';
import {
  Award,
  Star,
  TrendingUp,
  Users,
  Gamepad2,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const CATEGORY_ICONS = {
  GAMING: Gamepad2,
  SOCIAL: Users,
  SPENDING: ShoppingBag,
  LOYALTY: Star,
};

const CATEGORY_COLORS = {
  GAMING: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  SOCIAL: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  SPENDING: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  LOYALTY: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
};

export const BadgesCollection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { badges } = useGamificationQueries(user?.id);
  const { checkBadges } = useGamificationMutations(user?.id);

  const { data: badgesResponse, isLoading } = badges;
  const userBadges: UserBadgeWithDetails[] = badgesResponse?.badges || [];

  // Auto-check for new badges when component mounts
  useEffect(() => {
    if (user?.id && !checkBadges.isPending) {
      checkBadges.mutate();
    }
  }, [user?.id]);

  const handleCheckBadges = () => {
    checkBadges.mutate();
  };

  const groupedBadges = userBadges.reduce(
    (acc, badge) => {
      const category = badge.badgeDetails?.category || 'GAMING';
      if (!acc[category]) acc[category] = [];
      acc[category].push(badge);
      return acc;
    },
    {} as Record<string, typeof userBadges>
  );

  if (!user || isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='animate-pulse space-y-4'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='h-24 bg-gray-200 dark:bg-gray-700 rounded'
                ></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Award className='w-5 h-5' />
            <span>{t('gamification.badges.title')}</span>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant='secondary'>
              {userBadges.length} {t('gamification.badges.earned')}
            </Badge>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCheckBadges}
              disabled={checkBadges.isPending}
            >
              {checkBadges.isPending
                ? t('common.checking')
                : t('gamification.badges.checkNew')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userBadges.length > 0 ? (
          <div className='space-y-6'>
            {Object.entries(groupedBadges).map(([category, categoryBadges]) => {
              const CategoryIcon =
                CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] ||
                Award;
              const categoryColor =
                CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
                'text-gray-600 bg-gray-100';

              return (
                <div key={category} className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <CategoryIcon className='w-4 h-4' />
                    <h3 className='font-medium text-lg'>
                      {t(
                        `gamification.badges.categories.${category.toLowerCase()}`
                      )}
                    </h3>
                    <Badge variant='outline' className='text-xs'>
                      {categoryBadges.length}
                    </Badge>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {categoryBadges
                      .sort((a, b) => b.earnedAt - a.earnedAt) // Most recent first
                      .map(badge => (
                        <div
                          key={badge.id}
                          className='relative p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow'
                        >
                          {/* Badge Icon/Image */}
                          <div
                            className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${categoryColor}`}
                          >
                            {badge.badgeDetails?.icon ? (
                              <span className='text-2xl'>
                                {badge.badgeDetails.icon}
                              </span>
                            ) : (
                              <CategoryIcon className='w-8 h-8' />
                            )}
                          </div>

                          {/* Badge Info */}
                          <div className='text-center space-y-2'>
                            <h4 className='font-medium text-sm line-clamp-2'>
                              {badge.badgeDetails?.name ||
                                t('gamification.badges.unknownBadge')}
                            </h4>

                            <p className='text-xs text-gray-600 dark:text-gray-400 line-clamp-2'>
                              {badge.badgeDetails?.description}
                            </p>

                            {badge.badgeDetails?.rewardPoints && (
                              <Badge variant='secondary' className='text-xs'>
                                +{badge.badgeDetails.rewardPoints}{' '}
                                {t('gamification.points')}
                              </Badge>
                            )}

                            <div className='text-xs text-gray-500'>
                              {new Date(badge.earnedAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Badge Type Indicator */}
                          {badge.badgeDetails?.type && (
                            <div className='absolute top-2 right-2'>
                              {badge.badgeDetails.type === 'MILESTONE' && (
                                <div className='w-2 h-2 bg-gold-400 rounded-full'></div>
                              )}
                              {badge.badgeDetails.type === 'SPECIAL' && (
                                <div className='w-2 h-2 bg-purple-400 rounded-full'></div>
                              )}
                              {badge.badgeDetails.type === 'PROGRESS' && (
                                <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                              )}
                            </div>
                          )}

                          {/* Progress bar for progress badges */}
                          {badge.badgeDetails?.type === 'PROGRESS' &&
                            badge.progress !== undefined && (
                              <div className='mt-2'>
                                <div className='w-full bg-gray-200 rounded-full h-1'>
                                  <div
                                    className='bg-blue-600 h-1 rounded-full'
                                    style={{
                                      width: `${Math.min(badge.progress, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}

            {/* Badge Statistics */}
            <div className='mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <h3 className='font-medium mb-3'>
                {t('gamification.badges.statistics')}
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
                <div>
                  <div className='text-2xl font-bold text-blue-600'>
                    {userBadges.length}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    {t('gamification.badges.totalEarned')}
                  </div>
                </div>

                <div>
                  <div className='text-2xl font-bold text-green-600'>
                    {
                      userBadges.filter(
                        b => b.badgeDetails?.type === 'MILESTONE'
                      ).length
                    }
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    {t('gamification.badges.milestones')}
                  </div>
                </div>

                <div>
                  <div className='text-2xl font-bold text-purple-600'>
                    {
                      userBadges.filter(b => b.badgeDetails?.type === 'SPECIAL')
                        .length
                    }
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    {t('gamification.badges.special')}
                  </div>
                </div>

                <div>
                  <div className='text-2xl font-bold text-orange-600'>
                    {userBadges.reduce(
                      (sum, b) => sum + (b.badgeDetails?.rewardPoints || 0),
                      0
                    )}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-400'>
                    {t('gamification.badges.pointsFromBadges')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center space-y-4 py-8'>
            <Award className='w-16 h-16 text-gray-400 mx-auto' />
            <div>
              <h3 className='text-lg font-semibold mb-2'>
                {t('gamification.badges.noBadges')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                {t('gamification.badges.noBadgesDescription')}
              </p>
              <Button
                onClick={handleCheckBadges}
                disabled={checkBadges.isPending}
                className='flex items-center space-x-2'
              >
                <TrendingUp className='w-4 h-4' />
                <span>
                  {checkBadges.isPending
                    ? t('common.checking')
                    : t('gamification.badges.startEarning')}
                </span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
