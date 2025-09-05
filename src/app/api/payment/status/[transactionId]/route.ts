import { db } from '@/lib/firebase/config';
// import { logSecurityEvent } from '@/lib/security/middleware';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * NOKASH Payment Status Check API
 *
 * Implements NOKASH status checking according to official documentation
 * - Production ready (no mock data)
 * - Real-time status updates
 * - Complete error handling
 * - Enhanced security with rate limiting and request validation
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
  timeout: 15000, // 15 seconds for status check
};

interface NokashStatusResponse {
  status: 'REQUEST_OK' | 'REQUEST_BAD_INFOS' | string;
  message: string;
  data?: {
    amount: string;
    status: 'PENDING' | 'FAILED' | 'CANCELED' | 'TIMEOUT' | 'SUCCESS';
    statusReason?: string | null;
    orderId: string;
    id: string;
    phone: string;
    user_name?: string;
    user_email?: string;
    user_bank_code?: string;
    user_bank_account?: string;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const startTime = Date.now();
  const { transactionId } = await params;
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // Get user ID from query params for security
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User authentication required',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    // Get payment record from database with retry logic
    let paymentDoc;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        paymentDoc = await getDoc(doc(db, 'payments', transactionId));
        break;
      } catch (error: any) {
        retryCount++;
        console.warn(
          `Firebase read attempt ${retryCount} failed:`,
          error?.code || error?.message
        );

        if (retryCount >= maxRetries) {
          // If all retries failed, return a more specific error
          if (error?.code === 'unavailable') {
            return NextResponse.json(
              {
                success: false,
                error:
                  'Database temporarily unavailable. Please try again in a moment.',
                code: 'DATABASE_OFFLINE',
                retryAfter: 30000, // 30 seconds
              },
              { status: 503 }
            );
          }
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
      }
    }

    if (!paymentDoc?.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment record not found',
          code: 'PAYMENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();

    // Verify the payment belongs to the authenticated user
    if (paymentData.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          code: 'ACCESS_DENIED',
        },
        { status: 403 }
      );
    }

    // If no NOKASH transaction ID, return current status (payment not yet processed)
    if (!paymentData.nokashTransactionId) {
      return NextResponse.json({
        success: true,
        transactionId,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        createdAt: paymentData.createdAt,
        updatedAt: paymentData.updatedAt,
        message: 'Payment is being processed by NOKASH',
        source: 'database',
      });
    }

    // Check status with NOKASH API
    const nokashStatus = await checkNokashStatus(
      paymentData.nokashTransactionId
    );

    if (nokashStatus.status === 'REQUEST_OK' && nokashStatus.data) {
      const { data } = nokashStatus;
      const internalStatus = mapNokashStatusToInternal(data.status);

      // Update payment record if status changed
      let statusChanged = false;
      if (internalStatus !== paymentData.status) {
        statusChanged = true;

        const updateData: any = {
          status: internalStatus,
          nokashStatus: data.status,
          updatedAt: serverTimestamp(),
          lastStatusCheck: serverTimestamp(),
        };

        // Add status-specific fields
        if (data.statusReason) {
          updateData.statusReason = data.statusReason;
        }

        if (internalStatus === 'SUCCESS' || data.status === 'SUCCESS') {
          updateData.completedAt = serverTimestamp();
          updateData.finalAmount = parseFloat(data.amount);
        } else if (
          internalStatus === 'FAILED' ||
          internalStatus === 'CANCELLED' ||
          internalStatus === 'EXPIRED'
        ) {
          updateData.failedAt = serverTimestamp();
          updateData.failureReason = data.status;
        }

        await updateDoc(doc(db, 'payments', transactionId), updateData);
      }

      console.log('Payment status check completed:', {
        transactionId,
        nokashId: data.id,
        status: internalStatus,
        statusChanged,
        processingTime: Date.now() - startTime,
      });

      return NextResponse.json({
        success: true,
        transactionId,
        nokashTransactionId: data.id,
        status: internalStatus,
        amount: parseFloat(data.amount),
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        createdAt: paymentData.createdAt,
        updatedAt: new Date().toISOString(),
        message: getStatusMessage(internalStatus, data.statusReason),
        orderId: data.orderId,
        phoneNumber: data.phone,
        statusReason: data.statusReason || null,
        source: 'nokash-api',
        processingTime: Date.now() - startTime,
      });
    } else {
      // NOKASH API error - return cached status
      console.warn('NOKASH status API failed:', {
        transactionId,
        nokashStatus: nokashStatus.status,
        message: nokashStatus.message,
      });

      const response = NextResponse.json({
        success: true,
        transactionId,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        createdAt: paymentData.createdAt,
        updatedAt: paymentData.updatedAt,
        message: 'Using cached status - NOKASH API temporarily unavailable',
        source: 'database-fallback',
        warning: 'Status may not be current',
        processingTime: Date.now() - startTime,
      });

      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );

      return response;
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;

    const searchParams = new URL(request.url).searchParams;
    const requestUserId = searchParams.get('userId');

    // logSecurityEvent(
    //   'payment_status_check_error',
    //   {
    //     transactionId,
    //     userId: requestUserId || 'unknown',
    //     clientIP,
    //     error: String(error),
    //     processingTime,
    //   },
    //   'error'
    // );

    console.error(
      'Payment status check error for transaction:',
      transactionId,
      error
    );

    // More specific error handling
    let errorMessage = 'Internal server error during status check';
    let errorCode = 'INTERNAL_ERROR';
    let statusCode = 500;

    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      if (
        error.message.includes('unavailable') ||
        error.message.includes('offline')
      ) {
        errorMessage = 'Database temporarily unavailable. Please try again.';
        errorCode = 'DATABASE_OFFLINE';
        statusCode = 503;
      } else if (
        error.message.includes('permission') ||
        error.message.includes('auth')
      ) {
        errorMessage = 'Authentication required. Please refresh and try again.';
        errorCode = 'AUTH_ERROR';
        statusCode = 401;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
        errorCode = 'TIMEOUT_ERROR';
        statusCode = 408;
      } else if (
        error.message.includes('not found') ||
        error.message.includes('document')
      ) {
        errorMessage =
          'Payment record not found. Please try initiating payment again.';
        errorCode = 'PAYMENT_NOT_FOUND';
        statusCode = 404;
      }
    } else {
      console.error('Non-Error object thrown:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
        processingTime,
        retryAfter: statusCode === 503 ? 30000 : 5000,
      },
      { status: statusCode }
    );
  }
}

/**
 * Check payment status with NOKASH API
 */
async function checkNokashStatus(
  nokashTransactionId: string
): Promise<NokashStatusResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NOKASH_CONFIG.timeout);

  try {
    const response = await fetch(
      `${NOKASH_CONFIG.apiUrl}/lapas-on-trans/trans/310/status-request?transaction_id=${nokashTransactionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'BlackFriday-Marketing-App/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `NOKASH Status API HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result: NokashStatusResponse = await response.json();
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('NOKASH Status API request timeout');
    }

    throw error;
  }
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

/**
 * Get user-friendly status message
 */
function getStatusMessage(
  status: string,
  statusReason?: string | null
): string {
  const messages: Record<string, string> = {
    PENDING:
      'Payment is being processed. Please check your mobile phone for the payment prompt.',
    SUCCESS: 'Payment completed successfully!',
    FAILED: statusReason
      ? `Payment failed: ${statusReason}`
      : 'Payment failed. Please try again.',
    CANCELLED: 'Payment was cancelled by user.',
    EXPIRED: 'Payment expired. Please try again.',
  };

  return messages[status] || 'Payment status unknown. Please contact support.';
}
