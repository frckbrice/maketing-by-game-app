import { database } from '@/lib/firebase/config';
import { ref, set, get, onValue, off, serverTimestamp, push } from 'firebase/database';
import { User, GameCounter, UserPresence, ChatMessage, LiveNotification } from '@/types';

export interface GameCounter {
  gameId: string;
  participants: number;
  maxParticipants: number;
  status: 'active' | 'closed' | 'ended';
  lastUpdate: number;
  winners?: string[];
  prizesClaimed?: number;
  totalPrizeValue?: number;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: number;
  currentPage?: string;
  device?: 'web' | 'mobile';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  read: boolean;
  shopId?: string;
}

export interface LiveNotification {
  id: string;
  userId: string;
  type: 'game_update' | 'new_message' | 'winner_announcement' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

class RealtimeService {
  private listeners: Map<string, any> = new Map();

  // Game Counter Management
  async getGameCounter(gameId: string): Promise<GameCounter | null> {
    try {
      const counterRef = ref(database, `gameCounters/${gameId}`);
      const snapshot = await get(counterRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting game counter:', error);
      return null;
    }
  }

  async updateGameCounter(gameId: string, updates: Partial<GameCounter>): Promise<void> {
    try {
      const counterRef = ref(database, `gameCounters/${gameId}`);
      const currentData = await this.getGameCounter(gameId);
      
      await set(counterRef, {
        gameId,
        participants: 0,
        maxParticipants: 1000,
        status: 'active',
        ...currentData,
        ...updates,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Error updating game counter:', error);
      throw error;
    }
  }

  subscribeToGameCounter(gameId: string, callback: (counter: GameCounter | null) => void): () => void {
    const counterRef = ref(database, `gameCounters/${gameId}`);
    const listenerKey = `gameCounter_${gameId}`;

    const unsubscribe = onValue(counterRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });

    this.listeners.set(listenerKey, unsubscribe);

    return () => {
      this.listeners.delete(listenerKey);
      off(counterRef);
    };
  }

  async incrementGameParticipants(gameId: string): Promise<void> {
    try {
      const counter = await this.getGameCounter(gameId);
      if (counter) {
        await this.updateGameCounter(gameId, {
          participants: counter.participants + 1,
        });
      }
    } catch (error) {
      console.error('Error incrementing game participants:', error);
      throw error;
    }
  }

  // User Presence Management
  async setUserPresence(userId: string, presence: Partial<UserPresence>): Promise<void> {
    try {
      const presenceRef = ref(database, `presence/${userId}`);
      const currentData = await this.getUserPresence(userId);

      await set(presenceRef, {
        userId,
        status: 'online',
        lastSeen: Date.now(),
        device: 'web',
        ...currentData,
        ...presence,
      });
    } catch (error) {
      console.error('Error setting user presence:', error);
      throw error;
    }
  }

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    try {
      const presenceRef = ref(database, `presence/${userId}`);
      const snapshot = await get(presenceRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting user presence:', error);
      return null;
    }
  }

  subscribeToUserPresence(userId: string, callback: (presence: UserPresence | null) => void): () => void {
    const presenceRef = ref(database, `presence/${userId}`);
    const listenerKey = `presence_${userId}`;

    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });

    this.listeners.set(listenerKey, unsubscribe);

    return () => {
      this.listeners.delete(listenerKey);
      off(presenceRef);
    };
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.setUserPresence(userId, {
      status: 'offline',
      lastSeen: Date.now(),
    });
  }

