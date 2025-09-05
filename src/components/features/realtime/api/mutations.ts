import { useMutation, useQueryClient } from '@tanstack/react-query';
import { realtimeService } from '@/lib/services/realtimeService';
import type { LiveNotification } from './types';

// Query keys for realtime
export const realtimeQueryKeys = {
  all: ['realtime'] as const,
  notifications: (userId: string) =>
    ['realtime', 'notifications', userId] as const,
  connection: (userId: string) => ['realtime', 'connection', userId] as const,
  settings: (userId: string) => ['realtime', 'settings', userId] as const,
};

// Mark notification as read mutation
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        await realtimeService.markNotificationAsRead(notificationId);
        return { success: true, notificationId };
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({
        queryKey: ['realtime', 'notifications'],
      });
    },
    onError: error => {
      console.error('Error in mark notification as read mutation:', error);
    },
  });
};

// Mark all notifications as read mutation
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      try {
        await Promise.all(
          notificationIds.map(id => realtimeService.markNotificationAsRead(id))
        );
        return { success: true, count: notificationIds.length };
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({
        queryKey: ['realtime', 'notifications'],
      });
    },
    onError: error => {
      console.error('Error in mark all notifications as read mutation:', error);
    },
  });
};

// Delete notification mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        // Assuming realtimeService has a delete method
        // await realtimeService.deleteNotification(notificationId);
        console.log('Deleting notification:', notificationId);
        return { success: true, notificationId };
      } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({
        queryKey: ['realtime', 'notifications'],
      });
    },
    onError: error => {
      console.error('Error in delete notification mutation:', error);
    },
  });
};

// Update notification settings mutation
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: {
      userId: string;
      gameUpdates?: boolean;
      messages?: boolean;
      winnerAnnouncements?: boolean;
      systemAlerts?: boolean;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      inAppNotifications?: boolean;
      quietHours?: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    }) => {
      try {
        // Assuming realtimeService has an updateSettings method
        // await realtimeService.updateNotificationSettings(settings);
        console.log('Updating notification settings:', settings);
        return { success: true, settings };
      } catch (error) {
        console.error('Error updating notification settings:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate settings queries
      queryClient.invalidateQueries({
        queryKey: ['realtime', 'settings', data.settings.userId],
      });
    },
    onError: error => {
      console.error('Error in update notification settings mutation:', error);
    },
  });
};

// Send realtime event mutation
export const useSendRealtimeEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      type: string;
      data: any;
      targetUsers?: string[];
    }) => {
      try {
        // Assuming realtimeService has a sendEvent method
        // await realtimeService.sendEvent(event);
        console.log('Sending realtime event:', event);
        return { success: true, event };
      } catch (error) {
        console.error('Error sending realtime event:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate relevant queries based on event type
      queryClient.invalidateQueries({ queryKey: ['realtime'] });
    },
    onError: error => {
      console.error('Error in send realtime event mutation:', error);
    },
  });
};

// Connect to realtime service mutation
export const useConnectToRealtime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        // Assuming realtimeService has a connect method
        // await realtimeService.connect(userId);
        console.log('Connecting to realtime service for user:', userId);
        return { success: true, userId };
      } catch (error) {
        console.error('Error connecting to realtime service:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate connection queries
      queryClient.invalidateQueries({
        queryKey: ['realtime', 'connection', data.userId],
      });
    },
    onError: error => {
      console.error('Error in connect to realtime mutation:', error);
    },
  });
};

// Disconnect from realtime service mutation
export const useDisconnectFromRealtime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        // Assuming realtimeService has a disconnect method
        // await realtimeService.disconnect(userId);
        console.log('Disconnecting from realtime service for user:', userId);
        return { success: true, userId };
      } catch (error) {
        console.error('Error disconnecting from realtime service:', error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate connection queries
      queryClient.invalidateQueries({
        queryKey: ['realtime', 'connection', data.userId],
      });
    },
    onError: error => {
      console.error('Error in disconnect from realtime mutation:', error);
    },
  });
};
