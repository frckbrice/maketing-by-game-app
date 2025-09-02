import { ID, Timestamp } from '@/types';
import { Bell, X, Check, AlertCircle, Star, Trophy } from 'lucide-react';

// Live Notification Types
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

// Notification Icons Mapping
export const NOTIFICATION_ICONS = {
  game_update: Star,
  new_message: Bell,
  winner_announcement: Trophy,
  system_alert: AlertCircle,
} as const;

// Priority Colors Mapping
export const PRIORITY_COLORS = {
  low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  medium: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  high: 'text-red-600 bg-red-100 dark:bg-red-900/20',
} as const;

// Realtime Connection Types
export interface RealtimeConnection {
  id: string;
  userId: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSeen: Timestamp;
  deviceInfo: {
    userAgent: string;
    platform: string;
    appVersion: string;
  };
}

// Realtime Event Types
export interface RealtimeEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Timestamp;
  source: 'server' | 'client';
  targetUsers?: string[];
}

// Notification Settings
export interface NotificationSettings {
  userId: string;
  gameUpdates: boolean;
  messages: boolean;
  winnerAnnouncements: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
}

// Realtime Service Response
export interface RealtimeServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
