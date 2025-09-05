import { getMessagingInstance } from '@/lib/firebase/config';
import { firestoreService } from '@/lib/firebase/services';
import { realtimeService } from '@/lib/services/realtimeService';
import { gamificationService } from '@/lib/services/gamificationService';
import { getToken, onMessage } from 'firebase/messaging';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  data?: any;
  timestamp: number;
  userEmail?: string;
  fcmToken?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize FCM and request permission
  async initializeFCM(): Promise<string | null> {
    try {
      const messagingInstance = await getMessagingInstance();
      if (!messagingInstance) {
        console.log('Firebase Messaging not supported in this browser');
        return null;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // Get FCM token
      const token = await getToken(messagingInstance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        this.fcmToken = token;
        console.log('FCM Token obtained:', token);

        // Listen for foreground messages
        this.setupForegroundMessageListener(messagingInstance);

        return token;
      }

      return null;
    } catch (error) {
      console.error('Error initializing FCM:', error);
      return null;
    }
  }

  // Setup listener for foreground messages
  private setupForegroundMessageListener(messagingInstance: any) {
    onMessage(messagingInstance, payload => {
      console.log('Foreground message received:', payload);

      // Show in-app notification
      this.showInAppNotification(payload);

      // Also show browser notification if permission granted
      if (Notification.permission === 'granted') {
        this.showBrowserNotification(payload);
      }
    });
  }

  // Show in-app notification (you can implement this based on your UI)
  private showInAppNotification(payload: any) {
    //TODO: This would typically trigger a toast notification or update your app state
    // For now, we'll just log it
    console.log('In-app notification:', payload);

    // You can dispatch a custom event or use your state management system
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('fcm-notification', {
          detail: payload,
        })
      );
    }
  }

  // Show browser notification
  private showBrowserNotification(payload: any) {
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/en/icons/lottery_logo-192.png',
      badge: '/en/icons/lottery_logo-96.png',
      data: payload.data || {},
      tag: payload.data?.tag || 'default',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    new Notification(notificationTitle, notificationOptions);
  }

  // Send push notification (if supported by browser)
  async sendPushNotification(notification: NotificationData): Promise<void> {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      // Request permission if not granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          return;
        }
      }

      // Send notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/en/icons/lottery_logo-192.png',
          badge: '/en/icons/lottery_logo-96.png',
          tag: `notification-${notification.userId}`,
          data: notification.data,
        });
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Send email notification via API route
  async sendEmailNotification(notification: NotificationData): Promise<void> {
    try {
      if (!notification.userEmail) {
        console.log('No user email provided for email notification');
        return;
      }

      // Store notification in Firestore for record keeping
      await firestoreService.createNotification(notification);

      // Send email via API route
      try {
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: notification.userEmail,
            subject: notification.title,
            html: notification.message,
            type: 'notification',
          }),
        });

        const emailSent = response.ok;
        if (emailSent) {
          console.log(
            'Email notification sent successfully to:',
            notification.userEmail
          );
        } else {
          console.error(
            'Failed to send email notification to:',
            notification.userEmail
          );
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Send FCM notification (this would typically be done from your backend)
  async sendFCMNotification(
    userToken: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Call the comprehensive notification API
      const response = await fetch('/api/admin/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`,
        },
        body: JSON.stringify({
          notificationId: `fcm_${Date.now()}`,
          title: notification.title,
          message: notification.message,
          targetAudience: 'CUSTOM',
          recipients: [notification.userId],
        }),
      });

      if (response.ok) {
        console.log('FCM notification sent successfully via API');
      } else {
        console.error('Failed to send FCM notification via API');
      }
    } catch (error) {
      console.error('Error sending FCM notification:', error);
    }
  }

  // Send vendor application status notification
  async sendVendorApplicationNotification(
    userId: string,
    userEmail: string,
    status: 'APPROVED' | 'REJECTED',
    companyName: string,
    rejectionReason?: string
  ): Promise<void> {
    const timestamp = Date.now();

    if (status === 'APPROVED') {
      const notification: NotificationData = {
        userId,
        userEmail,
        title: '🎉 Vendor Application Approved!',
        message: `Congratulations! Your vendor application for ${companyName} has been approved. You can now create and manage lottery games.`,
        type: 'success',
        data: { type: 'vendor-application-approved', companyName },
        timestamp,
      };

      // Send email notification via API route
      try {
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail,
            status,
            companyName,
            rejectionReason,
            type: 'vendor-application',
          }),
        });

        const emailSent = response.ok;
        if (emailSent) {
          console.log('Vendor application approval email sent successfully');
        }
      } catch (error) {
        console.error('Error sending vendor application email:', error);
      }

      // Send in-app and browser notifications
      await Promise.all([
        this.sendPushNotification(notification),
        this.sendEmailNotification(notification),
      ]);
    } else if (status === 'REJECTED') {
      const notification: NotificationData = {
        userId,
        userEmail,
        title: 'Vendor Application Update',
        message: `Your vendor application for ${companyName} was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please review and submit a new application.'}`,
        type: 'warning',
        data: {
          type: 'vendor-application-rejected',
          companyName,
          rejectionReason,
        },
        timestamp,
      };

      // Send email notification via API route
      try {
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail,
            status,
            companyName,
            rejectionReason,
            type: 'vendor-application',
          }),
        });

        const emailSent = response.ok;
        if (emailSent) {
          console.log('Vendor application rejection email sent successfully');
        }
      } catch (error) {
        console.error('Error sending vendor application email:', error);
      }

      // Send in-app and browser notifications
      await Promise.all([
        this.sendPushNotification(notification),
        this.sendEmailNotification(notification),
      ]);
    }
  }

  // Request notification permission on app load
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get current FCM token
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  // Update FCM token (call this when user logs in)
  async updateFCMToken(): Promise<string | null> {
    return this.initializeFCM();
  }

  // Game-related notifications
  async sendGameStartNotification(
    userId: string,
    gameId: string,
    gameName: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '🎮 Game Started!',
      message: `${gameName} has just started. Join now to win amazing prizes!`,
      type: 'info',
      timestamp: Date.now(),
      data: { type: 'game-started', gameId },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'game_update',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  async sendGameWinnerNotification(
    userId: string,
    gameId: string,
    prize: string,
    prizeValue: number
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '🎉 Congratulations! You Won!',
      message: `You won ${prize} worth $${prizeValue}! Check your profile to claim your prize.`,
      type: 'success',
      timestamp: Date.now(),
      data: { type: 'game-winner', gameId, prize, prizeValue },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'winner_announcement',
        title: notification.title,
        message: notification.message,
        priority: 'high',
        data: notification.data,
      }),
      // Award gamification points for winning
      gamificationService.awardPoints(
        userId,
        100, // Bonus points for winning
        'EARNED_GAME_PLAY',
        `Won game: ${prize}`,
        gameId,
        'GAME'
      ),
    ]);
  }

  async sendGameEndingNotification(
    userId: string,
    gameId: string,
    gameName: string,
    timeLeft: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '⏰ Last Chance!',
      message: `${gameName} ends in ${timeLeft}. Don't miss your chance to win!`,
      type: 'warning',
      timestamp: Date.now(),
      data: { type: 'game-ending', gameId },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'game_update',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  // Gamification notifications
  async sendLevelUpNotification(
    userId: string,
    newLevel: number,
    levelName: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '📈 Level Up!',
      message: `Congratulations! You've reached Level ${newLevel} (${levelName}). Keep playing to unlock more rewards!`,
      type: 'success',
      timestamp: Date.now(),
      data: { type: 'level-up', level: newLevel, levelName },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'system_alert',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  async sendBadgeEarnedNotification(
    userId: string,
    badgeName: string,
    badgeDescription: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '🏆 Badge Earned!',
      message: `You earned the "${badgeName}" badge! ${badgeDescription}`,
      type: 'success',
      timestamp: Date.now(),
      data: { type: 'badge-earned', badgeName },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'system_alert',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  async sendReferralRewardNotification(
    userId: string,
    points: number,
    referralCode: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '🎁 Referral Reward!',
      message: `You earned ${points} points from your referral! Someone used your code ${referralCode}.`,
      type: 'success',
      timestamp: Date.now(),
      data: { type: 'referral-reward', points, referralCode },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'system_alert',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  async sendStreakBonusNotification(
    userId: string,
    streakDays: number,
    pointsEarned: number
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '🔥 Streak Bonus!',
      message: `${streakDays} day streak! You earned ${pointsEarned} bonus points. Keep it up!`,
      type: 'success',
      timestamp: Date.now(),
      data: { type: 'streak-bonus', streakDays, pointsEarned },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'system_alert',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  // Order and marketplace notifications
  async sendOrderConfirmationNotification(
    userId: string,
    orderId: string,
    orderTotal: number
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '📦 Order Confirmed!',
      message: `Your order #${orderId} for $${orderTotal} has been confirmed and is being processed.`,
      type: 'success',
      timestamp: Date.now(),
      data: { type: 'order-confirmed', orderId, orderTotal },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'system_alert',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  async sendOrderStatusUpdateNotification(
    userId: string,
    orderId: string,
    status: string,
    message: string
  ): Promise<void> {
    const statusEmoji =
      {
        processing: '⚡',
        shipped: '🚚',
        delivered: '📦',
        cancelled: '❌',
      }[status] || '📋';

    const notification: NotificationData = {
      userId,
      title: `${statusEmoji} Order Update`,
      message: `Order #${orderId}: ${message}`,
      type: status === 'cancelled' ? 'warning' : 'info',
      timestamp: Date.now(),
      data: { type: 'order-status', orderId, status },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'system_alert',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  // Chat notifications
  async sendNewMessageNotification(
    receiverId: string,
    senderName: string,
    shopName?: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId: receiverId,
      title: '💬 New Message',
      message: shopName
        ? `${senderName} from ${shopName} sent you a message`
        : `${senderName} sent you a message`,
      type: 'info',
      timestamp: Date.now(),
      data: { type: 'new-message', senderName, shopName },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId: receiverId,
        type: 'new_message',
        title: notification.title,
        message: notification.message,
        priority: 'medium',
        data: notification.data,
      }),
    ]);
  }

  // System maintenance notifications
  async sendMaintenanceNotification(
    userId: string,
    startTime: string,
    duration: string
  ): Promise<void> {
    const notification: NotificationData = {
      userId,
      title: '🔧 Scheduled Maintenance',
      message: `System maintenance scheduled for ${startTime} (${duration}). Plan accordingly.`,
      type: 'warning',
      timestamp: Date.now(),
      data: { type: 'maintenance', startTime, duration },
    };

    await Promise.all([
      this.sendPushNotification(notification),
      realtimeService.createLiveNotification({
        userId,
        type: 'system_alert',
        title: notification.title,
        message: notification.message,
        priority: 'high',
        data: notification.data,
      }),
    ]);
  }

  // Bulk notification sending
  async sendBulkNotification(
    userIds: string[],
    notification: Omit<NotificationData, 'userId'>
  ): Promise<void> {
    const promises = userIds.map(userId =>
      this.sendPushNotification({ ...notification, userId })
    );

    await Promise.allSettled(promises);
  }

  // Notification preferences management
  async getUserNotificationPreferences(userId: string): Promise<any> {
    try {
      const user = await firestoreService.getUser(userId);
      return (
        user?.notificationPreferences || {
          push: true,
          email: true,
          sms: false,
          gameUpdates: true,
          marketing: true,
          orderUpdates: true,
        }
      );
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        push: true,
        email: true,
        sms: false,
        gameUpdates: true,
        marketing: true,
        orderUpdates: true,
      };
    }
  }

  async updateUserNotificationPreferences(
    userId: string,
    preferences: any
  ): Promise<void> {
    try {
      await firestoreService.updateUser(userId, {
        notificationPreferences: preferences,
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
