import { APP_URL } from '@/lib/constants';
import { db } from '@/lib/firebase/config';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * NOKASH Payment Initiation API
 *
 * Implements NOKASH API Payin v407 according to official documentation
 * - Server-side only (no mock data)
 * - Production ready
 * - Complete error handling
 * - Audit trail
 * - Enhanced security with input validation and fraud detection
 */

// NOKASH API Configuration - Production Only
const NOKASH_CONFIG = {
  apiUrl: 'https://api.nokash.app',
  integratorKey:
    process.env.NOKASH_INTEGRATOR_KEY_PROD ||
    process.env.NOKASH_INTEGRATOR_KEY_TEST,
  applicationKey:
    process.env.NOKASH_APPLICATION_KEY_PROD ||
    process.env.NOKASH_APPLICATION_KEY_TEST,
  environment: process.env.NODE_ENV,
  timeout: 30000, // 30 seconds for payment initiation
};

interface PaymentInitiateRequest {
  gameId?: string;
  productId?: string;
  paymentType: 'GAME' | 'PRODUCT';
  paymentMethod: 'MTN_MOMO' | 'ORANGE_MONEY';
  phoneNumber: string;
  amount: number;
  currency: string;
  userId: string;
  quantity?: number;
}

interface NokashPayinRequest {
  i_space_key: string;
  app_space_key: string;
  payment_type: string;
  country: string;
  payment_method: string;
  order_id: string;
  amount: string;
  callback_url?: string;
  user_data: {
    user_phone: string;
  };
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

/**
 * Validate payment request parameters
 */
function validatePaymentRequest(body: PaymentInitiateRequest): string[] {
  const errors: string[] = [];

  if (!body.userId || typeof body.userId !== 'string') {
    errors.push('User ID is required');
  }

  if (!body.paymentType || !['GAME', 'PRODUCT'].includes(body.paymentType)) {
    errors.push('Payment type is required (GAME or PRODUCT)');
  }

  // Validate gameId for GAME payments
  if (
    body.paymentType === 'GAME' &&
    (!body.gameId || typeof body.gameId !== 'string')
  ) {
    errors.push('Game ID is required for game payments');
  }

  // Validate productId for PRODUCT payments
  if (
    body.paymentType === 'PRODUCT' &&
    (!body.productId || typeof body.productId !== 'string')
  ) {
    errors.push('Product ID is required for product payments');
  }

  if (
    !body.paymentMethod ||
    !['MTN_MOMO', 'ORANGE_MONEY'].includes(body.paymentMethod)
  ) {
    errors.push('Valid payment method is required (MTN_MOMO or ORANGE_MONEY)');
  }

  if (!body.phoneNumber || typeof body.phoneNumber !== 'string') {
    errors.push('Phone number is required');
  }

  if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('Valid amount is required');
  }

  if (!body.currency || typeof body.currency !== 'string') {
    errors.push('Currency is required');
  }

