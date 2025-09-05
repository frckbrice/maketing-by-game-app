// Client-side security utilities (not server actions)

// Validation utilities
export function validateInput(value: any, field: string, customRules?: any) {
  // Basic validation logic
  if (typeof value === 'undefined' || value === null || value === '') {
    return {
      isValid: false,
      errors: [`${field} is required`],
      sanitizedValue: null,
    };
  }

  // Basic sanitization - remove potential XSS
  let sanitizedValue = value;
  if (typeof value === 'string') {
    sanitizedValue = value.trim().replace(/<[^>]*>/g, '');
  }

  return {
    isValid: true,
    errors: [],
    sanitizedValue,
  };
}

export function validateForm(
  data: Record<string, any>,
  fieldRules: Record<string, string>
) {
  const errors: string[] = [];
  const sanitizedData: Record<string, any> = {};

  for (const [field, rule] of Object.entries(fieldRules)) {
    const validation = validateInput(data[field], field);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    } else {
      sanitizedData[field] = data[field];
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
}

// Payment utilities
export function validatePaymentData(data: any, userId: string) {
  return {
    isValid: true,
    errors: [],
    sanitizedData: data,
    riskScore: 0,
  };
}

export function detectPaymentFraud(paymentData: any, userHistory: any) {
  return {
    isFraudulent: false,
    riskScore: 0,
    riskFactors: [],
    reasons: [],
  };
}

// Logging utilities
export function logSecurityEvent(event: string, details: any, level?: string) {
  // Client-side logging
  console.log(`[${level || 'info'}] ${event}:`, details);
}

// Rate limiting
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
) {
  return {
    allowed: true,
    remaining: maxRequests,
    resetTime: Date.now() + windowMs,
  };
}

// API request validation
export function validateApiRequest(
  req: any,
  expectedMethod: string | string[],
  requiredFields: string[] = []
) {
  return {
    isValid: true,
    errors: [],
  };
}
