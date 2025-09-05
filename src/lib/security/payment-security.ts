import * as crypto from 'crypto';
import { validateForm } from './client-utils';
import { logSecurityEvent } from './middleware';

// Secure payment data interface
export interface SecurePaymentData {
  amount: number;
  currency: string;
  userId: string;
  gameId?: string; // For lottery games
  productId?: string; // For marketplace products
  paymentMethod: 'MTN_MOMO' | 'ORANGE_MONEY'; // Updated payment methods
  phoneNumber: string; // Added phone number for mobile money
  paymentType: 'GAME' | 'PRODUCT'; // To distinguish between payment types
  metadata?: Record<string, string>;
}

// Payment validation result
export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: SecurePaymentData;
  riskScore?: number;
}

// Validate payment data
export function validatePaymentData(
  data: any,
  userId: string
): PaymentValidationResult {
  const errors: string[] = [];
  let riskScore = 0;

  // Basic validation - flexible for both games and products
  const validationFields: any = {
    amount: 'price',
    currency: 'productName',
    paymentMethod: 'productName',
    phoneNumber: 'phoneNumber',
    paymentType: 'productName',
  };

  // Add gameId or productId validation based on payment type
  if (data.paymentType === 'GAME' || data.gameId) {
    validationFields.gameId = 'productName';
  }
  if (data.paymentType === 'PRODUCT' || data.productId) {
    validationFields.productId = 'productName';
  }

  const formValidation = validateForm(data, validationFields);

  if (!formValidation.isValid) {
    Object.values(formValidation.errors)
      .flat()
      .forEach(error => {
        errors.push(error);
      });
  }

  // Additional payment-specific validation
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Invalid payment amount');
    riskScore += 30;
  }

  if (amount > 10000) {
    // $10,000 limit
    errors.push('Payment amount exceeds maximum limit');
    riskScore += 50;
  }

  // Validate currency code
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'XAF', 'XOF']; // Add supported currencies
  if (!validCurrencies.includes(data.currency)) {
    errors.push('Unsupported currency');
    riskScore += 20;
  }

  // Validate payment method
  const validMethods = ['MTN_MOMO', 'ORANGE_MONEY'];
  if (!validMethods.includes(data.paymentMethod)) {
    errors.push('Invalid payment method');
    riskScore += 40;
  }

  // User validation
  if (!userId || userId !== data.userId) {
    errors.push('User authentication mismatch');
    riskScore += 100; // High risk
  }

  // Risk assessment
  if (data.metadata && Object.keys(data.metadata).length > 10) {
    riskScore += 10; // Too much metadata could be suspicious
  }

  const sanitizedData: SecurePaymentData = {
    amount: Number(data.amount),
    currency: String(data.currency).toUpperCase(),
    userId: String(data.userId),
    paymentMethod: String(data.paymentMethod).toUpperCase() as any,
    phoneNumber: String(data.phoneNumber),
    paymentType: (data.paymentType || (data.gameId ? 'GAME' : 'PRODUCT')) as
      | 'GAME'
      | 'PRODUCT',
    metadata: data.metadata ? sanitizeMetadata(data.metadata) : undefined,
  };

  // Add gameId or productId based on payment type
  if (data.gameId) {
    sanitizedData.gameId = String(data.gameId);
  }
  if (data.productId) {
    sanitizedData.productId = String(data.productId);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
    riskScore,
  };
}

// Sanitize payment metadata
function sanitizeMetadata(metadata: any): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const allowedKeys = [
    'orderReference',
    'customerNote',
    'productSku',
    'campaignId',
  ];

  if (typeof metadata !== 'object') return {};

  for (const [key, value] of Object.entries(metadata)) {
    if (allowedKeys.includes(key) && typeof value === 'string') {
      sanitized[key] = String(value).slice(0, 100); // Limit length
    }
  }

  return sanitized;
}

