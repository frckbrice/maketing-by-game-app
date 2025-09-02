import crypto from 'crypto';

const SECRET_KEY = process.env.QR_SECRET_KEY || 'default-secret-key-change-in-production';

export interface QRPayload {
  ticketId: string;
  hash: string;
  issuedAt: number;
  deviceType?: 'web' | 'mobile';
}

/**
 * Generate a secure hash for QR code
 */
export function generateQRHash(ticketId: string, issuedAt?: number): string {
  const timestamp = issuedAt || Date.now();
  const data = `${ticketId}:${timestamp}:${SECRET_KEY}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate QR code payload for a ticket
 */
export function generateQRPayload(ticketId: string): QRPayload {
  const issuedAt = Date.now();
  const hash = generateQRHash(ticketId, issuedAt);
  
  return {
    ticketId,
    hash,
    issuedAt,
  };
}

/**
 * Verify QR code hash
 */
export function verifyQRHash(ticketId: string, hash: string, issuedAt: number): boolean {
  const expectedHash = generateQRHash(ticketId, issuedAt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

/**
 * Generate QR code data string
 */
export function generateQRCodeData(ticketId: string): string {
  const payload = generateQRPayload(ticketId);
  return JSON.stringify(payload);
}

/**
 * Parse QR code data
 */
export function parseQRCodeData(qrData: string): QRPayload | null {
  try {
    const payload = JSON.parse(qrData) as QRPayload;
    
    // Validate required fields
    if (!payload.ticketId || !payload.hash || !payload.issuedAt) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
}

/**
 * Validate QR code payload
 */
export function validateQRPayload(payload: QRPayload): boolean {
  // Verify hash
  if (!verifyQRHash(payload.ticketId, payload.hash, payload.issuedAt)) {
    return false;
  }
  
  // Check if QR code is not too old (24 hours)
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const age = Date.now() - payload.issuedAt;
  
  if (age > maxAge) {
    return false;
  }
  
  return true;
}

/**
 * Generate HMAC signature for API requests
 */
export function generateHMACSignature(data: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
}

/**
 * Verify HMAC signature
 */
export function verifyHMACSignature(data: string, signature: string): boolean {
  const expectedSignature = generateHMACSignature(data);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}