import crypto from 'crypto';

// Characters that are easy to read and type (avoiding similar looking ones)
const READABLE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a readable ticket number from a ticket ID
 * Format: LT-YYYY-XXXXXX (e.g., LT-2024-A3K7M9)
 */
export function generateReadableTicketNumber(ticketId: string): string {
  const year = new Date().getFullYear();

  // Create a hash of the ticket ID for consistency
  const hash = crypto.createHash('sha256').update(ticketId).digest('hex');

  // Convert hash to readable format
  let readableCode = '';
  for (let i = 0; i < 6; i++) {
    // Use different parts of the hash to ensure uniqueness
    const hashIndex = parseInt(hash.substr(i * 4, 4), 16);
    readableCode += READABLE_CHARS[hashIndex % READABLE_CHARS.length];
  }

  return `LT-${year}-${readableCode}`;
}

/**
 * Generate a shorter numeric code for very simple entry
 * Format: 6-8 digits (e.g., 847392)
 */
export function generateSimpleTicketNumber(ticketId: string): string {
  const hash = crypto.createHash('sha256').update(ticketId).digest('hex');

  // Extract 6 digits from the hash
  let numericCode = '';
  let hashIndex = 0;

  while (numericCode.length < 6 && hashIndex < hash.length - 1) {
    const byte = parseInt(hash.substr(hashIndex, 2), 16);
    if (byte >= 10) {
      // Ensure we get numbers 10-99
      numericCode += ((byte % 90) + 10).toString().substr(-1);
    }
    hashIndex += 2;
  }

  // Pad with deterministic digits if needed
  while (numericCode.length < 6) {
    const byte = parseInt(hash.substr(0, 2), 16);
    numericCode += (byte % 10).toString();
  }

  return numericCode;
}

/**
 * Generate a formatted ticket number that's easy to remember and type
 * Format: 123-456 (6 digits with dash separator)
 */
export function generateFormattedTicketNumber(ticketId: string): string {
  const simpleNumber = generateSimpleTicketNumber(ticketId);
  return `${simpleNumber.substr(0, 3)}-${simpleNumber.substr(3, 3)}`;
}

/**
 * Clean and normalize ticket number input for validation
 */
export function normalizeTicketNumber(input: string): string {
  return input
    .replace(/[\s-]/g, '') // Remove spaces and dashes
    .toUpperCase()
    .trim();
}

/**
 * Validate ticket number format
 */
export function validateTicketNumberFormat(ticketNumber: string): {
  isValid: boolean;
  type: 'formatted' | 'simple' | 'readable' | 'firebase-id' | 'invalid';
  normalized: string;
} {
  const normalized = normalizeTicketNumber(ticketNumber);

  // Check for different formats
  if (normalized.match(/^LT\d{4}[A-Z0-9]{6}$/)) {
    return { isValid: true, type: 'readable', normalized };
  }

  if (normalized.match(/^\d{6}$/)) {
    return { isValid: true, type: 'simple', normalized };
  }

  // Firebase ID format (alphanumeric, typically 20 chars)
  if (normalized.match(/^[A-Z0-9]{15,30}$/)) {
    return { isValid: true, type: 'firebase-id', normalized };
  }

  // Check if it's a formatted number that was cleaned
  if (ticketNumber.match(/^\d{3}-\d{3}$/)) {
    return { isValid: true, type: 'formatted', normalized };
  }

  return { isValid: false, type: 'invalid', normalized };
}

/**
 * Create a mapping entry for ticket number lookup
 */
export function createTicketNumberMapping(ticketId: string) {
  return {
    ticketId,
    readableNumber: generateReadableTicketNumber(ticketId),
    simpleNumber: generateSimpleTicketNumber(ticketId),
    formattedNumber: generateFormattedTicketNumber(ticketId),
    createdAt: Date.now(),
  };
}

/**
 * Generate multiple ticket number formats for a ticket
 * This will be stored in the ticket document
 */
export function generateAllTicketNumbers(ticketId: string) {
  const readable = generateReadableTicketNumber(ticketId);
  const simple = generateSimpleTicketNumber(ticketId);
  const formatted = generateFormattedTicketNumber(ticketId);

  return {
    // Primary user-facing number (easiest to remember)
    ticketNumber: formatted,

    // Alternative formats for flexibility
    alternativeNumbers: {
      readable, // LT-2024-ABC123
      simple, // 123456
      formatted, // 123-456
    },

    // For internal use
    ticketId,
  };
}