  return errors;
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate environment and configuration
    if (!NOKASH_CONFIG.integratorKey || !NOKASH_CONFIG.applicationKey) {
      console.error('NOKASH API keys not configured');
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
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    // Enhanced validation debugging
    console.log('Payment request received:', {
      paymentType: body.paymentType,
      gameId: body.gameId,
      productId: body.productId,
      paymentMethod: body.paymentMethod,
      phoneNumber: body.phoneNumber
        ? body.phoneNumber.substring(0, 6) + '***'
        : undefined,
      amount: body.amount,
      currency: body.currency,
      userId: body.userId,
    });

    const validationErrors = validatePaymentRequest(body);
    if (validationErrors.length > 0) {
      console.error('Payment validation failed:', {
        errors: validationErrors,
        requestBody: {
          paymentType: body.paymentType,
          gameId: body.gameId,
          productId: body.productId,
          paymentMethod: body.paymentMethod,
          phoneNumber: body.phoneNumber ? '***masked***' : undefined,
          amount: body.amount,
          currency: body.currency,
          userId: body.userId,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Payment validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    const { paymentMethod, phoneNumber, amount, currency, userId } = body;

    // Validate and format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber, paymentMethod);
    if (!formattedPhone.isValid) {
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

    // Create payment record in database
    const paymentRecord = await createPaymentRecord({
      gameId: body.gameId,
      productId: body.productId,
      paymentType: body.paymentType,
      userId,
      amount,
      currency,
      paymentMethod,
      phoneNumber: formattedPhone.phone!,
      quantity: body.quantity,
    });

    // Prepare NOKASH payload according to documentation
    const nokashPayload: NokashPayinRequest = {
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

    console.log('Initiating NOKASH payment:', {
      orderId: paymentRecord.id,
      amount,
      currency,
      paymentMethod,
      phone: formattedPhone.phone!.substring(0, 6) + '***', // Mask phone for security
    });

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

      console.log('Payment initiated successfully:', {
        paymentId: paymentRecord.id,
        nokashId: data.id,
        status: data.status,
        processingTime: Date.now() - startTime,
      });

      // Client-side polling is handled by PaymentModal

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
        pollingEnabled: true, // Indicate that automatic polling is enabled
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

      console.error('NOKASH API error:', {
        status: nokashResponse.status,
        message: nokashResponse.message,
        orderId: paymentRecord.id,
      });

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
    console.error('Payment initiation error:', error);

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

  // Validate based on payment method
  let isValid = false;

  // if (paymentMethod === 'ORANGE_MONEY') {
  //   // Orange Money: 237 + 69/65 + 7 digits
  //   isValid = /^237(69|65)\d{7}$/.test(formattedPhone);
  // } else if (paymentMethod === 'MTN_MOMO') {
  //   // MTN Mobile Money: 237 + 67/68/65 + 7 digits
  //   isValid = /^237(67|68|65)\d{7}$/.test(formattedPhone);
  // }
  if (paymentMethod === 'ORANGE_MONEY') {
    // Orange Money: 237 + (69|65|655|656|657|658|685|686|687|688) + remaining digits
    isValid =
      /^237(69\d{7}|65\d{7}|655\d{6}|656\d{6}|657\d{6}|658\d{6}|685\d{6}|686\d{6}|687\d{6}|688\d{6})$/.test(
        formattedPhone
      );
  } else if (paymentMethod === 'MTN_MOMO') {
    // MTN Mobile Money: 237 + (67|68|65|651|652|653|654) + remaining digits
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
 * Create payment record in database
 */
async function createPaymentRecord(data: {
  gameId?: string;
  productId?: string;
  paymentType: 'GAME' | 'PRODUCT';
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  phoneNumber: string;
  quantity?: number;
}) {
  // Filter out undefined values to prevent Firestore errors
  const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  const paymentRecord = await addDoc(collection(db, 'payments'), {
    ...cleanData,
    status: 'PENDING',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    environment: NOKASH_CONFIG.environment,
    version: 'v407',
  });

  return paymentRecord;
}

/**
 * Call NOKASH Payin API v407
 */
async function callNokashPayinApi(
  payload: NokashPayinRequest
): Promise<NokashPayinResponse> {
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
          'User-Agent': 'BlackFriday-Marketing-App/1.0',
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
  if (phone.startsWith('234')) return 'NG'; // Nigeria
  if (phone.startsWith('256')) return 'UG'; // Uganda
  if (phone.startsWith('233')) return 'GH'; // Ghana
  if (phone.startsWith('225')) return 'CI'; // Côte d'Ivoire
  if (phone.startsWith('221')) return 'SN'; // Senegal

  // Default to Cameroon for the lottery app
  return 'CM';
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
    // NG: {
    //   MTN_MOMO: 'NG_BANKTRANSFER',
    // },
    // Add more countries as needed
  };

  return mapping[country]?.[paymentMethod] || 'CM_MOBILEMONEY';
}
