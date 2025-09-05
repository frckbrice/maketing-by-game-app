// Security API middleware - server-side only

import { NextRequest, NextResponse } from 'next/server';
import {
  detectPaymentFraud,
  logSecurityEvent,
  validateForm,
  validateInput,
  validatePaymentData,
} from './client-utils';
import { withSecurity } from './middleware';

// Secure API wrapper that combines all security measures
export function createSecureAPI<T = any>(
  handler: (
    req: NextRequest,
    context: SecureAPIContext
  ) => Promise<NextResponse>,
  config: SecureAPIConfig = {}
) {
  const {
    methods = ['POST'],
    rateLimit = { maxRequests: 60, windowMs: 60000 },
    requireAuth = true,
    validateInput: inputValidation,
    logRequests = true,
  } = config;

  return withSecurity(
    async (req: NextRequest, context: any) => {
      const startTime = Date.now();
      const requestId = crypto.randomUUID();
      const clientIP = req.headers.get('x-forwarded-for') || 'unknown';

      try {
        // Parse request body if present
        let body: any = null;
        if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
          try {
            body = await req.json();
          } catch {
            return NextResponse.json(
              { error: 'Invalid JSON body', code: 'INVALID_JSON' },
              { status: 400 }
            );
          }
        }

        // Create secure context
        const secureContext: SecureAPIContext = {
          ...context,
          requestId,
          body,
          clientIP,
          userAgent: req.headers.get('user-agent') || '',
          startTime,
        };

        // Input validation if configured
        if (inputValidation && body) {
          const validation = validateForm(body, inputValidation.fields);
          if (!validation.isValid) {
            logSecurityEvent(
              'input_validation_failed',
              {
                requestId,
                errors: validation.errors,
                ip: clientIP,
              },
              'warn'
            );

            return NextResponse.json(
              {
                error: 'Input validation failed',
                code: 'VALIDATION_ERROR',
                details: validation.errors,
              },
              { status: 400 }
            );
          }
          secureContext.validatedBody = validation.sanitizedData;
        }

        // Log request if enabled
        if (logRequests) {
          logSecurityEvent('api_request', {
            requestId,
            method: req.method,
            path: req.nextUrl.pathname,
            ip: clientIP,
            userAgent: req.headers.get('user-agent'),
            bodySize: body ? JSON.stringify(body).length : 0,
          });
        }

        // Execute the handler
        const response = await handler(req, secureContext);

        // Add security response headers
        response.headers.set('X-Request-ID', requestId);
        response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

        // Log successful response
        if (logRequests) {
          logSecurityEvent('api_response', {
            requestId,
            status: response.status,
            responseTime: Date.now() - startTime,
          });
        }

        return response;
      } catch (error) {
        // Log error
        logSecurityEvent(
          'api_error',
          {
            requestId,
            error: String(error),
            ip: clientIP,
            path: req.nextUrl.pathname,
          },
          'error'
        );

        return NextResponse.json(
          {
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            requestId,
          },
          { status: 500 }
        );
      }
    },
    {
      methods,
      rateLimit,
      requireAuth,
    }
  );
}

// Configuration interface
interface SecureAPIConfig {
  methods?: string[];
  rateLimit?: { maxRequests: number; windowMs: number };
  requireAuth?: boolean;
  requireAPIKey?: boolean;
  validateInput?: {
    fields: Record<string, keyof typeof import('./validation').validationRules>;
  };
  logRequests?: boolean;
}

// Secure context interface
interface SecureAPIContext {
  requestId: string;
  body: any;
  validatedBody?: any;
  clientIP: string;
  userAgent: string;
  startTime: number;
}

