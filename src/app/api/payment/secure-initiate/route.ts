import { APP_URL } from '@/lib/constants';
import { db } from '@/lib/firebase/config';
import { secureApiHandlers } from '@/lib/security/secure-api';
import {
  logSecurityEventAction,
  validateInputAction,
} from '@/lib/security/server-actions';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * NOKASH Payment Initiation API - Secure Version
 *
 * Implements NOKASH API Payin v407 with comprehensive security
 * - Enhanced input validation and sanitization
 * - Rate limiting and fraud detection
 * - Comprehensive audit logging
 * - Production-ready error handling
 */

// NOKASH API Configuration
const NOKASH_CONFIG = {
  apiUrl: 'https://api.nokash.app',
  integratorKey:
    process.env.NOKASH_INTEGRATOR_KEY_PROD ||
    process.env.NOKASH_INTEGRATOR_KEY_TEST,
  applicationKey:
    process.env.NOKASH_APPLICATION_KEY_PROD ||
    process.env.NOKASH_APPLICATION_KEY_TEST,
  environment: process.env.NODE_ENV,
  timeout: 30000,
};

interface PaymentInitiateRequest {
  gameId: string;
  paymentMethod: 'MTN_MOMO' | 'ORANGE_MONEY';
  phoneNumber: string;
  amount: number;
  currency: string;
  userId: string;
}

interface NokashPayinResponse {
  status: 'REQUEST_OK' | 'REQUEST_BAD_INFOS' | string;
  message: string;
  data?: {
    id: string;
    status: 'PENDING' | 'FAILED' | 'CANCELED' | 'TIMEOUT' | 'SUCCESS';
    amount: string;
    orderId: string;
    phone: string;
  } | null;
}

