import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Ticket Validation API
 *
 * Validates tickets by QR code scan or manual number input
 * - Checks if ticket exists in database
 * - Returns ticket details and validity status
 * - Supports both QR code data and manual ticket numbers
 */

interface TicketValidationRequest {
  ticketIdentifier: string; // Could be QR code data or ticket number
  validationType: 'qr_scan' | 'manual_input';
  userId?: string; // Optional for verification
}

interface TicketValidationResponse {
  valid: boolean;
  ticket?: {
    id: string;
    ticketNumber: string;
    gameTitle: string;
    gameId: string;
    price: number;
    currency: string;
    purchaseDate: string;
    userId: string;
    status: 'active' | 'used' | 'expired';
    drawDate?: string;
    qrCode: string;
  };
  error?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: TicketValidationRequest = await request.json();
    const { ticketIdentifier, validationType, userId } = body;

    // Validate input
    if (!ticketIdentifier?.trim()) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Ticket identifier is required',
          message: 'Please provide a valid ticket number or QR code',
        },
        { status: 400 }
      );
    }

    if (!['qr_scan', 'manual_input'].includes(validationType)) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid validation type',
          message: 'Validation type must be either qr_scan or manual_input',
        },
        { status: 400 }
      );
    }

    console.log(
      `Validating ticket: ${ticketIdentifier.substring(0, 10)}... via ${validationType}`
    );

    // Query tickets collection
    const ticketsRef = collection(db, 'tickets');
    let ticketQuery;

    if (validationType === 'qr_scan') {
      // For QR scan, the identifier could be the ticket ID or ticket number
      ticketQuery = query(ticketsRef, where('id', '==', ticketIdentifier));

      // If no results with ID, try with ticket number
      const snapshot = await getDocs(ticketQuery);

      if (snapshot.empty) {
        ticketQuery = query(
          ticketsRef,
          where('ticketNumber', '==', ticketIdentifier)
        );
      }
    } else {
      // For manual input, search by ticket number
      ticketQuery = query(
        ticketsRef,
        where('ticketNumber', '==', ticketIdentifier.trim().toUpperCase())
      );
    }

    const ticketSnapshot = await getDocs(ticketQuery);

    if (ticketSnapshot.empty) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Ticket not found',
          message:
            'No ticket found with the provided identifier. Please check and try again.',
          processingTime: Date.now() - startTime,
        },
        { status: 404 }
      );
    }

    // Get the first matching ticket
    const ticketDoc = ticketSnapshot.docs[0];
    const ticketData = ticketDoc.data();

    // Verify ownership if userId is provided
    if (userId && ticketData.userId !== userId) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Access denied',
          message: 'You are not authorized to view this ticket',
          processingTime: Date.now() - startTime,
        },
        { status: 403 }
      );
    }

    // Check if ticket is expired (if drawDate has passed)
    let status: 'active' | 'used' | 'expired' = 'active';
    if (ticketData.drawDate) {
      const drawDate = new Date(ticketData.drawDate);
      const now = new Date();
      if (now > drawDate) {
        status = 'expired';
      }
    }

    // Check if ticket has been used (you can add this logic based on your business rules)
    if (ticketData.used) {
      status = 'used';
    }

    const response: TicketValidationResponse = {
      valid: true,
      ticket: {
        id: ticketDoc.id,
        ticketNumber: ticketData.ticketNumber,
        gameTitle: ticketData.gameTitle,
        gameId: ticketData.gameId,
        price: ticketData.price,
        currency: ticketData.currency,
        purchaseDate:
          ticketData.purchaseDate?.toDate?.()?.toISOString() ||
          new Date(ticketData.purchaseDate).toISOString(),
        userId: ticketData.userId,
        status,
        drawDate:
          ticketData.drawDate?.toDate?.()?.toISOString() || ticketData.drawDate,
        qrCode: ticketData.qrCode,
      },
      message:
        status === 'active'
          ? 'Valid ticket found'
          : status === 'expired'
            ? 'Ticket found but has expired'
            : 'Ticket found but has been used',
    };

    console.log(
      `Ticket validation completed: ${ticketIdentifier} - ${response.valid ? 'VALID' : 'INVALID'}`
    );

    return NextResponse.json({
      ...response,
      processingTime: Date.now() - startTime,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Ticket validation error:', error);

    return NextResponse.json(
      {
        valid: false,
        error: 'Internal server error during validation',
        message:
          'Unable to validate ticket at this time. Please try again later.',
        processingTime,
      },
      { status: 500 }
    );
  }
}

// GET endpoint for quick ticket lookup (for QR scanner apps)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('id');
  const ticketNumber = searchParams.get('number');

  if (!ticketId && !ticketNumber) {
    return NextResponse.json(
      {
        valid: false,
        error: 'Missing parameters',
        message: 'Provide either ticket ID or ticket number',
      },
      { status: 400 }
    );
  }

  // Convert to POST format and reuse logic
  const body = {
    ticketIdentifier: ticketId || ticketNumber!,
    validationType: ticketId ? 'qr_scan' : 'manual_input',
  };

  // Create a mock request with the body
  const mockRequest = {
    json: async () => body,
  } as NextRequest;

  return POST(mockRequest);
}