// Specialized secure payment API
export function createSecurePaymentAPI(
  handler: (
    req: NextRequest,
    context: PaymentAPIContext
  ) => Promise<NextResponse>
) {
  return createSecureAPI(
    async (req: NextRequest, context: SecureAPIContext) => {
      // Additional payment-specific validation
      if (context.body) {
        const paymentValidation = validatePaymentData(
          context.body,
          context.body.userId
        );

        if (!paymentValidation.isValid) {
          logSecurityEvent(
            'payment_validation_failed',
            {
              requestId: context.requestId,
              errors: paymentValidation.errors,
              riskScore: paymentValidation.riskScore,
              ip: context.clientIP,
            },
            'warn'
          );

          return NextResponse.json(
            {
              error: 'Payment validation failed',
              code: 'PAYMENT_VALIDATION_ERROR',
              details: paymentValidation.errors,
            },
            { status: 400 }
          );
        }

        // Fraud detection
        // TODO: Get user history from database
        const userHistory = {
          recentPayments: 0,
          totalSpent24h: 0,
          failedAttempts: 0,
          accountAge: 30,
        };

        const fraudCheck = detectPaymentFraud(
          paymentValidation.sanitizedData!,
          userHistory
        );

        if (fraudCheck.isFraudulent) {
          logSecurityEvent(
            'payment_fraud_detected',
            {
              requestId: context.requestId,
              userId: context.body.userId,
              riskScore: fraudCheck.riskScore,
              riskFactors: fraudCheck.riskFactors,
              ip: context.clientIP,
            },
            'error'
          );

          return NextResponse.json(
            {
              error: 'Payment blocked due to security concerns',
              code: 'PAYMENT_BLOCKED',
              requiresVerification: true,
            },
            { status: 403 }
          );
        }

        // Create payment context
        const paymentContext: PaymentAPIContext = {
          ...context,
          paymentData: paymentValidation.sanitizedData!,
          riskScore: paymentValidation.riskScore || 0,
        };

        return handler(req, paymentContext);
      }

      return NextResponse.json(
        { error: 'Payment data required', code: 'MISSING_PAYMENT_DATA' },
        { status: 400 }
      );
    },
    {
      methods: ['POST'],
      rateLimit: { maxRequests: 10, windowMs: 60000 }, // Stricter rate limit for payments
      requireAuth: true,
      validateInput: {
        fields: {
          amount: 'price',
          currency: 'productName',
          userId: 'username',
          productId: 'productName',
          paymentMethod: 'productName',
        },
      },
      logRequests: true,
    }
  );
}

interface PaymentAPIContext extends SecureAPIContext {
  paymentData: import('./payment-security').SecurePaymentData;
  riskScore: number;
}

// Specialized secure chat API
export function createSecureChatAPI(
  handler: (req: NextRequest, context: ChatAPIContext) => Promise<NextResponse>
) {
  return createSecureAPI(
    async (req: NextRequest, context: SecureAPIContext) => {
      if (context.body && context.body.message) {
        // Additional chat-specific validation
        const messageValidation = validateInput(
          context.body.message,
          'chatMessage'
        );

        if (!messageValidation.isValid) {
          return NextResponse.json(
            {
              error: 'Message validation failed',
              code: 'MESSAGE_VALIDATION_ERROR',
              details: messageValidation.errors,
            },
            { status: 400 }
          );
        }

        // Create chat context
        const chatContext: ChatAPIContext = {
          ...context,
          sanitizedMessage: messageValidation.sanitizedValue as string,
        };

        return handler(req, chatContext);
      }

      return handler(req, context as ChatAPIContext);
    },
    {
      methods: ['GET', 'POST'],
      rateLimit: { maxRequests: 120, windowMs: 60000 }, // Higher limit for chat
      requireAuth: true,
      validateInput: {
        fields: {
          message: 'chatMessage',
        },
      },
    }
  );
}

interface ChatAPIContext extends SecureAPIContext {
  sanitizedMessage?: string;
}

// Utility to check if request is from valid source
export function validateRequestSource(req: NextRequest): boolean {
  const referer = req.headers.get('referer');
  const origin = req.headers.get('origin');

  const allowedDomains = [
    'localhost:3000',
    '127.0.0.1:3000',
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  if (!referer && !origin) {
    return req.method === 'GET'; // Allow GET requests without referer
  }

  const sourceUrl = referer || origin;
  return allowedDomains.some(domain => sourceUrl?.includes(domain as string));
}

// Example usage functions for common API patterns
export const secureApiHandlers = {
  // Protected route that requires authentication
  createProtectedRoute: (handler: (req: any, res: any) => Promise<any>) =>
    createSecureAPI(handler, {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }),

  // Public route with basic security
  createPublicRoute: (handler: (req: any, res: any) => Promise<any>) =>
    createSecureAPI(handler, {
      requireAuth: false,
      rateLimit: { maxRequests: 200, windowMs: 60000 },
    }),

  // Admin-only route with strict security
  createAdminRoute: (handler: (req: any, res: any) => Promise<any>) =>
    createSecureAPI(handler, {
      requireAuth: true,
      rateLimit: { maxRequests: 50, windowMs: 60000 },
    }),

  // Payment processing route
  createPaymentRoute: createSecurePaymentAPI,

  // Chat/messaging route
  createChatRoute: createSecureChatAPI,
};
