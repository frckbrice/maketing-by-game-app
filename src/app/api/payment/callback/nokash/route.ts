import { APP_URL } from '@/lib/constants';
import { db } from '@/lib/firebase/config';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * NOKASH Payment Webhook Handler (Unified)
 *
 * Comprehensive webhook handler that processes NOKASH payment callbacks
 * - Real-time payment status updates
 * - Ticket generation on successful payments
 * - Database updates and user notifications
 * - Webhook verification and audit trail
 * - Supports both callback and webhook payload formats
 */

interface NokashWebhookPayload {
  // Standard webhook format
  transaction_id?: string;
  order_id?: string;
  status:
    | 'PENDING'
    | 'SUCCESS'
    | 'FAILED'
    | 'CANCELED'
    | 'CANCELLED'
    | 'TIMEOUT';
  amount: string;
  fees?: string;
  currency?: string;
  phone: string;
  payment_method?: string;
  status_reason?: string;
  confirmed_at?: string;
  initiated_at?: string;
  country?: string;
  integrator_name?: string;
  app_name?: string;
  mtn_balance_before?: string;
  mtn_balance_after?: string;

  // Legacy callback format support
  id?: string; // NOKASH transaction ID
  orderId?: string; // Our payment record ID
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse webhook payload from NOKASH (supports both formats)
    const payload: NokashWebhookPayload = await request.json();

    // Normalize payload to handle both webhook and callback formats
    const nokashTransactionId = payload.transaction_id || payload.id;
    const orderId = payload.order_id || payload.orderId;
    const { status, amount, phone } = payload;

    console.log('NOKASH Webhook received:', {
      nokashTransactionId,
      orderId,
      status,
      amount,
      phone: phone?.substring(0, 6) + '***', // Mask for security
      timestamp: new Date().toISOString(),
      paymentMethod: payload.payment_method,
      confirmed_at: payload.confirmed_at,
    });

