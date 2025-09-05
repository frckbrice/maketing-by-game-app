// Validation utilities - server-side only

import DOMPurify from 'isomorphic-dompurify';

// Input validation schemas
export const validationRules = {
  // User input
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    required: true,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    required: true,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    required: true,
  },

  // Chat and messages
  chatMessage: {
    minLength: 1,
    maxLength: 1000,
    required: true,
  },

  // Product data
  productName: {
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  productDescription: {
    maxLength: 2000,
    required: false,
  },
  price: {
    min: 0,
    max: 999999.99,
    required: true,
  },

  // Shop data
  shopName: {
    minLength: 2,
    maxLength: 50,
    required: true,
  },

  // Payment data (extra strict)
  cardNumber: {
    pattern: /^\d{13,19}$/,
    required: true,
  },
  cvv: {
    pattern: /^\d{3,4}$/,
    required: true,
  },
  phoneNumber: {
    pattern: /^\+?[\d\s\-()]{10,15}$/,
    required: true,
  },
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

// Main validation function
export function validateInput(
  value: any,
  field: keyof typeof validationRules,
  customRules?: Partial<(typeof validationRules)[keyof typeof validationRules]>
): ValidationResult {
  const rules = { ...validationRules[field], ...customRules };
  const errors: string[] = [];

  // Check if required
  if (
    rules.required &&
    (value === null || value === undefined || value === '')
  ) {
    return {
      isValid: false,
      errors: [`${field} is required`],
    };
  }

  // If not required and empty, return valid
  if (
    !rules.required &&
    (value === null || value === undefined || value === '')
  ) {
    return {
      isValid: true,
      errors: [],
      sanitizedValue: value,
    };
  }

  const stringValue = String(value).trim();

  // Length validation
  if (
    (rules as any).minLength &&
    stringValue.length < (rules as any).minLength
  ) {
    errors.push(
      `${field} must be at least ${(rules as any).minLength} characters`
    );
  }

  if (
    (rules as any).maxLength &&
    stringValue.length > (rules as any).maxLength
  ) {
    errors.push(
      `${field} must not exceed ${(rules as any).maxLength} characters`
    );
  }

  // Pattern validation
  if ((rules as any).pattern && !(rules as any).pattern.test(stringValue)) {
    errors.push(`${field} format is invalid`);
  }

  // Numeric validation
  if ((rules as any).min !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < (rules as any).min) {
      errors.push(`${field} must be at least ${(rules as any).min}`);
    }
  }

  if ((rules as any).max !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > (rules as any).max) {
      errors.push(`${field} must not exceed ${(rules as any).max}`);
    }
  }

  // Sanitize the value
  let sanitizedValue = stringValue;

  // Remove dangerous characters for specific fields
  if (['chatMessage', 'productDescription'].includes(field)) {
    sanitizedValue = DOMPurify.sanitize(sanitizedValue, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
    });
  }

  // Extra sanitization for payment fields
  if (['cardNumber', 'cvv'].includes(field)) {
    sanitizedValue = sanitizedValue.replace(/\D/g, ''); // Only digits
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue,
  };
}

// Batch validation for forms
export function validateForm(
  data: Record<string, any>,
  fieldRules: Record<string, keyof typeof validationRules>
): {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, any>;
} {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, any> = {};
  let isValid = true;

  for (const [fieldName, ruleKey] of Object.entries(fieldRules)) {
    const result = validateInput(data[fieldName], ruleKey);

    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }

    sanitizedData[fieldName] = result.sanitizedValue;
  }

  return { isValid, errors, sanitizedData };
}

// SQL injection prevention
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/['";]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .replace(/\*\//g, '')
    .replace(/\bUNION\b/gi, '') // Remove UNION keywords
    .replace(/\bSELECT\b/gi, '')
    .replace(/\bINSERT\b/gi, '')
    .replace(/\bUPDATE\b/gi, '')
    .replace(/\bDELETE\b/gi, '')
    .replace(/\bDROP\b/gi, '')
    .trim();
}

// XSS prevention
export function sanitizeHTML(
  input: string,
  allowBasicFormatting: boolean = false
): string {
  if (typeof input !== 'string') return '';

  const options = allowBasicFormatting
    ? {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: [],
      }
    : {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      };

  return DOMPurify.sanitize(input, options);
}

// Rate limiting helpers
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((data, storedKey) => {
    if (data.resetTime < now) {
      keysToDelete.push(storedKey);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));

  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime,
  };
}

// Validate file uploads
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): ValidationResult {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles = 1,
  } = options;

  const errors: string[] = [];

  if (!file) {
    return { isValid: false, errors: ['File is required'] };
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(
      `File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB`
    );
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  // Check filename for dangerous patterns
  const dangerousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.php$/i,
    /\.js$/i,
    /\.html$/i,
    /\.\./,
    /[<>:"'|?*]/,
  ];

  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('Invalid filename');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Environment variable validation
export function validateEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// API request validation
export function validateApiRequest(
  req: any,
  expectedMethod: string | string[],
  requiredFields: string[] = []
): ValidationResult {
  const errors: string[] = [];
  const methods = Array.isArray(expectedMethod)
    ? expectedMethod
    : [expectedMethod];

  // Check HTTP method
  if (!methods.includes(req.method)) {
    errors.push(`Method ${req.method} not allowed`);
  }

  // Check required fields in body
  const body = req.body || {};
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      errors.push('Content-Type must be application/json');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
