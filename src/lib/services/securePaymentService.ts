'use client';

import { auth } from '@/lib/firebase/config';

export type PaymentMethod = 'MTN_MOMO' | 'ORANGE_MONEY';

export interface PaymentRequest {
  gameId?: string;
  productId?: string;
  paymentType: 'GAME' | 'PRODUCT';
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  amount: number;
  currency: string;
  userId: string;
  quantity?: number;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  nokashTransactionId?: string;
  status: PaymentStatus;
  message: string;
  errorCode?: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PROCESSING';

export interface TransactionStatusResponse {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  fees: number;
  currency: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  message?: string;
}

class SecurePaymentService {
  private static instance: SecurePaymentService;

  static getInstance(): SecurePaymentService {
    if (!SecurePaymentService.instance) {
      SecurePaymentService.instance = new SecurePaymentService();
    }
    return SecurePaymentService.instance;
  }

  // Initiate payment through secure backend API
  async initiatePayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentRequest,
          userId: user.uid,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));

        // Log detailed error for debugging
        console.error('Payment API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestPayload: {
            ...paymentRequest,
            phoneNumber: paymentRequest.phoneNumber
              ? '***masked***'
              : undefined,
          },
          responseHeaders: {
            'content-type': response.headers.get('content-type'),
            'content-length': response.headers.get('content-length'),
          },
        });

        // More specific error handling
        if (response.status === 400) {
          console.error('400 Bad Request Details:', {
            validationErrors:
              errorData.details || 'No validation details provided',
            errorCode: errorData.code,
            errorMessage: errorData.error || errorData.message,
          });
        }

        throw new Error(
          errorData.message || errorData.error || 'Payment initiation failed'
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Payment initiation error:', error);

      // Handle specific error types
      let errorMessage = 'Payment processing failed';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Payment request timed out. Please try again.';
        } else if (
          error.message.includes('NetworkError') ||
          error.message.includes('fetch')
        ) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        status: 'FAILED',
        message: errorMessage,
      };
    }
  }

  // Check transaction status through secure backend API
  async checkTransactionStatus(
    transactionId: string
  ): Promise<TransactionStatusResponse | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(
        `/api/payment/status/${transactionId}?userId=${user.uid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Status check failed:', errorData);
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Transaction status check timeout:', error);
        return null;
      }
      console.error('Error checking transaction status:', error);
      return null;
    }
  }

  // Validate phone number format for payment methods
  validatePhoneNumber(phone: string, method: PaymentMethod): boolean {
    const cleanPhone = phone.replace(/[\s-()]/g, '');

    if (method === 'ORANGE_MONEY') {
      // Orange Money numbers start with 69 or 65 in Cameroon
      return /^(237)?(69|65)\d{7}$/.test(cleanPhone);
    } else if (method === 'MTN_MOMO') {
      // MTN Mobile Money numbers start with 67, 68, or 65 in Cameroon
      return /^(237)?(67|68|65)\d{7}$/.test(cleanPhone);
    }

    return false;
  }

  // Get payment method display information
  getPaymentMethodInfo(method: PaymentMethod) {
    const info = {
      MTN_MOMO: {
        name: 'MTN Mobile Money',
        icon: '📱',
        color: '#FFD320',
        placeholder: '67XXXXXXX, 68XXXXXXX or 65XXXXXXX',
      },
      ORANGE_MONEY: {
        name: 'Orange Money',
        icon: '📱',
        color: '#FF7900',
        placeholder: '69XXXXXXX or 65XXXXXXX',
      },
    };

    return (
      info[method] || {
        name: method,
        icon: '💳',
        color: '#666',
        placeholder: 'Enter phone number',
      }
    );
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/[\s-()]/g, '');

    if (cleanPhone.length === 9) {
      return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5, 7)} ${cleanPhone.slice(7)}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('237')) {
      return `+237 ${cleanPhone.slice(3, 5)} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8, 10)} ${cleanPhone.slice(10)}`;
    }

    return phone;
  }

  // Get country from phone number
  getCountryFromPhone(phone: string): string {
    const cleanPhone = phone.replace(/[\s-()]/g, '');

    if (cleanPhone.startsWith('237') || cleanPhone.startsWith('+237'))
      return 'CM'; // Cameroon
    if (cleanPhone.startsWith('234') || cleanPhone.startsWith('+234'))
      return 'NG'; // Nigeria
    if (cleanPhone.startsWith('256') || cleanPhone.startsWith('+256'))
      return 'UG'; // Uganda
    if (cleanPhone.startsWith('233') || cleanPhone.startsWith('+233'))
      return 'GH'; // Ghana
    if (cleanPhone.startsWith('225') || cleanPhone.startsWith('+225'))
      return 'CI'; // Côte d'Ivoire
    if (cleanPhone.startsWith('221') || cleanPhone.startsWith('+221'))
      return 'SN'; // Senegal

    // Default to Cameroon for local numbers
    return 'CM';
  }

  // Get supported payment methods based on country
  getSupportedPaymentMethods(country: string = 'CM'): PaymentMethod[] {
    const methods: PaymentMethod[] = [];

    switch (country) {
      case 'CM': // Cameroon
        methods.push('MTN_MOMO', 'ORANGE_MONEY');
        break;
      case 'UG': // Uganda
      case 'GH': // Ghana
        methods.push('MTN_MOMO');
        break;
      case 'CI': // Côte d'Ivoire
        methods.push('MTN_MOMO', 'ORANGE_MONEY');
        break;
      case 'SN': // Senegal
        methods.push('ORANGE_MONEY');
        break;
      default:
        // Default mobile money options
        methods.push('MTN_MOMO', 'ORANGE_MONEY');
        break;
    }

    return methods;
  }
}

export const securePaymentService = SecurePaymentService.getInstance();
