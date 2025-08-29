import { db } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
} from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract NOKASH callback data
    const {
      transaction_id,
      order_id,
      status,
      amount,
      fees,
      message,
      // Add other NOKASH callback fields as needed
    } = body;

    if (!transaction_id || !order_id) {
      return NextResponse.json(
        { error: 'Missing required callback data' },
        { status: 400 }
      );
    }

    // Get payment record from database using order_id
    const paymentDoc = await getDoc(doc(db, 'payments', order_id));
    if (!paymentDoc.exists()) {
      console.error('Payment record not found for order_id:', order_id);
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();
    const mappedStatus = mapNokashStatus(status);

    // Update payment record with callback data
    await updateDoc(doc(db, 'payments', order_id), {
      status: mappedStatus,
      nokashTransactionId: transaction_id,
      fees: fees || 0,
      callbackMessage: message,
      callbackReceivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // If payment is successful, generate ticket
    if (mappedStatus === 'SUCCESS') {
      await generateTicket(order_id, paymentData);
    }

    // Log callback for audit purposes
    await addDoc(collection(db, 'payment_callbacks'), {
      orderId: order_id,
      transactionId: transaction_id,
      status: mappedStatus,
      amount,
      fees,
      message,
      callbackData: body,
      receivedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('NOKASH callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}

async function generateTicket(paymentId: string, paymentData: any) {
  try {
    // Generate unique ticket number
    const ticketNumber = `${paymentData.gameId.toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Get user and game data for ticket generation
    const [userDoc, gameDoc] = await Promise.all([
      getDoc(doc(db, 'users', paymentData.userId)),
      getDoc(doc(db, 'games', paymentData.gameId))
    ]);

    if (!userDoc.exists() || !gameDoc.exists()) {
      console.error('User or game not found for ticket generation');
      return;
    }

    const userData = userDoc.data();
    const gameData = gameDoc.data();

    // Create ticket record
    const ticketData = {
      id: `ticket-${Date.now()}`,
      gameId: paymentData.gameId,
      userId: paymentData.userId,
      paymentId,
      ticketNumber,
      price: paymentData.amount,
      currency: paymentData.currency,
      status: 'ACTIVE',
      isWinner: false,
      purchaseDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'tickets'), ticketData);

    // Send ticket via email with optimistic approach
    try {
      const ticketEmailData = {
        ticketNumber,
        gameTitle: gameData.title,
        price: paymentData.amount,
        currency: paymentData.currency,
        purchaseDate: new Date().toLocaleDateString(),
        drawDate: new Date(gameData.drawDate?.seconds * 1000 || Date.now() + 86400000).toLocaleDateString(),
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketNumber)}`,
      };

      // Send email via API endpoint for better error handling
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ticket',
          to: userData.email,
          data: {
            ...ticketEmailData,
            userName: `${userData.firstName} ${userData.lastName}`,
          },
        }),
      });
    } catch (emailError) {
      console.error('Error sending ticket email:', emailError);
      // Continue processing even if email fails
    }

    console.log('Ticket generated successfully:', ticketNumber);
  } catch (error) {
    console.error('Error generating ticket:', error);
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

  return statusMapping[nokashStatus?.toLowerCase()] || 'PENDING';
}