  // Chat System
  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    try {
      const chatRef = ref(database, 'chats');
      const newMessageRef = push(chatRef);
      
      const messageData: ChatMessage = {
        ...message,
        id: newMessageRef.key!,
        timestamp: Date.now(),
        read: false,
      };

      await set(newMessageRef, messageData);
      
      // Create notification for receiver
      await this.createLiveNotification({
        userId: message.receiverId,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message`,
        priority: 'medium',
        data: { senderId: message.senderId, shopId: message.shopId },
      });

      return newMessageRef.key!;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToUserMessages(userId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesRef = ref(database, 'chats');
    const listenerKey = `messages_${userId}`;

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = Object.values(snapshot.val()) as ChatMessage[];
        const userMessages = allMessages.filter(msg => 
          msg.senderId === userId || msg.receiverId === userId
        );
        callback(userMessages.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        callback([]);
      }
    });

    this.listeners.set(listenerKey, unsubscribe);

    return () => {
      this.listeners.delete(listenerKey);
      off(messagesRef);
    };
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = ref(database, `chats/${messageId}`);
      const snapshot = await get(messageRef);
      
      if (snapshot.exists()) {
        await set(messageRef, {
          ...snapshot.val(),
          read: true,
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Live Notifications
  async createLiveNotification(notification: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const notificationRef = ref(database, 'liveNotifications');
      const newNotificationRef = push(notificationRef);
      
      const notificationData: LiveNotification = {
        ...notification,
        id: newNotificationRef.key!,
        timestamp: Date.now(),
        read: false,
      };

      await set(newNotificationRef, notificationData);
      return newNotificationRef.key!;
    } catch (error) {
      console.error('Error creating live notification:', error);
      throw error;
    }
  }

  subscribeToUserNotifications(userId: string, callback: (notifications: LiveNotification[]) => void): () => void {
    const notificationsRef = ref(database, 'liveNotifications');
    const listenerKey = `notifications_${userId}`;

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allNotifications = Object.values(snapshot.val()) as LiveNotification[];
        const userNotifications = allNotifications.filter(notif => notif.userId === userId);
        callback(userNotifications.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        callback([]);
      }
    });

    this.listeners.set(listenerKey, unsubscribe);

    return () => {
      this.listeners.delete(listenerKey);
      off(notificationsRef);
    };
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = ref(database, `liveNotifications/${notificationId}`);
      const snapshot = await get(notificationRef);
      
      if (snapshot.exists()) {
        await set(notificationRef, {
          ...snapshot.val(),
          read: true,
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Winner Announcements
  async announceWinner(gameId: string, winnerId: string, prize: string, prizeValue: number): Promise<void> {
    try {
      // Update game counter
      const counter = await this.getGameCounter(gameId);
      if (counter) {
        await this.updateGameCounter(gameId, {
          winners: [...(counter.winners || []), winnerId],
          prizesClaimed: (counter.prizesClaimed || 0) + 1,
          totalPrizeValue: (counter.totalPrizeValue || 0) + prizeValue,
        });
      }

      // Create live notification for winner
      await this.createLiveNotification({
        userId: winnerId,
        type: 'winner_announcement',
        title: '🎉 Congratulations! You Won!',
        message: `You won ${prize} worth $${prizeValue}!`,
        priority: 'high',
        data: { gameId, prize, prizeValue },
      });

      // Broadcast to all participants (you might want to limit this)
      const winnerAnnouncementRef = ref(database, `winnerAnnouncements`);
      const newAnnouncementRef = push(winnerAnnouncementRef);
      
      await set(newAnnouncementRef, {
        id: newAnnouncementRef.key!,
        gameId,
        winnerId,
        prize,
        prizeValue,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error announcing winner:', error);
      throw error;
    }
  }

  subscribeToWinnerAnnouncements(callback: (announcements: any[]) => void): () => void {
    const announcementsRef = ref(database, 'winnerAnnouncements');
    const listenerKey = 'winnerAnnouncements';

    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      if (snapshot.exists()) {
        const announcements = Object.values(snapshot.val());
        callback(announcements.sort((a: any, b: any) => b.timestamp - a.timestamp));
      } else {
        callback([]);
      }
    });

    this.listeners.set(listenerKey, unsubscribe);

    return () => {
      this.listeners.delete(listenerKey);
      off(announcementsRef);
    };
  }

  // System Status
  async updateSystemStatus(status: 'online' | 'maintenance', message?: string): Promise<void> {
    try {
      const systemRef = ref(database, 'systemStatus');
      await set(systemRef, {
        status,
        message: message || '',
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Error updating system status:', error);
      throw error;
    }
  }

  subscribeToSystemStatus(callback: (status: any) => void): () => void {
    const systemRef = ref(database, 'systemStatus');
    const listenerKey = 'systemStatus';

    const unsubscribe = onValue(systemRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : { status: 'online', message: '', lastUpdate: Date.now() };
      callback(data);
    });

    this.listeners.set(listenerKey, unsubscribe);

    return () => {
      this.listeners.delete(listenerKey);
      off(systemRef);
    };
  }

  // Cleanup
  cleanup(): void {
    this.listeners.forEach((unsubscribe, key) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

export const realtimeService = new RealtimeService();