export const POST = secureApiHandlers.createProtectedRoute(
  async (request: NextRequest) => {
    const startTime = Date.now();
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

    try {
      // Validate environment and configuration
      if (!NOKASH_CONFIG.integratorKey || !NOKASH_CONFIG.applicationKey) {
        await logSecurityEventAction(
          'payment_config_missing',
          { clientIP },
          'error'
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Payment service temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE',
          },
          { status: 503 }
        );
      }

      // Parse and validate request body
      const body: PaymentInitiateRequest = await request.json();
      const { gameId, paymentMethod, phoneNumber, amount, currency, userId } =
        body;

      // Comprehensive validation
      const validationErrors = await validatePaymentRequest(body);
      if (validationErrors.length > 0) {
        await logSecurityEventAction(
          'payment_validation_failed',
          {
            clientIP,
            userId,
            errors: validationErrors,
          },
          'warn'
        );

        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request parameters',
            details: validationErrors,
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Validate and format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber, paymentMethod);
      if (!formattedPhone.isValid) {
        await logSecurityEventAction(
          'payment_invalid_phone',
          {
            clientIP,
            userId,
            paymentMethod,
            error: formattedPhone.error,
          },
          'warn'
        );

        return NextResponse.json(
          {
            success: false,
            error: `Invalid phone number for ${paymentMethod}`,
            details: formattedPhone.error,
            code: 'INVALID_PHONE',
          },
          { status: 400 }
        );
      }

      // Log payment initiation attempt
      await logSecurityEventAction('payment_initiated', {
        clientIP,
        userId,
        gameId,
        amount,
        currency,
        paymentMethod,
        phoneNumber: formattedPhone.phone?.substring(0, 6) + '***',
      });

      // Create payment record in database
      const paymentRecord = await addDoc(collection(db, 'payments'), {
        gameId,
        userId,
        amount,
        currency,
        paymentMethod,
        phoneNumber: formattedPhone.phone,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        environment: NOKASH_CONFIG.environment,
        clientIP,
        version: 'v407-secure',
      });

      // Prepare NOKASH payload
      const nokashPayload = {
        i_space_key: NOKASH_CONFIG.integratorKey,
        app_space_key: NOKASH_CONFIG.applicationKey,
        order_id: paymentRecord.id,
        amount: amount.toString(),
        country: getCountryFromPhone(formattedPhone.phone!),
        payment_method: paymentMethod,
        payment_type: getPaymentType(
          paymentMethod,
          getCountryFromPhone(formattedPhone.phone!)
        ),
        callback_url: `${APP_URL}/api/payment/callback/nokash`,
        user_data: {
          user_phone: formattedPhone.phone!,
        },
      };

      // Make request to NOKASH API
      const nokashResponse = await callNokashPayinApi(nokashPayload);

      // Process NOKASH response
      if (nokashResponse.status === 'REQUEST_OK' && nokashResponse.data) {
        const { data } = nokashResponse;

        // Update payment record with NOKASH transaction details
        await updateDoc(doc(db, 'payments', paymentRecord.id), {
          nokashTransactionId: data.id,
          nokashStatus: data.status,
          nokashOrderId: data.orderId,
          nokashPhone: data.phone,
          status: mapNokashStatusToInternal(data.status),
          updatedAt: serverTimestamp(),
          processingTime: Date.now() - startTime,
        });

        await logSecurityEventAction('payment_success', {
          paymentId: paymentRecord.id,
          nokashId: data.id,
          userId,
          amount,
          processingTime: Date.now() - startTime,
        });

        return NextResponse.json({
          success: true,
          transactionId: paymentRecord.id,
          nokashTransactionId: data.id,
          status: mapNokashStatusToInternal(data.status),
          message:
            'Payment initiated successfully. Please check your mobile phone for the payment prompt.',
          orderId: data.orderId,
          amount: parseFloat(data.amount),
          phoneNumber: data.phone,
          processingTime: Date.now() - startTime,
        });
      } else {
        // Handle NOKASH API errors
        const errorMessage =
          nokashResponse.message || 'Payment initiation failed';

        await updateDoc(doc(db, 'payments', paymentRecord.id), {
          status: 'FAILED',
          errorMessage,
          nokashResponse: nokashResponse,
          failedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          processingTime: Date.now() - startTime,
        });

        await logSecurityEventAction(
          'payment_failed',
          {
            paymentId: paymentRecord.id,
            userId,
            error: errorMessage,
            nokashStatus: nokashResponse.status,
          },
          'error'
        );

        return NextResponse.json(
          {
            success: false,
            status: 'FAILED',
            message: errorMessage,
            nokashStatus: nokashResponse.status,
            code: 'NOKASH_API_ERROR',
            processingTime: Date.now() - startTime,
          },
          { status: 400 }
        );
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;

      await logSecurityEventAction(
        'payment_error',
        {
          clientIP,
          error: String(error),
          processingTime,
        },
        'error'
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error during payment processing',
          code: 'INTERNAL_ERROR',
          processingTime,
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Validate payment request parameters
 */
async function validatePaymentRequest(
  body: PaymentInitiateRequest
): Promise<string[]> {
  const errors: string[] = [];

  // Validate userId
  const userIdValidation = await validateInputAction(body.userId, 'username');
  if (!userIdValidation.isValid) {
    errors.push(...userIdValidation.errors);
  }

  // Validate gameId
  const gameIdValidation = await validateInputAction(
    body.gameId,
    'productName'
  );
  if (!gameIdValidation.isValid) {
    errors.push(...gameIdValidation.errors);
  }

  if (!['MTN_MOMO', 'ORANGE_MONEY'].includes(body.paymentMethod)) {
    errors.push('Invalid payment method. Must be MTN_MOMO or ORANGE_MONEY');
  }

  // Validate phoneNumber
  const phoneValidation = await validateInputAction(
    body.phoneNumber,
    'phoneNumber'
  );
  if (!phoneValidation.isValid) {
    errors.push(...phoneValidation.errors);
  }

  // Validate amount
  const amountValidation = await validateInputAction(body.amount, 'price');
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }

  // Validate currency
  const currencyValidation = await validateInputAction(
    body.currency,
    'productName'
  );
  if (!currencyValidation.isValid) {
    errors.push(...currencyValidation.errors);
  }

  // Additional amount validation
  if (body.currency === 'XAF' && body.amount < 1) {
    errors.push('Minimum amount for XAF is 1');
  }

  return errors;
}

/**
 * Format and validate phone number
 */
function formatPhoneNumber(
  phoneNumber: string,
  paymentMethod: string
): {
  isValid: boolean;
  phone?: string;
  error?: string;
} {
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Add country code if missing
  let formattedPhone = cleanPhone;
  if (!cleanPhone.startsWith('237')) {
    formattedPhone = '237' + cleanPhone;
  }

  let isValid = false;

  if (paymentMethod === 'ORANGE_MONEY') {
    isValid =
      /^237(69\d{7}|65\d{7}|655\d{6}|656\d{6}|657\d{6}|658\d{6}|685\d{6}|686\d{6}|687\d{6}|688\d{6})$/.test(
        formattedPhone
      );
  } else if (paymentMethod === 'MTN_MOMO') {
    isValid =
      /^237(67\d{7}|68\d{7}|65\d{7}|651\d{6}|652\d{6}|653\d{6}|654\d{6})$/.test(
        formattedPhone
      );
  }

  if (!isValid) {
    return {
      isValid: false,
      error: `Invalid ${paymentMethod} phone number format. Expected format: 237XXXXXXXX`,
    };
  }

  return {
    isValid: true,
    phone: formattedPhone,
  };
}

/**
 * Call NOKASH Payin API
 */
async function callNokashPayinApi(payload: any): Promise<NokashPayinResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NOKASH_CONFIG.timeout);

  try {
    const response = await fetch(
      `${NOKASH_CONFIG.apiUrl}/lapas-on-trans/trans/api-payin-request/407`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `NOKASH API HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result: NokashPayinResponse = await response.json();
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('NOKASH API request timeout');
    }

    throw error;
  }
}

/**
 * Get country code from phone number
 */
function getCountryFromPhone(phone: string): string {
  if (phone.startsWith('237')) return 'CM'; // Cameroon
  return 'CM'; // Default to Cameroon
}

/**
 * Get payment type for NOKASH API
 */
function getPaymentType(paymentMethod: string, country: string): string {
  const mapping: Record<string, Record<string, string>> = {
    CM: {
      MTN_MOMO: 'CM_MOBILEMONEY',
      ORANGE_MONEY: 'CM_MOBILEMONEY',
    },
  };

  return mapping[country]?.[paymentMethod] || 'CM_MOBILEMONEY';
}

/**
 * Map NOKASH status to internal status
 */
function mapNokashStatusToInternal(nokashStatus: string): string {
  const statusMapping: Record<string, string> = {
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    CANCELED: 'CANCELLED',
    CANCELLED: 'CANCELLED',
    TIMEOUT: 'EXPIRED',
    SUCCESS: 'SUCCESS',
  };

  return statusMapping[nokashStatus?.toUpperCase()] || 'PENDING';
}
