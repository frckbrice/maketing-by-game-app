import { getMessagingInstance } from '@/lib/firebase/config';
import { firestoreService } from '@/lib/firebase/services';
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
      //TODO: In a real implementation, this would be sent from your backend
      // For now, we'll just log it
      console.log('FCM notification would be sent to token:', userToken);
      console.log('Notification data:', notification);

      //TODO: You would typically make an API call to your backend here
      // const response = await fetch('/api/notifications/send-fcm', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: userToken, notification })
      // });
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
}

export const notificationService = NotificationService.getInstance();
