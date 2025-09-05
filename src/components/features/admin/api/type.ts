export interface VendorData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'VENDOR';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: number;
  updatedAt: number;
  companyName?: string;
  productCategory?: string;
  totalGames: number;
  totalRevenue: number;
  averageRating: number;
  isVerified: boolean;
}

export type StatusFilter = 'all' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
  users: number;
  games: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalTransactions: number;
  totalUsers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  transactionGrowth: number;
  userGrowth: number;
}

// analytics data
export interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalUsers: number;
    userGrowth: number;
    totalGames: number;
    gameGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
  };
  revenueByDay: Array<{ date: string; revenue: number; tickets: number }>;
  usersByDay: Array<{ date: string; users: number; retention: number }>;
  categoryPerformance: Array<{
    name: string;
    revenue: number;
    games: number;
    users: number;
  }>;
  gamePerformance: Array<{
    title: string;
    participants: number;
    revenue: number;
    conversionRate: number;
  }>;
  userDemographics: Array<{ name: string; value: number; color: string }>;
  deviceStats: Array<{ device: string; percentage: number; users: number }>;
}

// notifications data
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SENT' | 'SCHEDULED' | 'FAILED';
  targetAudience: 'ALL' | 'USERS' | 'VENDORS' | 'ADMINS' | 'SPECIFIC';
  recipients: string[];
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  createdBy: string;
  readCount: number;
  totalRecipients: number;
}

// admin roles data
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

//   admin settings data
export interface AppSettings {
  id?: string;
  // General Settings
  appName: string;
  appDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;

  // Game Settings
  defaultTicketPrice: number;
  defaultCurrency: string;
  maxTicketsPerUser: number;
  drawFrequency: 'daily' | 'weekly' | 'monthly';

  // Payment Settings
  enableStripe: boolean;
  enablePayPal: boolean;
  enableMobileMoney: boolean;
  minWithdrawal: number;

  // Notification Settings
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;

  // Security Settings
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  sessionTimeout: number; // in minutes

  // Appearance
  primaryColor: string;
  secondaryColor: string;

  // Analytics
  enableAnalytics: boolean;
  enableCrashReporting: boolean;

  updatedAt: number;
  updatedBy: string;
}

//   admin side bar data
export interface AdminSidebarProps {
  className?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

// Product interface is imported from shops feature
