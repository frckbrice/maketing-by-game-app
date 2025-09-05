import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { LotteryTicket } from '@/types';
import { logSecurityEvent } from '@/lib/security/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // Verify authentication
    const user = await requireAuth(request);
    const { id: ticketId } = await params;

    // Fetch ticket from Firestore
    const ticketDoc = await adminFirestore
      .collection('tickets')
      .doc(ticketId)
      .get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        {
          error: 'Ticket not found',
        },
        { status: 404 }
      );
    }

    const ticket = { id: ticketDoc.id, ...ticketDoc.data() } as LotteryTicket;

    // Check if user has permission to view this ticket
    const canView =
      ticket.userId === user.id || // Owner
      user.role === 'ADMIN' || // Admin
      (user.role === 'VENDOR' && ticket.vendorId === user.id); // Vendor who issued the ticket

    if (!canView) {
      return NextResponse.json(
        {
          error: 'Unauthorized to view this ticket',
        },
        { status: 403 }
      );
    }

    // Fetch additional ticket details
    let gameDetails = null;
    let vendorDetails = null;

    try {
      // Get game details
      const gameDoc = await adminFirestore
        .collection('games')
        .doc(ticket.gameId)
        .get();
      if (gameDoc.exists) {
        gameDetails = {
          id: gameDoc.id,
          title: gameDoc.data()?.title,
          description: gameDoc.data()?.description,
          ticketPrice: gameDoc.data()?.ticketPrice,
          currency: gameDoc.data()?.currency,
        };
      }

      // Get vendor details
      const vendorDoc = await adminFirestore
        .collection('users')
        .doc(ticket.vendorId)
        .get();
      if (vendorDoc.exists) {
        vendorDetails = {
          id: vendorDoc.id,
          firstName: vendorDoc.data()?.firstName,
          lastName: vendorDoc.data()?.lastName,
          companyName: vendorDoc.data()?.companyName,
        };
      }
    } catch (error) {
      console.warn('Error fetching additional ticket details:', error);
    }

    // Fetch scan history if user is admin or vendor
    let scanHistory = null;
    if (
      user.role === 'ADMIN' ||
      (user.role === 'VENDOR' && ticket.vendorId === user.id)
    ) {
      try {
        const scanEvents = await adminFirestore
          .collection('scanEvents')
          .where('ticketId', '==', ticketId)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();

        scanHistory = scanEvents.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.warn('Error fetching scan history:', error);
      }
    }

    // Log successful ticket access
    logSecurityEvent('ticket_accessed', {
      ticketId,
      userId: user.id,
      userRole: user.role,
      clientIP,
      processingTime: Date.now() - startTime,
    });

    const response = NextResponse.json({
      ticket,
      gameDetails,
      vendorDetails,
      scanHistory,
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

    return response;
  } catch (error) {
    logSecurityEvent(
      'ticket_access_error',
      {
        ticketId: (await params).id,
        error: String(error),
        clientIP,
        processingTime: Date.now() - startTime,
      },
      'error'
    );

    console.error('Error fetching ticket details:', error);

    if (
      error instanceof Error &&
      error.message.includes('Authentication required')
    ) {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