// Generate secure payment reference
export function generatePaymentReference(
  userId: string,
  itemId: string, // Can be gameId or productId
  amount: number
): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(4).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}-${itemId}-${amount}-${timestamp}`)
    .digest('hex')
    .slice(0, 8);

  return `PAY-${hash}-${randomBytes}`.toUpperCase();
}

// Verify payment signature/webhook
export function verifyPaymentSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Time-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  } catch (error) {
    logSecurityEvent(
      'payment_signature_verification_failed',
      {
        error: String(error),
        signatureLength: signature?.length || 0,
      },
      'error'
    );
    return false;
  }
}

// Detect fraudulent payment patterns
export function detectPaymentFraud(
  paymentData: SecurePaymentData,
  userHistory: {
    recentPayments: number;
    totalSpent24h: number;
    failedAttempts: number;
    accountAge: number; // days
  }
): {
  isFraudulent: boolean;
  riskFactors: string[];
  riskScore: number;
} {
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Velocity checks
  if (userHistory.recentPayments > 5) {
    riskFactors.push('High payment frequency');
    riskScore += 25;
  }

  if (userHistory.totalSpent24h > 1000) {
    riskFactors.push('High spending in 24h');
    riskScore += 30;
  }

  if (userHistory.failedAttempts > 3) {
    riskFactors.push('Multiple failed payment attempts');
    riskScore += 40;
  }

  // Account age check
  if (userHistory.accountAge < 1) {
    riskFactors.push('New account');
    riskScore += 20;
  }

  // Amount-based checks
  if (paymentData.amount > 500) {
    riskFactors.push('High-value transaction');
    riskScore += 15;
  }

  // Pattern detection
  if (paymentData.amount % 1 === 0 && paymentData.amount > 100) {
    // Round numbers over $100 can be suspicious
    riskScore += 5;
  }

  return {
    isFraudulent: riskScore >= 70,
    riskFactors,
    riskScore,
  };
}

// Secure payment processing wrapper
export async function processSecurePayment(
  paymentData: SecurePaymentData,
  userContext: {
    ip: string;
    userAgent: string;
    userId: string;
    sessionId?: string;
  }
): Promise<{
  success: boolean;
  paymentId?: string;
  error?: string;
  requiresVerification?: boolean;
}> {
  try {
    // Log payment attempt
    logSecurityEvent('payment_attempt', {
      userId: userContext.userId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.paymentMethod,
      ip: userContext.ip,
      userAgent: userContext.userAgent,
    });

    // Generate unique payment ID
    const paymentId = generatePaymentReference(
      paymentData.userId,
      paymentData.productId || '',
      paymentData.amount
    );

    // TODO: Implement actual payment processing based on method
    switch (paymentData.paymentMethod) {
      case 'MTN_MOMO':
        // Integrate with MTN Mobile Money via NOKASH
        break;
      case 'ORANGE_MONEY':
        // Integrate with Orange Money via NOKASH
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    // Log successful payment
    logSecurityEvent(
      'payment_success',
      {
        paymentId,
        userId: userContext.userId,
        amount: paymentData.amount,
      },
      'info'
    );

    return {
      success: true,
      paymentId,
    };
  } catch (error) {
    // Log failed payment
    logSecurityEvent(
      'payment_failed',
      {
        userId: userContext.userId,
        error: String(error),
        amount: paymentData.amount,
        ip: userContext.ip,
      },
      'error'
    );

    return {
      success: false,
      error: 'Payment processing failed',
    };
  }
}

// Encrypt sensitive payment data for storage
export function encryptPaymentData(data: string, key?: string): string {
  const encryptionKey = key || process.env.PAYMENT_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('Encryption key not configured');
  }

  // Create a 32-byte key and IV
  const keyBuffer = crypto.createHash('sha256').update(encryptionKey).digest();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive payment data
export function decryptPaymentData(
  encryptedData: string,
  key?: string
): string {
  const decryptionKey = key || process.env.PAYMENT_ENCRYPTION_KEY;
  if (!decryptionKey) {
    throw new Error('Decryption key not configured');
  }

  // Split IV and encrypted data
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  // Create a 32-byte key
  const keyBuffer = crypto.createHash('sha256').update(decryptionKey).digest();

  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Validate payment webhook authenticity
export function validatePaymentWebhook(
  body: any,
  headers: Record<string, string>,
  expectedSource: string
): boolean {
  // Implementation depends on payment provider
  switch (expectedSource) {
    case 'NOKASH': {
      // Validate NOKASH webhook signature
      const nokashSignature = headers['x-nokash-signature'];
      return nokashSignature
        ? verifyPaymentSignature(
            JSON.stringify(body),
            nokashSignature,
            process.env.NOKASH_WEBHOOK_SECRET || ''
          )
        : false;
    }

    case 'STRIPE': {
      // Validate Stripe webhook signature
      const stripeSignature = headers['stripe-signature'];
      return stripeSignature
        ? verifyPaymentSignature(
            JSON.stringify(body),
            stripeSignature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
          )
        : false;
    }

    default:
      return false;
  }
}