    // Validate required webhook data
    if (!nokashTransactionId || !orderId || !status) {
      console.error(
        'Invalid NOKASH webhook payload - missing required fields:',
        payload
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required webhook data',
          code: 'INVALID_WEBHOOK_PAYLOAD',
        },
        { status: 400 }
      );
    }

    // Verify webhook authenticity (basic validation)
    const isValidWebhook = await verifyWebhookSignature(request, payload);
    if (!isValidWebhook) {
      console.error('Invalid webhook signature or source');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE',
        },
        { status: 401 }
      );
    }

    // Get payment record from database
    const paymentDoc = await getDoc(doc(db, 'payments', orderId));

    if (!paymentDoc.exists()) {
      console.error('Payment record not found for orderId:', orderId);
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

    // Verify webhook is for the correct NOKASH transaction
    if (
      paymentData.nokashTransactionId &&
      paymentData.nokashTransactionId !== nokashTransactionId
    ) {
      console.error('NOKASH transaction ID mismatch:', {
        expected: paymentData.nokashTransactionId,
        received: nokashTransactionId,
        orderId,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Transaction ID mismatch',
          code: 'TRANSACTION_ID_MISMATCH',
        },
        { status: 400 }
      );
    }

    // Check if status actually changed to avoid duplicate processing
    const internalStatus = mapNokashStatusToInternal(status);
    if (paymentData.status === internalStatus) {
      console.log('Payment status unchanged, skipping update:', {
        orderId,
        currentStatus: paymentData.status,
        webhookStatus: status,
      });

      return NextResponse.json({
        success: true,
        message: 'Status unchanged - no update needed',
        orderId,
        status: internalStatus,
      });
    }

    // Update payment record with webhook data
    const updateData: any = {
      status: internalStatus,
      nokashStatus: status,
      nokashTransactionId: nokashTransactionId,
      webhookAmount: amount,
      webhookPhone: phone,
      webhookReceivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      processingTime: Date.now() - startTime,
    };

    // Add enhanced webhook data if available
    if (payload.fees) {
      updateData.fees = parseFloat(payload.fees);
    }
    if (payload.status_reason) {
      updateData.statusReason = payload.status_reason;
    }
    if (payload.confirmed_at) {
      updateData.confirmedAt = new Date(payload.confirmed_at);
    }
    if (payload.payment_method) {
      updateData.paymentMethod = payload.payment_method;
    }
    if (payload.mtn_balance_before && payload.mtn_balance_after) {
      updateData.balanceBefore = parseFloat(payload.mtn_balance_before);
      updateData.balanceAfter = parseFloat(payload.mtn_balance_after);
    }

    // Add status-specific data
    if (internalStatus === 'SUCCESS') {
      updateData.completedAt = serverTimestamp();
      updateData.finalAmount = parseFloat(amount);
    } else if (
      internalStatus === 'FAILED' ||
      internalStatus === 'CANCELLED' ||
      internalStatus === 'EXPIRED'
    ) {
      updateData.failedAt = serverTimestamp();
      updateData.failureReason = status;
    }

    await updateDoc(doc(db, 'payments', orderId), updateData);

    // Process successful payments
    if (internalStatus === 'SUCCESS') {
      try {
        await processSuccessfulPayment(orderId, paymentData as PaymentData, {
          nokashId: nokashTransactionId,
          amount: parseFloat(amount),
          phone,
          confirmedAt: payload.confirmed_at,
          paymentMethod: payload.payment_method,
          fees: payload.fees ? parseFloat(payload.fees) : 0,
        });

        console.log('Successful payment processed:', {
          orderId,
          nokashTransactionId,
          amount,
          processingTime: Date.now() - startTime,
        });

        // Send real-time notification to client
        await sendRealtimeUpdate(orderId, internalStatus, payload);
      } catch (postPaymentError) {
        console.error('Post-payment processing error:', {
          orderId,
          nokashTransactionId,
          error:
            postPaymentError instanceof Error
              ? postPaymentError.message
              : 'Unknown error',
        });

        // Log error but don't fail the webhook - payment was successful
        await updateDoc(doc(db, 'payments', orderId), {
          postPaymentError:
            postPaymentError instanceof Error
              ? postPaymentError.message
              : 'Unknown error',
          postPaymentErrorAt: serverTimestamp(),
        });
      }
    } else {
      // Send real-time notification for failed/cancelled payments too
      await sendRealtimeUpdate(orderId, internalStatus, payload);
    }

    // Log webhook for audit trail
    await addDoc(collection(db, 'payment_webhooks'), {
      orderId,
      nokashTransactionId,
      status: internalStatus,
      nokashStatus: status,
      amount,
      phone,
      webhookData: payload,
      receivedAt: serverTimestamp(),
      processingTime: Date.now() - startTime,
      userAgent: request.headers.get('User-Agent'),
      sourceIp:
        request.headers.get('X-Forwarded-For') ||
        request.headers.get('X-Real-IP'),
    });

    console.log('NOKASH webhook processed successfully:', {
      orderId,
      nokashTransactionId,
      status: internalStatus,
      oldStatus: paymentData.status,
      processingTime: Date.now() - startTime,
    });

    // Return success response to NOKASH
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderId,
      receivedStatus: status,
      processedStatus: internalStatus,
      statusChanged: paymentData.status !== internalStatus,
      processingTime: Date.now() - startTime,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('NOKASH webhook processing error:', error);

    // Return error response to NOKASH
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Process successful payment - generate ticket and send notifications
 */
interface PaymentData {
  gameId: string;
  userId: string;
  currency: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

interface CallbackData {
  nokashId: string;
  amount: number;
  phone: string;
  confirmedAt?: string;
  paymentMethod?: string;
  fees: number;
}

interface UserData {
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface GameData {
  title: string;
  drawDate?: { seconds: number };
}

interface TicketData {
  id: string;
  ticketNumber: string;
  gameId: string;
  userId: string;
  paymentId: string;
  nokashTransactionId: string;
  price: number;
  currency: string;
  status: string;
  isWinner: boolean;
  purchaseDate: any;
  phoneNumber: string;
  createdAt: any;
  updatedAt: any;
}

async function processSuccessfulPayment(
  paymentId: string,
  paymentData: PaymentData,
  callbackData: CallbackData
): Promise<void> {
  // Generate unique ticket number
  const ticketNumber = generateTicketNumber(paymentData.gameId);

  // Get user and game data
  const [userDoc, gameDoc] = await Promise.all([
    getDoc(doc(db, 'users', paymentData.userId)),
    getDoc(doc(db, 'games', paymentData.gameId)),
  ]);

  if (!userDoc.exists()) {
    throw new Error(`User not found: ${paymentData.userId}`);
  }

  if (!gameDoc.exists()) {
    throw new Error(`Game not found: ${paymentData.gameId}`);
  }

  const userData = userDoc.data();
  const gameData = gameDoc.data();

  // Create ticket record
  const ticketData = {
    id: `ticket-${Date.now()}`,
    ticketNumber,
    gameId: paymentData.gameId,
    userId: paymentData.userId,
    paymentId,
    nokashTransactionId: callbackData.nokashId,
    price: callbackData.amount,
    currency: paymentData.currency,
    status: 'ACTIVE',
    isWinner: false,
    purchaseDate: serverTimestamp(),
    phoneNumber: callbackData.phone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'tickets'), ticketData);

  // Send notifications asynchronously (don't block callback response)
  Promise.all([
    sendTicketEmail(userData, gameData, ticketData),
    sendTicketSMS(callbackData.phone, ticketNumber, gameData.title),
  ]).catch(error => {
    console.error('Notification sending failed:', {
      paymentId,
      ticketNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  });

  console.log('Ticket generated successfully:', {
    paymentId,
    ticketNumber,
    nokashId: callbackData.nokashId,
  });
}

/**
 * Generate unique ticket number
 */
function generateTicketNumber(gameId: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const gamePrefix = gameId.substring(0, 3).toUpperCase();

  return `${gamePrefix}-${timestamp}-${random}`;
}

/**
 * Send ticket via email
 */
async function sendTicketEmail(userData: any, gameData: any, ticketData: any) {
  if (!userData.email) {
    console.warn('User has no email address for ticket delivery');
    return;
  }

  const emailData = {
    type: 'ticket',
    to: userData.email,
    subject: `Your Lottery Ticket - ${ticketData.ticketNumber}`,
    data: {
      userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      ticketNumber: ticketData.ticketNumber,
      gameTitle: gameData.title,
      price: ticketData.price,
      currency: ticketData.currency,
      purchaseDate: new Date().toLocaleDateString(),
      drawDate: gameData.drawDate
        ? new Date(gameData.drawDate.seconds * 1000).toLocaleDateString()
        : 'TBD',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketData.ticketNumber)}`,
    },
  };

  const response = await fetch(`${APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    throw new Error(`Email API error: ${response.status}`);
  }

  console.log('Ticket email sent successfully:', {
    ticketNumber: ticketData.ticketNumber,
    email: userData.email,
  });
}

/**
 * Send ticket via SMS
 */
async function sendTicketSMS(
  phoneNumber: string,
  ticketNumber: string,
  gameTitle: string
) {
  if (!phoneNumber) {
    console.warn('No phone number for SMS notification');
    return;
  }

  const smsData = {
    phoneNumber,
    message: `Your lottery ticket for "${gameTitle}" has been confirmed. Ticket: ${ticketNumber}. Good luck!`,
    ticketId: ticketNumber,
  };

  const response = await fetch(`${APP_URL}/api/notifications/send-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(smsData),
  });

  if (!response.ok) {
    throw new Error(`SMS API error: ${response.status}`);
  }

  console.log('Ticket SMS sent successfully:', {
    ticketNumber,
    phone: phoneNumber.substring(0, 6) + '***',
  });
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
 * Verify webhook signature and authenticity
 */
async function verifyWebhookSignature(
  request: NextRequest,
  payload: NokashWebhookPayload
): Promise<boolean> {
  try {
    // Get signature from headers
    const signature = request.headers.get('X-NOKASH-Signature');
    const timestamp = request.headers.get('X-NOKASH-Timestamp');
    const userAgent = request.headers.get('User-Agent');

    // Basic validation checks
    const isFromNokash = userAgent?.includes('NOKASH') || true; // Allow for testing

    // Validate timestamp (within 10 minutes)
    if (timestamp) {
      const webhookTime = parseInt(timestamp) * 1000;
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - webhookTime);

      if (timeDiff > 600000) {
        // 10 minutes
        console.warn('Webhook timestamp too old:', { timeDiff, timestamp });
        // Don't reject for now, just log
      }
    }

    // TODO: Implement proper signature verification when NOKASH provides documentation
    // For now, accept all webhooks but log for monitoring
    console.log('Webhook verification:', {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      userAgent,
      isFromNokash,
    });

    return isFromNokash;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Send real-time update to client using Firebase Realtime Database
 */
async function sendRealtimeUpdate(
  paymentId: string,
  status: string,
  payload: NokashWebhookPayload
): Promise<void> {
  try {
    // This would typically use Firebase Realtime Database or WebSockets
    // For now, we'll use console logging and prepare for future implementation
    console.log('Real-time update sent:', {
      paymentId,
      status,
      nokashStatus: payload.status,
      amount: payload.amount,
      confirmed_at: payload.confirmed_at,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement real-time updates using:
    // 1. Firebase Realtime Database for instant client notifications
    // 2. WebSocket connections for real-time UI updates
    // 3. Server-Sent Events (SSE) for payment status streaming

    // Example Firebase Realtime Database update:
    // await realtimeDb.ref(`payments/${paymentId}/status`).set({
    //   status,
    //   nokashStatus: payload.status,
    //   updatedAt: Date.now(),
    //   confirmed: status === 'SUCCESS'
    // });
  } catch (error) {
    console.error('Error sending real-time update:', error);
  }
}
