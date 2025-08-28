// Core Types
export type ID = string;
export type Timestamp = number;
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED' | 'FAILED';
export type SortOrder = 'asc' | 'desc';
export type Environment = 'development' | 'production' | 'test';

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// User and Authentication Types
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailUpdates: boolean;
  smsUpdates: boolean;
  timezone: string;
  currency: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  gameUpdates: boolean;
  winnerAnnouncements: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowContact: boolean;
  dataSharing: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface PasswordReset {
  email: string;
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'USER' | 'VENDOR' | 'ADMIN' | 'MODERATOR';
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  avatar?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  businessProfile?: BusinessProfile;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

// Business Profile for VENDOR and ADMIN users
export interface BusinessProfile {
  companyName: string;
  businessType: 'individual' | 'corporation' | 'partnership' | 'llc';
  taxId: string;
  address: BusinessAddress;
  contactPerson: BusinessContact;
  paymentMethods: string[];
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled';
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  maxGames: number;
  canCreateGames: boolean;
  canManageUsers: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: BusinessDocument[];
}

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BusinessContact {
  name: string;
  email: string;
  phone: string;
}

export interface BusinessDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'id_document' | 'other';
  name: string;
  url: string;
  uploadedAt: Timestamp;
  verifiedAt?: Timestamp;
}

export interface VendorApplication {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyName: string;
  businessRegistrationNumber: string;
  companyWebsite?: string;
  contactEmail: string;
  contactPhone: string;
  companyLogoUrl?: string;
  businessCertificateUrl?: string;
  productCategory: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

// Lottery Game Types
export type GameType = 'daily' | 'weekly' | 'monthly' | 'special';
export type PrizeType = 'cash' | 'product' | 'service' | 'experience';

export interface Prize {
  id: ID;
  name: string;
  description: string;
  type: PrizeType;
  value: number;
  currency: string;
  image?: string;
  quantity: number;
  remaining: number;
}

export interface GameRule {
  id: ID;
  title: string;
  description: string;
  isRequired: boolean;
  order: number;
}

export interface GameImage {
  id: ID;
  url: string;
  alt: string;
  type: 'hero' | 'thumbnail' | 'gallery';
  order: number;
}

export interface GameCategory {
  id: ID;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LotteryGame {
  id: ID;
  title: string;
  description: string;
  type: GameType;
  categoryId: ID;
  category: GameCategory;
  ticketPrice: number;
  currency: string;
  maxParticipants: number;
  currentParticipants: number;
  totalPrizePool: number;
  prizes: Prize[];
  rules: GameRule[];
  images: GameImage[];
  startDate: Timestamp;
  endDate: Timestamp;
  drawDate: Timestamp;
  status: 'DRAFT' | 'ACTIVE' | 'DRAWING' | 'CLOSED';
  isActive: boolean;
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Ticket Types
export interface LotteryTicket {
  id: ID;
  gameId: ID;
  userId: ID;
  ticketNumber: string;
  purchaseDate: Timestamp;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  isWinner: boolean;
  prizeId?: ID;
  prizeAmount?: number;
  claimedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TicketPurchase {
  gameId: ID;
  quantity: number;
  paymentMethodId: ID;
  totalAmount: number;
  currency: string;
}

// Payment Types
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PaymentProvider =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'DIGITAL_WALLET';

export interface PaymentMethod {
  id: ID;
  userId: ID;
  type: PaymentProvider;
  name: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaymentIntent {
  id: ID;
  userId: ID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId: ID;
  description: string;
  metadata: Record<string, any>;
  clientSecret?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Payment {
  id: ID;
  userId: ID;
  ticketId: ID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId: ID;
  paymentIntentId: ID;
  transactionId?: string;
  failureReason?: string;
  refundedAt?: Timestamp;
  refundAmount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Winner Types
export interface Winner {
  id: ID;
  gameId: ID;
  userId: ID;
  ticketId: ID;
  prizeId: ID;
  prizeAmount: number;
  currency: string;
  announcedAt: Timestamp;
  claimedAt?: Timestamp;
  isClaimed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WinnerAnnouncement {
  id: ID;
  gameId: ID;
  winners: Winner[];
  announcedAt: Timestamp;
  announcementText: string;
  isPublic: boolean;
  createdAt: Timestamp;
}

// Notification Types
export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'GAME_UPDATE'
  | 'WINNER';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: ID;
  userId: ID;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Timestamp;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Analytics Types
export interface GameAnalytics {
  gameId: ID;
  totalTickets: number;
  totalRevenue: number;
  averageTicketPrice: number;
  participantCount: number;
  completionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
}

export interface HourlyStats {
  hour: number;
  ticketsSold: number;
  revenue: number;
  participants: number;
}

export interface Demographics {
  ageGroups: AgeGroupStats[];
  locations: LocationStats[];
  devices: DeviceStats[];
}

export interface AgeGroupStats {
  ageGroup: string;
  count: number;
  percentage: number;
}

export interface LocationStats {
  country: string;
  city?: string;
  count: number;
  percentage: number;
}

export interface DeviceStats {
  deviceType: string;
  count: number;
  percentage: number;
}

// Admin Types
export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  activeGames: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalWinners: number;
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  lastCheck: Timestamp;
}

export interface AdminAction {
  id: ID;
  adminId: ID;
  action: string;
  targetType: string;
  targetId: ID;
  details: Record<string, any>;
  timestamp: Timestamp;
  ipAddress: string;
  userAgent: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: {
    timestamp: Timestamp;
    version: string;
    requestId: string;
  };
}

export interface ApiError {
  field?: string;
  message: string;
  code: string;
  details?: any;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'select'
    | 'textarea'
    | 'checkbox';
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

interface UseDataTableOptions<T> {
  queryKey: string[];
  fetchFn: (params: DataTableParams) => Promise<DataTableResponse<T>>;
  initialPageSize?: number;
  staleTime?: number;
  gcTime?: number;
}

interface DataTableParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

interface DataTableResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseDataTableReturn<T> {
  data: T[] | undefined;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  refresh: () => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
