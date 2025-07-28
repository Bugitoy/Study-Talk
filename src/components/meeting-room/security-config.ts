// Security configuration for meeting room components
export const SECURITY_CONFIG = {
  MAX_REPORT_LENGTH: 1000,
  MAX_BAN_REASON_LENGTH: 500,
  MAX_OTHER_NAME_LENGTH: 100,
  REPORT_RATE_LIMIT: {
    MAX_ATTEMPTS: 30,
    WINDOW_MS: 60000, // 1 minute
  },
  BAN_RATE_LIMIT: {
    MAX_ATTEMPTS: 25,
    WINDOW_MS: 300000, // 5 minutes
  },
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  ALLOWED_CHARS: /^[a-zA-Z0-9\s\-_.,!?()@#$%*+=:;()[\]{}|\\/]+$/,
};

// Input sanitization utility
export const sanitizeInput = (input: string, maxLength: number): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove forbidden characters
  let sanitized = input.replace(SECURITY_CONFIG.FORBIDDEN_CHARS, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Rate limiting utility
export const createRateLimiter = (config: typeof SECURITY_CONFIG.REPORT_RATE_LIMIT) => {
  let attempts = 0;
  let lastReset = Date.now();
  
  return () => {
    const now = Date.now();
    if (now - lastReset > config.WINDOW_MS) {
      attempts = 0;
      lastReset = now;
    }
    
    if (attempts >= config.MAX_ATTEMPTS) {
      return false;
    }
    
    attempts++;
    return true;
  };
};

// Audit logging utility - DISABLED for performance
export const logSecurityEvent = async (event: string, data: any) => {
  // Audit logging disabled to prevent performance impact
  // In production, this would be re-enabled with proper logging service
}; 