import { db } from '@/lib/firebase/config';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

// NOKASH API Configuration - Server-side only
const NOKASH_CONFIG = {
  apiUrl:
    process.env.NODE_ENV === 'production'
      ? 'https://api.nokash.app'
      : 'https://api-test.nokash.app',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Get payment record from database
    const paymentDoc = await getDoc(doc(db, 'payments', transactionId));
    if (!paymentDoc.exists()) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();

    // Verify the payment belongs to the authenticated user
    if (paymentData.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // If no NOKASH transaction ID, return current status
    if (!paymentData.nokashTransactionId) {
      return NextResponse.json({
        transactionId,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        createdAt: paymentData.createdAt,
        updatedAt: paymentData.updatedAt,
      });
    }

    // Check status with NOKASH API
    const nokashResponse = await fetch(
      `${NOKASH_CONFIG.apiUrl}/lapas-on-trans/trans/310/status-request?transaction_id=${paymentData.nokashTransactionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const nokashResult = await nokashResponse.json();

    if (nokashResult.status === 'success' || nokashResult.status === 200) {
      const status = mapNokashStatus(nokashResult.transaction_status);

      // Update payment record if status changed
      if (status !== paymentData.status) {
        await updateDoc(doc(db, 'payments', transactionId), {
          status,
          updatedAt: serverTimestamp(),
        });
      }

      return NextResponse.json({
        transactionId,
        status,
        amount: nokashResult.amount || paymentData.amount,
        fees: nokashResult.fees || 0,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        createdAt: paymentData.createdAt,
        updatedAt: new Date().toISOString(),
        message: nokashResult.message,
      });
    }

    // If NOKASH API call fails, return cached status
    return NextResponse.json({
      transactionId,
      status: paymentData.status,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      createdAt: paymentData.createdAt,
      updatedAt: paymentData.updatedAt,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function mapNokashStatus(nokashStatus: string): string {
  const statusMapping: { [key: string]: string } = {
    success: 'SUCCESS',
    pending: 'PENDING',
    failed: 'FAILED',
    cancelled: 'CANCELLED',
    processing: 'PROCESSING',
    expired: 'EXPIRED',
  };

  return statusMapping[nokashStatus.toLowerCase()] || 'PENDING';
}
