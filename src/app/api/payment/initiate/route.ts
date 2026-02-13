import { db } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

// NOKASH API Configuration - Server-side only
const NOKASH_CONFIG = {
  apiUrl:
    process.env.NODE_ENV === 'production'
      ? 'https://api.nokash.app'
      : 'https://api-test.nokash.app',
  integratorKey:
    process.env.NODE_ENV === 'production'
      ? process.env.NOKASH_INTEGRATOR_KEY_PROD
      : process.env.NOKASH_INTEGRATOR_KEY_TEST,
  applicationKey:
    process.env.NODE_ENV === 'production'
      ? process.env.NOKASH_APPLICATION_KEY_PROD
      : process.env.NOKASH_APPLICATION_KEY_TEST,
};

interface PaymentInitiateRequest {
  gameId: string;
  paymentMethod: 'MTN_MOMO' | 'ORANGE_MONEY';
  phoneNumber: string;
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request body (client will provide after auth)
    const body: PaymentInitiateRequest & { userId: string } =
      await request.json();
    const { gameId, paymentMethod, phoneNumber, amount, currency, userId } =
      body;

    // Basic validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Validate request
    if (!gameId || !paymentMethod || !phoneNumber || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/[\s-()]/g, '');
    let isValidPhone = false;

    if (paymentMethod === 'ORANGE_MONEY') {
      isValidPhone = /^(237)?(69|65)\d{7}$/.test(cleanPhone);
    } else if (paymentMethod === 'MTN_MOMO') {
      isValidPhone = /^(237)?(67|68|65)\d{7}$/.test(cleanPhone);
    }

    if (!isValidPhone) {
      return NextResponse.json(
        { error: 'Invalid phone number for selected payment method' },
        { status: 400 }
      );
    }

    // Create payment record in database
    const paymentRecord = await addDoc(collection(db, 'payments'), {
      gameId,
      userId,
      amount,
      currency,
      paymentMethod,
      phoneNumber: cleanPhone,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Get country from phone number
    const country = getCountryFromPhone(cleanPhone);
    const paymentType = getPaymentType(paymentMethod, country);

    // Prepare NOKASH payload
    const nokashPayload = {
      i_space_key: NOKASH_CONFIG.integratorKey,
      app_space_key: NOKASH_CONFIG.applicationKey,
      order_id: paymentRecord.id,
      amount: amount.toString(),
      country,
      payment_method: paymentMethod,
      payment_type: paymentType,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/callback/nokash`,
      payer_data: {
        payer_phone: cleanPhone,
      },
    };

    // Make request to NOKASH API
    const nokashResponse = await fetch(
      `${NOKASH_CONFIG.apiUrl}/lapas-on-trans/trans/api-payin-request/407`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nokashPayload),
      }
    );

    const nokashResult = await nokashResponse.json();

    if (nokashResult.status === 'success' || nokashResult.status === 200) {
      // Update payment record with NOKASH transaction ID
      await addDoc(collection(db, 'payments'), {
        ...paymentRecord,
        nokashTransactionId: nokashResult.transaction_id,
        status: 'PROCESSING',
        updatedAt: serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        transactionId: paymentRecord.id,
        nokashTransactionId: nokashResult.transaction_id,
        status: 'PROCESSING',
        message:
          'Payment initiated. Please check your phone for the mobile money prompt.',
      });
    } else {
      // Update payment record with failure
      await addDoc(collection(db, 'payments'), {
        ...paymentRecord,
        status: 'FAILED',
        errorMessage: nokashResult.message || 'Payment initiation failed',
        updatedAt: serverTimestamp(),
      });

      return NextResponse.json(
        {
          success: false,
          status: 'FAILED',
          message: nokashResult.message || 'Payment initiation failed',
          errorCode: nokashResult.error_code,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'FAILED',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function getCountryFromPhone(phone: string): string {
  // Extract country from phone number
  if (phone.startsWith('237') || phone.startsWith('+237')) return 'CM'; // Cameroon
  if (phone.startsWith('234') || phone.startsWith('+234')) return 'NG'; // Nigeria
  if (phone.startsWith('256') || phone.startsWith('+256')) return 'UG'; // Uganda
  if (phone.startsWith('233') || phone.startsWith('+233')) return 'GH'; // Ghana
  if (phone.startsWith('225') || phone.startsWith('+225')) return 'CI'; // Côte d'Ivoire
  if (phone.startsWith('221') || phone.startsWith('+221')) return 'SN'; // Senegal

  // Default to Cameroon if country cannot be determined
  return 'CM';
}

function getPaymentType(paymentMethod: string, country: string): string {
  const mapping: { [key: string]: { [key: string]: string } } = {
    CM: {
      MTN_MOMO: 'CM_MOBILEMONEY',
      ORANGE_MONEY: 'CM_MOBILEMONEY',
    },
    // Add other countries as needed
  };

  return mapping[country]?.[paymentMethod] || 'CM_MOBILEMONEY';
}
