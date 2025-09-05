import { adminFirestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { validateTicketNumberFormat } from '@/lib/utils/ticket-utils';
import { LotteryTicket, ScanEvent } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

interface ManualValidationRequest {
  ticketNumber: string;
  scannedBy: 'player' | 'vendor';
  vendorId?: string;
  device: 'web' | 'mobile';
  appVersion?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request);
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const body: ManualValidationRequest = await request.json();
    const { ticketNumber, scannedBy, vendorId, device, appVersion } = body;

    if (!ticketNumber || typeof ticketNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          result: 'INVALID',
          message: 'Valid ticket number is required',
        },
        { status: 400 }
      );
    }

    // Validate and normalize the ticket number
    const validation = validateTicketNumberFormat(ticketNumber);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          result: 'INVALID',
          message:
            'Invalid ticket number format. Please enter a valid ticket number (e.g., 123-456 or LT-2024-ABC123)',
        },
        { status: 400 }
      );
    }

    const normalizedNumber = validation.normalized;
    let scanResult: ScanEvent['result'] = 'INVALID';
    let ticketData: LotteryTicket | null = null;

    // Search for ticket using multiple strategies based on the input type
    const searchQueries = [];

    // Always try the primary ticket number field
    searchQueries.push(
      adminFirestore
        .collection('tickets')
        .where('ticketNumber', '==', normalizedNumber)
        .limit(1)
    );

    // If it's a formatted number, also try without formatting
    if (validation.type === 'formatted' || validation.type === 'simple') {
      const unformatted = normalizedNumber.replace(/[\-\s]/g, '');
      searchQueries.push(
        adminFirestore
          .collection('tickets')
          .where('alternativeNumbers.simple', '==', unformatted)
          .limit(1),
        adminFirestore
          .collection('tickets')
          .where('alternativeNumbers.formatted', '==', normalizedNumber)
          .limit(1)
      );
    }

    // If it's a readable format
    if (validation.type === 'readable') {
      searchQueries.push(
        adminFirestore
          .collection('tickets')
          .where('alternativeNumbers.readable', '==', normalizedNumber)
          .limit(1)
      );
    }

    // If it looks like a Firebase ID, search by document ID
    if (validation.type === 'firebase-id') {
      try {
        const directTicketDoc = await adminFirestore
          .collection('tickets')
          .doc(normalizedNumber)
          .get();
        if (directTicketDoc.exists) {
          ticketData = {
            id: directTicketDoc.id,
            ...directTicketDoc.data(),
          } as LotteryTicket;
        }
      } catch (error) {
        // Continue with other search methods
      }
    }

    // Execute search queries if we haven't found the ticket yet
    if (!ticketData) {
      for (const query of searchQueries) {
        try {
          const snapshot = await query.get();
          if (!snapshot.empty) {
            const ticketDoc = snapshot.docs[0];
            ticketData = {
              id: ticketDoc.id,
              ...ticketDoc.data(),
            } as LotteryTicket;
            break;
          }
        } catch (error) {
          console.error('Search query failed:', error);
          continue;
        }
      }
    }

    if (ticketData) {
      // Check ticket status and expiration
      if (ticketData.status === 'used') {
        scanResult = 'ALREADY_USED';
      } else if (
        ticketData.status === 'expired' ||
        (ticketData.expiresAt && ticketData.expiresAt < Date.now())
      ) {
        scanResult = 'EXPIRED';
      } else if (ticketData.status === 'valid') {
        // If scanned by vendor, mark as used
        if (scannedBy === 'vendor') {
          // Verify vendor has permission to scan this ticket
          if (vendorId && ticketData.vendorId !== vendorId) {
            return NextResponse.json(
              {
                success: false,
                result: 'INVALID',
                message: 'Vendor not authorized to validate this ticket',
              },
              { status: 403 }
            );
          }

          // Mark ticket as used
          const ticketRef = adminFirestore
            .collection('tickets')
            .doc(ticketData.id);
          await ticketRef.update({
            status: 'used',
            lastScanAt: Date.now(),
            lastScanBy: 'vendor',
            redemption: {
              vendorId: vendorId || user.id,
              redeemedAt: Date.now(),
              device,
              method: 'manual', // Track that this was manual validation
            },
            updatedAt: Date.now(),
          });

          scanResult = 'VALIDATED';
        } else {
          // Player checking - just update scan info
          const ticketRef = adminFirestore
            .collection('tickets')
            .doc(ticketData.id);
          await ticketRef.update({
            lastScanAt: Date.now(),
            lastScanBy: 'player',
            updatedAt: Date.now(),
          });

          scanResult = 'VALID';
        }
      } else {
        scanResult = 'INVALID';
      }
    }

    // Create scan event record
    const scanEvent: Omit<ScanEvent, 'id'> = {
      ticketId: ticketData?.id || 'unknown',
      scannedBy,
      vendorId: scannedBy === 'vendor' ? vendorId || user.id : undefined,
      userId: user.id,
      appVersion,
      device,
      result: scanResult,
      createdAt: Date.now(),
      ip: clientIP,
    };

    await adminFirestore.collection('scanEvents').add({
      ...scanEvent,
      validationMethod: 'manual', // Track validation method
      inputTicketNumber: ticketNumber, // Store original input for debugging
      normalizedTicketNumber: normalizedNumber, // Store normalized version
      inputType: validation.type, // Store what type of input was used
    });

    // Prepare response based on scan result
    let responseMessage = '';
    let additionalData = {};

    switch (scanResult) {
      case 'VALIDATED':
        responseMessage = 'Ticket validated successfully by vendor';
        additionalData = {
          ticketDetails: {
            gameId: ticketData?.gameId,
            purchaseDate: ticketData?.purchaseDate,
            price: ticketData?.price,
            currency: ticketData?.currency,
            isWinner: ticketData?.isWinner,
            prizeAmount: ticketData?.prizeAmount,
          },
        };
        break;
      case 'VALID':
        responseMessage = 'Ticket is valid and ready for use';
        // If ticket has coupon, include it in response
        if (ticketData?.coupon && !ticketData.coupon.used) {
          additionalData = {
            coupon: ticketData.coupon,
            ticketDetails: {
              gameId: ticketData.gameId,
              purchaseDate: ticketData.purchaseDate,
              price: ticketData.price,
              currency: ticketData.currency,
              isWinner: ticketData.isWinner,
              prizeAmount: ticketData.prizeAmount,
            },
          };
        } else if (ticketData) {
          additionalData = {
            ticketDetails: {
              gameId: ticketData.gameId,
              purchaseDate: ticketData.purchaseDate,
              price: ticketData.price,
              currency: ticketData.currency,
              isWinner: ticketData.isWinner,
              prizeAmount: ticketData.prizeAmount,
            },
          };
        }
        break;
      case 'ALREADY_USED':
        responseMessage = 'This ticket has already been used';
        if (ticketData?.redemption) {
          additionalData = {
            usedAt: ticketData.redemption.redeemedAt,
            usedBy: ticketData.redemption.vendorId,
            usedMethod: ticketData.redemption.method || 'unknown',
          };
        }
        break;
      case 'EXPIRED':
        responseMessage = 'This ticket has expired and cannot be used';
        if (ticketData?.expiresAt) {
          additionalData = {
            expiredAt: ticketData.expiresAt,
          };
        }
        break;
      case 'INVALID':
        responseMessage = `Ticket number '${ticketNumber}' not found. Please check the number and try again.`;
        break;
    }

    return NextResponse.json({
      success: scanResult === 'VALIDATED' || scanResult === 'VALID',
      result: scanResult,
      message: responseMessage,
      enteredNumber: ticketNumber,
      validationMethod: 'manual',
      inputType: validation.type,
      ...additionalData,
    });
  } catch (error) {
    console.error('Error validating ticket manually:', error);

    if (
      error instanceof Error &&
      error.message.includes('Authentication required')
    ) {
      return NextResponse.json(
        {
          success: false,
          result: 'INVALID',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        result: 'INVALID',
        message: 'Internal server error while validating ticket',
      },
      { status: 500 }
    );
  }
}
