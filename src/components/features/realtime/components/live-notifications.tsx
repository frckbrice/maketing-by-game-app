'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { realtimeService } from '@/lib/services/realtimeService';
import { Bell, X, Check, AlertCircle, Star, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../api/mutations';
import {
  NOTIFICATION_ICONS,
  PRIORITY_COLORS,
  type LiveNotification,
} from '../api/types';

export const LiveNotifications: React.FC<{ maxHeight?: string }> = ({
  maxHeight = 'max-h-96',
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Use the new mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = realtimeService.subscribeToUserNotifications(
      user.id,
      newNotifications => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
      }
    );

    return unsubscribe;
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await markAllAsReadMutation.mutateAsync(
        unreadNotifications.map(n => n.id)
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: LiveNotification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (
      notification.data?.type === 'game-started' &&
      notification.data.gameId
    ) {
      window.location.href = `/games/${notification.data.gameId}`;
    } else if (notification.data?.type === 'new-message') {
      window.location.href = '/profile/messages';
    } else if (
      notification.data?.type === 'order-confirmed' &&
      notification.data.orderId
    ) {
      window.location.href = `/profile/orders/${notification.data.orderId}`;
    }
  };

  if (!user) return null;

  return (
    <div className='relative'>
      {/* Notification Bell */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2'
      >
        <Bell className='w-5 h-5' />
        {unreadCount > 0 && (
          <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-red-500 text-white'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className='absolute right-0 top-full mt-2 w-80 z-50'>
          <Card className='shadow-lg border'>
            <CardContent className='p-0'>
              {/* Header */}
              <div className='flex items-center justify-between p-4 border-b'>
                <div className='flex items-center space-x-2'>
                  <Bell className='w-5 h-5' />
                  <h3 className='font-semibold'>
                    {t('notifications.live.title')}
                  </h3>
                  {unreadCount > 0 && (
                    <Badge variant='destructive'>{unreadCount}</Badge>
                  )}
                </div>
                <div className='flex items-center space-x-2'>
                  {unreadCount > 0 && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleMarkAllAsRead}
                      className='text-xs'
                    >
                      {t('notifications.live.markAllRead')}
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsOpen(false)}
                    className='p-1'
                  >
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className={`${maxHeight} overflow-y-auto`}>
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map(notification => {
                    const NotificationIcon =
                      NOTIFICATION_ICONS[notification.type] || Bell;
                    const priorityColor =
                      PRIORITY_COLORS[notification.priority];

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                          !notification.read
                            ? 'bg-blue-50 dark:bg-blue-900/10'
                            : ''
                        }`}
                      >
                        <div className='flex items-start space-x-3'>
                          <div className={`p-2 rounded-full ${priorityColor}`}>
                            <NotificationIcon className='w-4 h-4' />
                          </div>

                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <h4
                                  className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}
                                >
                                  {notification.title}
                                </h4>
                                <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
                                  {notification.message}
                                </p>
                                <p className='text-xs text-gray-500 mt-1'>
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleTimeString()}
                                </p>
                              </div>

                              {!notification.read && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className='p-1 h-auto text-gray-400 hover:text-gray-600'
                                >
                                  <Check className='w-3 h-3' />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className='p-8 text-center text-gray-500'>
                    <Bell className='w-12 h-12 mx-auto mb-3 opacity-50' />
                    <p className='text-sm'>
                      {t('notifications.live.noNotifications')}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 10 && (
                <div className='p-3 border-t text-center'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      window.location.href = '/profile/notifications';
                      setIsOpen(false);
                    }}
                    className='text-xs'
                  >
                    {t('notifications.live.viewAll')} ({notifications.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
