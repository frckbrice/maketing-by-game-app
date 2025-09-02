import { ID, Timestamp } from '@/types';

// Payment Types
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentProvider = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'MOBILE_MONEY' | 'CRYPTO';
export type PaymentMethodType = 'CARD' | 'BANK_ACCOUNT' | 'WALLET' | 'CRYPTO_ADDRESS';

export interface PaymentMethod {
  id: ID;
  userId: ID;
  type: PaymentMethodType;
  provider: PaymentProvider;
  name: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
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
  confirmationMethod: 'automatic' | 'manual';
  captureMethod: 'automatic' | 'manual';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaymentTransaction {
  id: ID;
  userId: ID;
  paymentIntentId: ID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  description: string;
  metadata: Record<string, any>;
  errorCode?: string;
  errorMessage?: string;
  processedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Refund {
  id: ID;
  transactionId: ID;
  amount: number;
  currency: string;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Wallet Types
export interface Wallet {
  id: ID;
  userId: ID;
  balance: number;
  currency: string;
  isActive: boolean;
  lastTransactionAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WalletTransaction {
  id: ID;
  walletId: ID;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'REFUND' | 'BONUS';
  amount: number;
  currency: string;
  description: string;
  referenceId?: ID;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  processedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subscription Types
export interface Subscription {
  id: ID;
  userId: ID;
  planId: ID;
  planName: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SubscriptionPlan {
  id: ID;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxGames: number;
  maxUsers: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Invoice Types
export interface Invoice {
  id: ID;
  userId: ID;
  subscriptionId?: ID;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';
  dueDate: Timestamp;
  paidAt?: Timestamp;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InvoiceItem {
  id: ID;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  metadata?: Record<string, any>;
}

// Payment API Response Types
export interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface PaymentMethodsResponse {
  data: PaymentMethod[];
  total: number;
}

export interface TransactionsResponse {
  data: PaymentTransaction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
