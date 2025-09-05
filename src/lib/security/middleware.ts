// Security middleware - server-side only

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './client-utils';

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : [process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// CSP (Content Security Policy)
const cspDirectives = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval'", // For Next.js dev mode
  'style-src': "'self' 'unsafe-inline'", // For Tailwind CSS
  'img-src': "'self' data: https:",
  'font-src': "'self' data:",
  'connect-src': "'self' https:",
  'frame-ancestors': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
};

export function createSecurityMiddleware() {
  return async function securityMiddleware(req: NextRequest) {
    const response = NextResponse.next();

    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Apply CSP
    const cspValue = Object.entries(cspDirectives)
      .map(
        ([directive, sources]) =>
          `${directive} ${Array.isArray(sources) ? sources.join(' ') : sources}`
      )
      .join('; ');
    response.headers.set('Content-Security-Policy', cspValue);

    // Handle CORS for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const origin = req.headers.get('origin');

      if (origin && corsOptions.origin.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      if (req.method === 'OPTIONS') {
        response.headers.set(
          'Access-Control-Allow-Methods',
          corsOptions.methods.join(', ')
        );
        response.headers.set(
          'Access-Control-Allow-Headers',
          corsOptions.allowedHeaders.join(', ')
        );
        response.headers.set(
          'Access-Control-Max-Age',
          corsOptions.maxAge.toString()
        );
        return new NextResponse(null, { status: 200 });
      }
    }

    return response;
  };
}

// API route wrapper with security features
export function withSecurity(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    methods?: string[];
    rateLimit?: { maxRequests: number; windowMs: number };
    requireAuth?: boolean;
    requireAPIKey?: boolean;
    validateBody?: boolean;
  } = {}
) {
  return async function secureHandler(req: NextRequest, context: any) {
    try {
      const {
        methods = ['GET', 'POST'],
        rateLimit = { maxRequests: 100, windowMs: 60000 },
        requireAuth = false,
        requireAPIKey = false,
        validateBody = true,
      } = options;

      // Validate HTTP method
      if (!methods.includes(req.method || '')) {
        return NextResponse.json(
          { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
          { status: 405 }
        );
      }

      // Rate limiting
      const clientIP =
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'unknown';
      const rateLimitKey = `${clientIP}:${req.nextUrl.pathname}`;

      const rateCheck = checkRateLimit(
        rateLimitKey,
        rateLimit.maxRequests,
        rateLimit.windowMs
      );

      const response = await handler(req, context);

      // Add rate limit headers
      response.headers.set(
        'X-RateLimit-Limit',
        rateLimit.maxRequests.toString()
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        rateCheck.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        new Date(rateCheck.resetTime).toISOString()
      );

      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(
                (rateCheck.resetTime - Date.now()) / 1000
              ).toString(),
            },
          }
        );
      }

      // API Key validation
      if (requireAPIKey) {
        const apiKey = req.headers.get('X-API-Key');
        const validApiKeys = process.env.API_KEYS?.split(',') || [];

        if (!apiKey || !validApiKeys.includes(apiKey)) {
          return NextResponse.json(
            { error: 'Invalid API key', code: 'INVALID_API_KEY' },
            { status: 401 }
          );
        }
      }

      // Authentication validation
      if (requireAuth) {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return NextResponse.json(
            { error: 'Authentication required', code: 'AUTH_REQUIRED' },
            { status: 401 }
          );
        }

        // TODO: Validate JWT token with Firebase Admin
        // const token = authHeader.slice(7);
        // const decodedToken = await admin.auth().verifyIdToken(token);
      }

      // Request body validation
      if (validateBody && ['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
        const contentType = req.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          return NextResponse.json(
            {
              error: 'Content-Type must be application/json',
              code: 'INVALID_CONTENT_TYPE',
            },
            { status: 400 }
          );
        }

        try {
          await req.json(); // Validate JSON parsing
        } catch {
          return NextResponse.json(
            { error: 'Invalid JSON body', code: 'INVALID_JSON' },
            { status: 400 }
          );
        }
      }

      return response;
    } catch (error) {
      console.error('Security middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }
  };
}

// Validate user permissions
export function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  const roleHierarchy: Record<string, number> = {
    USER: 1,
    VENDOR: 2,
    ADMIN: 3,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = Math.min(
    ...requiredRoles.map(role => roleHierarchy[role] || Infinity)
  );

  return userLevel >= requiredLevel;
}

// Log security events
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  level: 'info' | 'warn' | 'error' = 'info'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    level,
    details: {
      ...details,
      userAgent: details.userAgent,
      ip: details.ip,
      userId: details.userId,
    },
  };

  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Winston, Sentry)
    console[level]('SECURITY_EVENT:', JSON.stringify(logEntry));
  } else {
    console[level]('🔒 Security Event:', logEntry);
  }
}

// Sanitize user input for logging (remove sensitive data)
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'secret',
    'cardNumber',
    'cvv',
    'ssn',
    'socialSecurityNumber',
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

// Verify request origin
export function verifyOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const allowedOrigins = corsOptions.origin;

  if (!origin) {
    // Allow same-origin requests
    return true;
  }

  return allowedOrigins.includes(origin);
}

// Check for suspicious request patterns
export function detectSuspiciousActivity(req: NextRequest): {
  suspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const userAgent = req.headers.get('user-agent') || '';
  const origin = req.headers.get('origin') || '';

  // Check for bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    reasons.push('Bot-like user agent detected');
  }

  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-proto',
    'x-originating-ip',
    'x-cluster-client-ip',
  ];

  for (const header of suspiciousHeaders) {
    if (req.headers.get(header)) {
      reasons.push(`Suspicious header detected: ${header}`);
    }
  }

  // Check request frequency (basic)
  const referer = req.headers.get('referer');
  if (!referer && req.method === 'POST') {
    reasons.push('POST request without referer');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}
