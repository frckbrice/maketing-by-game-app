import { ID, Timestamp } from '@/types';

// Common UI Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: any;
}

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationState;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

// Common Form Types
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
    | 'checkbox'
    | 'radio'
    | 'file'
    | 'date';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  error?: string;
}

export interface FormState {
  [key: string]: any;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Common Modal Types
export interface ModalState {
  isOpen: boolean;
  type: string;
  data?: any;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Common Notification Types
export interface SharedNotification {
  id: ID;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  duration?: number;
  isPersistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Timestamp;
}

export interface NotificationState {
  notifications: SharedNotification[];
  maxNotifications: number;
}

// Common File Types
export interface FileUpload {
  id: ID;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Timestamp;
  uploadedBy: ID;
  metadata?: Record<string, any>;
}

export interface FileUploadProgress {
  id: ID;
  progress: number;
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

// Common Search Types
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
  suggestions?: string[];
}

// Common Export Types
export interface ExportOptions {
  format: 'CSV' | 'EXCEL' | 'PDF' | 'JSON';
  fields: string[];
  filters?: Record<string, any>;
  dateRange?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
}

export interface ExportJob {
  id: ID;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Common Analytics Types
export interface AnalyticsMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  currency?: string;
}

export interface AnalyticsChart {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  options?: Record<string, any>;
}

// Common Settings Types
export interface SharedAppSettings {
  id: ID;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isPublic: boolean;
  updatedAt: Timestamp;
  updatedBy: ID;
}

export interface UserSettings {
  userId: ID;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  updatedAt: Timestamp;
}

// Common Audit Types
export interface AuditLog {
  id: ID;
  userId: ID;
  action: string;
  resource: string;
  resourceId: ID;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

export interface AuditLogQueryParams {
  userId?: ID;
  action?: string;
  resource?: string;
  resourceId?: ID;
  startDate?: Timestamp;
  endDate?: Timestamp;
  limit?: number;
  page?: number;
  sortBy?: 'timestamp' | 'action' | 'resource';
  sortOrder?: 'asc' | 'desc';
}

// Common Cache Types
export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: Timestamp;
  ttl: number;
  isExpired: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
}

// Common Validation Types
export interface ValidationRule {
  field: string;
  rule:
    | 'required'
    | 'email'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'min'
    | 'max'
    | 'custom';
  value?: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}
