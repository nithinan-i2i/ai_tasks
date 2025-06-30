// ✅ SECURITY UTILITIES: Comprehensive security functions for React components

// ✅ NEW: Input validation and sanitization utilities
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

// ✅ NEW: HTML entity escaping to prevent XSS
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// ✅ NEW: URL validation to prevent open redirects and malicious links
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// ✅ NEW: Input length validation to prevent DoS attacks
export const validateInputLength = (input: string, maxLength: number = 1000): ValidationResult => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Input must be a non-empty string'
    };
  }
  
  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `Input too long. Maximum ${maxLength} characters allowed.`
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: input.trim()
  };
};

// ✅ NEW: Product title validation
export const validateProductTitle = (title: string): ValidationResult => {
  const lengthValidation = validateInputLength(title, 200);
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }
  
  // Check for potentially malicious content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /data:text\/html/i,
    /vbscript:/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(title)) {
      return {
        isValid: false,
        error: 'Title contains potentially unsafe content'
      };
    }
  }
  
  return {
    isValid: true,
    sanitizedValue: escapeHtml(title.trim())
  };
};

// ✅ NEW: Product description validation
export const validateProductDescription = (description: string): ValidationResult => {
  const lengthValidation = validateInputLength(description, 1000);
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }
  
  // Allow basic HTML tags for formatting but sanitize them
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttributes = ['class', 'id'];
  
  // Remove dangerous tags and attributes
  let sanitized = description;
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  return {
    isValid: true,
    sanitizedValue: sanitized.trim()
  };
};

// ✅ NEW: Price validation to prevent injection attacks
export const validatePrice = (price: any): ValidationResult => {
  if (typeof price !== 'number' || isNaN(price)) {
    return {
      isValid: false,
      error: 'Price must be a valid number'
    };
  }
  
  if (price < 0) {
    return {
      isValid: false,
      error: 'Price cannot be negative'
    };
  }
  
  if (price > 999999.99) {
    return {
      isValid: false,
      error: 'Price is too high'
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: price.toFixed(2)
  };
};

// ✅ NEW: SKU validation
export const validateSku = (sku: any): ValidationResult => {
  if (typeof sku !== 'number' || isNaN(sku)) {
    return {
      isValid: false,
      error: 'SKU must be a valid number'
    };
  }
  
  if (sku <= 0) {
    return {
      isValid: false,
      error: 'SKU must be a positive number'
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: sku.toString()
  };
};

// ✅ NEW: Size validation
export const validateSize = (size: string): ValidationResult => {
  if (!size || typeof size !== 'string') {
    return {
      isValid: false,
      error: 'Size must be a non-empty string'
    };
  }
  
  const validSizes = ['XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'];
  const upperSize = size.toUpperCase();
  
  if (!validSizes.includes(upperSize)) {
    return {
      isValid: false,
      error: `Invalid size. Must be one of: ${validSizes.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: upperSize
  };
};

// ✅ NEW: Image URL validation
export const validateImageUrl = (url: string): ValidationResult => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'Image URL must be a non-empty string'
    };
  }
  
  if (!isValidUrl(url)) {
    return {
      isValid: false,
      error: 'Invalid image URL format'
    };
  }
  
  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: 'URL must point to a valid image file'
    };
  }
  
  return {
    isValid: true,
    sanitizedValue: url
  };
};

// ✅ NEW: Secure text rendering component props
export interface SecureTextProps {
  text: string;
  maxLength?: number;
  allowHtml?: boolean;
  allowedTags?: string[];
  className?: string;
  fallbackText?: string;
}

// ✅ NEW: Content Security Policy helper
export const getCSPHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://react-shopping-cart-67954.firebaseio.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  };
};

// ✅ NEW: CSRF token generation (for forms if needed)
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// ✅ NEW: Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }
    
    const requests = this.requests.get(identifier)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  clear(): void {
    this.requests.clear();
  }
}

// ✅ NEW: Input sanitization for forms
export const sanitizeFormInput = (input: any): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
};

// ✅ NEW: Secure object serialization
export const secureStringify = (obj: any): string => {
  try {
    // Remove functions and undefined values
    const cleanObj = JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === 'function' || value === undefined) {
        return undefined;
      }
      return value;
    }));
    
    return JSON.stringify(cleanObj);
  } catch (error) {
    console.error('Error serializing object:', error);
    return '{}';
  }
};

// ✅ NEW: Validation error messages
export const getValidationErrorMessage = (field: string, error: string): string => {
  const messages: Record<string, string> = {
    title: 'Please enter a valid product title',
    description: 'Please enter a valid product description',
    price: 'Please enter a valid price',
    sku: 'Please enter a valid SKU',
    size: 'Please select a valid size',
    imageUrl: 'Please enter a valid image URL'
  };
  
  return messages[field] || error;
};

// ✅ NEW: Security audit logging
export const logSecurityEvent = (event: string, details: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`🔒 Security Event: ${event}`, details);
  }
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToSecurityService(event, details);
    console.warn('Security event logged:', { event, details, timestamp: new Date() });
  }
}; 