'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useGamificationQueries, useGamificationMutations } from '../api';
import { Bell, Star, TrendingUp, Award, Users, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const NOTIFICATION_ICONS = {
  POINTS_EARNED: Star,
  LEVEL_UP: TrendingUp,
  BADGE_EARNED: Award,
  STREAK_BONUS: Star,
  REFERRAL_REWARD: Users,
};

const NOTIFICATION_COLORS = {
  POINTS_EARNED: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  LEVEL_UP: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  BADGE_EARNED: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  STREAK_BONUS: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  REFERRAL_REWARD: 'text-green-600 bg-green-100 dark:bg-green-900/20',
};

export const GamificationNotifications: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notifications } = useGamificationQueries(user?.id);
  const { markNotificationRead } = useGamificationMutations(user?.id);

  const { data: notificationsResponse, isLoading } = notifications;
  const notificationsList = notificationsResponse?.notifications || [];

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationRead.mutate({ notificationId });
  };

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notificationsList.filter(n => !n.isRead);
    unreadNotifications.forEach(notification => {
      markNotificationRead.mutate({ notificationId: notification.id });
    });
  };

  const unreadCount = notificationsList.filter(n => !n.isRead).length;

  if (!user || isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='animate-pulse space-y-4'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex space-x-3'>
                <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                </div>
              </div>
            ))}
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
            <Bell className='w-5 h-5' />
            <span>{t('gamification.notifications.title')}</span>
            {unreadCount > 0 && (
              <Badge variant='destructive' className='ml-2'>
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleMarkAllAsRead}
              disabled={markNotificationRead.isPending}
            >
              {t('gamification.notifications.markAllRead')}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notificationsList.length > 0 ? (
          <div className='space-y-4'>
            {notificationsList.map(notification => {
              const NotificationIcon =
                NOTIFICATION_ICONS[notification.type] || Bell;
              const colorClass =
                NOTIFICATION_COLORS[notification.type] ||
                'text-gray-600 bg-gray-100';

              return (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    notification.isRead
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
                      : 'bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700 shadow-sm'
                  }`}
                >
                  <div className='flex items-start space-x-3'>
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <NotificationIcon className='w-5 h-5' />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900 dark:text-white'>
                            {notification.title}
                          </h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                            {notification.message}
                          </p>

                          {/* Additional info */}
                          <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                            <span>
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString()}{' '}
                              {new Date(
                                notification.createdAt
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            {notification.points && (
                              <Badge variant='secondary' className='text-xs'>
                                +{notification.points}{' '}
                                {t('gamification.points')}
                              </Badge>
                            )}

                            {notification.level && (
                              <Badge variant='secondary' className='text-xs'>
                                {t('gamification.level')} {notification.level}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Mark as read button */}
                        {!notification.isRead && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markNotificationRead.isPending}
                            className='p-1 h-auto text-gray-400 hover:text-gray-600'
                          >
                            <Check className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className='absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full'></div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-center space-y-4 py-8'>
            <Bell className='w-16 h-16 text-gray-400 mx-auto' />
            <div>
              <h3 className='text-lg font-semibold mb-2'>
                {t('gamification.notifications.noNotifications')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                {t('gamification.notifications.noNotificationsDescription')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
