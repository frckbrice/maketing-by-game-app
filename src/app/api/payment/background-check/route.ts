import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Background Payment Status Checker API
 *
 * Periodically checks for stuck pending payments and initiates status polling
 * - Finds payments stuck in PENDING state
 * - Checks with NOKASH API for current status
 * - Updates database with final status
 * - Can be triggered manually or via cron jobs
 */

interface StuckPayment {
  id: string;
  userId: string;
  status: string;
  nokashTransactionId: string;
  createdAt: any;
  updatedAt: any;
  gameId: string;
  amount: number;
  paymentMethod: string;
  phoneNumber: string;
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxChecksPerMinute: 100,
  maxChecksPerHour: 500,
};

let lastRunTime = 0;
let checksThisMinute = 0;
let checksThisHour = 0;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting check
    const now = Date.now();
    const minutesSinceLastRun = (now - lastRunTime) / (1000 * 60);

    if (minutesSinceLastRun > 1) {
      checksThisMinute = 0;
    }

    if (minutesSinceLastRun > 60) {
      checksThisHour = 0;
    }

    if (checksThisMinute >= RATE_LIMIT.maxChecksPerMinute) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded - too many checks per minute',
          code: 'RATE_LIMIT_MINUTE',
        },
        { status: 429 }
      );
    }

    if (checksThisHour >= RATE_LIMIT.maxChecksPerHour) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded - too many checks per hour',
          code: 'RATE_LIMIT_HOUR',
        },
        { status: 429 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const maxAge = parseInt(searchParams.get('maxAge') || '300000'); // Default 5 minutes
    const maxChecks = parseInt(searchParams.get('limit') || '20');

    console.log('Starting background payment check:', {
      userId: userId || 'all',
      maxAge,
      maxChecks,
      timestamp: new Date().toISOString(),
    });

    // Find stuck pending payments
    const stuckPayments = await findStuckPayments(userId, maxAge, maxChecks);

    if (stuckPayments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stuck payments found',
        checkedCount: 0,
        updatedCount: 0,
        processingTime: Date.now() - startTime,
      });
    }

    console.log(`Found ${stuckPayments.length} stuck payments to check`);

    // Check status for each stuck payment
    let updatedCount = 0;
    const results = [];

    for (const payment of stuckPayments) {
      checksThisMinute++;
      checksThisHour++;

      try {
        const result = await checkAndUpdatePaymentStatus(payment);
        results.push(result);

        if (result.updated) {
          updatedCount++;
        }

        // Add small delay between checks to avoid overwhelming NOKASH API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error checking payment ${payment.id}:`, error);
        results.push({
          paymentId: payment.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          updated: false,
        });
      }
    }

    lastRunTime = now;

    console.log('Background check completed:', {
      totalFound: stuckPayments.length,
      totalUpdated: updatedCount,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      message: 'Background check completed',
      checkedCount: stuckPayments.length,
      updatedCount,
      results: results.slice(0, 10), // Return first 10 results to avoid large responses
      processingTime: Date.now() - startTime,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Background check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Background check failed',
        code: 'BACKGROUND_CHECK_ERROR',
        processingTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Find stuck pending payments
 */
async function findStuckPayments(
  userId?: string | null,
  maxAgeMs: number = 300000,
  maxChecks: number = 20
): Promise<StuckPayment[]> {
  try {
    const paymentsRef = collection(db, 'payments');
    const cutoffTime = new Date(Date.now() - maxAgeMs);

    let baseQuery = query(
      paymentsRef,
      where('status', 'in', ['PENDING', 'PROCESSING']),
      where('createdAt', '<', cutoffTime),
      orderBy('createdAt', 'desc'),
      limit(maxChecks)
    );

    // Add user filter if specified
    if (userId) {
      baseQuery = query(
        paymentsRef,
        where('userId', '==', userId),
        where('status', 'in', ['PENDING', 'PROCESSING']),
        where('createdAt', '<', cutoffTime),
        orderBy('createdAt', 'desc'),
        limit(maxChecks)
      );
    }

    const snapshot = await getDocs(baseQuery);
    const stuckPayments: StuckPayment[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      // Only include payments with NOKASH transaction ID
      if (data.nokashTransactionId) {
        stuckPayments.push({
          id: docSnapshot.id,
          ...data,
        } as StuckPayment);
      }
    }

    return stuckPayments;
  } catch (error) {
    console.error('Error finding stuck payments:', error);
    return [];
  }
}

/**
 * Check and update individual payment status
 */
async function checkAndUpdatePaymentStatus(payment: StuckPayment): Promise<{
  paymentId: string;
  oldStatus: string;
  newStatus?: string;
  updated: boolean;
  error?: string;
}> {
  const result = {
    paymentId: payment.id,
    oldStatus: payment.status,
    updated: false,
  };

  try {
    // Check status with NOKASH API
    const nokashStatus = await checkNokashStatus(payment.nokashTransactionId);

    if (nokashStatus.status === 'REQUEST_OK' && nokashStatus.data) {
      const { data } = nokashStatus;
      const internalStatus = mapNokashStatusToInternal(data.status);

      // Update if status changed
      if (internalStatus !== payment.status) {
        const updateData: any = {
          status: internalStatus,
          nokashStatus: data.status,
          updatedAt: serverTimestamp(),
          lastBackgroundCheck: serverTimestamp(),
          backgroundUpdated: true,
        };

        // Add status-specific fields
        if (data.statusReason) {
          updateData.statusReason = data.statusReason;
        }

        if (internalStatus === 'SUCCESS') {
          updateData.completedAt = serverTimestamp();
          updateData.finalAmount = parseFloat(data.amount);
        } else if (
          ['FAILED', 'CANCELLED', 'EXPIRED'].includes(internalStatus)
        ) {
          updateData.failedAt = serverTimestamp();
          updateData.failureReason = data.status;
        }

        await updateDoc(doc(db, 'payments', payment.id), updateData);

        console.log(
          `Updated payment ${payment.id}: ${payment.status} → ${internalStatus}`
        );

        return {
          ...result,
          newStatus: internalStatus,
          updated: true,
        };
      } else {
        // Status unchanged, but mark as checked
        await updateDoc(doc(db, 'payments', payment.id), {
          lastBackgroundCheck: serverTimestamp(),
          backgroundCheckCount:
            ((payment as any).backgroundCheckCount || 0) + 1,
        });
      }
    } else {
      // API call failed, mark as checked but not updated
      await updateDoc(doc(db, 'payments', payment.id), {
        lastBackgroundCheck: serverTimestamp(),
        lastBackgroundCheckError: nokashStatus.message,
        backgroundCheckCount: ((payment as any).backgroundCheckCount || 0) + 1,
      });
    }

    return result;
  } catch (error) {
    console.error(`Error checking payment ${payment.id}:`, error);
    return {
      ...result,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check payment status with NOKASH API
 */
async function checkNokashStatus(nokashTransactionId: string): Promise<{
  status: string;
  message: string;
  data?: any;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `https://api.nokash.app/lapas-on-trans/trans/310/status-request/${nokashTransactionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'BlackFriday-Marketing-App/1.0',
        },
        body: JSON.stringify({
          transaction_id: nokashTransactionId,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `NOKASH API HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'TIMEOUT',
        message: 'NOKASH API request timeout',
      };
    }

    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Unknown API error',
    };
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

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Background payment checker is running',
    timestamp: new Date().toISOString(),
    rateLimits: {
      checksThisMinute,
      checksThisHour,
      maxPerMinute: RATE_LIMIT.maxChecksPerMinute,
      maxPerHour: RATE_LIMIT.maxChecksPerHour,
    },
  });
}
