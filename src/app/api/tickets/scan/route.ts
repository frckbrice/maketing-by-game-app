import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { parseQRCodeData, validateQRPayload, verifyHMACSignature } from '@/lib/utils/qr-utils';
import { LotteryTicket, ScanEvent } from '@/types';

interface ScanRequest {
  ticketId?: string;
  qrData?: string;
  signature?: string;
  issuedAt?: number;
  scannedBy: 'player' | 'vendor';
  vendorId?: string;
  device: 'web' | 'mobile';
  appVersion?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request);
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const body: ScanRequest = await request.json();
    const { ticketId, qrData, signature, scannedBy, vendorId, device, appVersion } = body;

    let finalTicketId = ticketId;
    let scanResult: ScanEvent['result'] = 'INVALID';

    // Parse QR code data if provided
    if (qrData && !ticketId) {
      const qrPayload = parseQRCodeData(qrData);
      if (!qrPayload) {
        return NextResponse.json({
          success: false,
          result: 'INVALID',
          message: 'Invalid QR code format'
        }, { status: 400 });
      }

      // Validate QR payload
      if (!validateQRPayload(qrPayload)) {
        return NextResponse.json({
          success: false,
          result: 'INVALID',
          message: 'QR code validation failed'
        }, { status: 400 });
      }

      finalTicketId = qrPayload.ticketId;
    }

    if (!finalTicketId) {
      return NextResponse.json({
        success: false,
        result: 'INVALID',
        message: 'No ticket ID provided'
      }, { status: 400 });
    }

    // Verify HMAC signature if provided (for enhanced security)
    if (signature && qrData) {
      if (!verifyHMACSignature(qrData, signature)) {
        return NextResponse.json({
          success: false,
          result: 'INVALID',
          message: 'Invalid signature'
        }, { status: 400 });
      }
    }

    // Fetch ticket from Firestore
    const ticketRef = adminFirestore.collection('tickets').doc(finalTicketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      scanResult = 'INVALID';
    } else {
      const ticket = { id: ticketDoc.id, ...ticketDoc.data() } as LotteryTicket;
      
      // Check ticket status and expiration
      if (ticket.status === 'used') {
        scanResult = 'ALREADY_USED';
      } else if (ticket.status === 'expired' || (ticket.expiresAt && ticket.expiresAt < Date.now())) {
        scanResult = 'EXPIRED';
      } else if (ticket.status === 'valid') {
        // If scanned by vendor, mark as used
        if (scannedBy === 'vendor') {
          // Verify vendor has permission to scan this ticket
          if (vendorId && ticket.vendorId !== vendorId) {
            return NextResponse.json({
              success: false,
              result: 'INVALID',
              message: 'Vendor not authorized to scan this ticket'
            }, { status: 403 });
          }

          // Mark ticket as used
          await ticketRef.update({
            status: 'used',
            lastScanAt: Date.now(),
            lastScanBy: 'vendor',
            redemption: {
              vendorId: vendorId || user.id,
              redeemedAt: Date.now(),
              device,
            },
            updatedAt: Date.now(),
          });

          scanResult = 'VALIDATED';
        } else {
          // Player scanning - just check status
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
      ticketId: finalTicketId,
      scannedBy,
      vendorId: scannedBy === 'vendor' ? (vendorId || user.id) : undefined,
      userId: user.id,
      appVersion,
      device,
      result: scanResult,
      createdAt: Date.now(),
      ip: clientIP,
    };

    await adminFirestore.collection('scanEvents').add(scanEvent);

    // Prepare response based on scan result
    let responseMessage = '';
    let additionalData = {};

    switch (scanResult) {
      case 'VALIDATED':
        responseMessage = 'Ticket redeemed successfully';
        break;
      case 'VALID':
        responseMessage = 'Ticket is valid';
        // If ticket has coupon, include it in response
        if (ticketDoc.exists) {
          const ticket = ticketDoc.data() as LotteryTicket;
          if (ticket.coupon && !ticket.coupon.used) {
            additionalData = {
              coupon: ticket.coupon,
              shopName: 'Shop Name', // TODO: Fetch from vendor/shop data
            };
          }
        }
        break;
      case 'ALREADY_USED':
        responseMessage = 'Ticket has already been used';
        break;
      case 'EXPIRED':
        responseMessage = 'Ticket has expired';
        break;
      case 'INVALID':
        responseMessage = 'Invalid ticket';
        break;
    }

    return NextResponse.json({
      success: scanResult === 'VALIDATED' || scanResult === 'VALID',
      result: scanResult,
      message: responseMessage,
      ticketId: finalTicketId,
      ...additionalData,
    });

  } catch (error) {
    console.error('Error scanning ticket:', error);
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({
        success: false,
        result: 'INVALID',
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: false,
      result: 'INVALID',
      message: 'Internal server error'
    }, { status: 500 });
  }
}