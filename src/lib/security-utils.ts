import { z } from 'zod';

// Security configuration constants
export const SECURITY_CONFIG = {
  // Input length limits
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  QUESTION_MAX_LENGTH: 2000,
  OPTION_MAX_LENGTH: 1000,
  
  // Content limits
  MAX_QUESTIONS: 50,
  MIN_QUESTIONS: 1,
  
  // Rate limiting
  MAX_SAVE_ATTEMPTS: 10,
  SAVE_COOLDOWN_MS: 5000, // 5 seconds
  
  // Performance settings
  DEBOUNCE_DELAY_MS: 500, // 500ms debounce for validation
  CACHE_TTL_MS: 30000, // 30 seconds cache TTL
  MEMORY_CLEANUP_INTERVAL_MS: 60000, // 1 minute cleanup interval
  
  // XSS protection
  ALLOWED_HTML_TAGS: [] as string[], // No HTML allowed
  ALLOWED_ATTRIBUTES: [] as string[], // No attributes allowed
};

// Performance-optimized input sanitization with caching
const sanitizationCache = new Map<string, string>();
const sanitizationCacheSize = 1000; // Limit cache size

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Check cache first
  if (sanitizationCache.has(input)) {
    return sanitizationCache.get(input)!;
  }
  
  // Remove HTML tags and attributes efficiently
  let sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;') // Encode ampersands
    .replace(/</g, '&lt;') // Encode less than
    .replace(/>/g, '&gt;') // Encode greater than
    .replace(/"/g, '&quot;') // Encode quotes
    .replace(/'/g, '&#x27;') // Encode apostrophes
    .trim();
  
  // Cache the result (with size limit)
  if (sanitizationCache.size >= sanitizationCacheSize) {
    // Remove oldest entries (simple LRU)
    const firstKey = sanitizationCache.keys().next().value;
    if (firstKey) {
      sanitizationCache.delete(firstKey);
    }
  }
  sanitizationCache.set(input, sanitized);
  
  return sanitized;
}

// Memory management for sanitization cache
export function cleanupSanitizationCache(): void {
  sanitizationCache.clear();
}

// Quiz validation schema using Zod
export const QuizValidationSchema = z.object({
  title: z.string()
    .min(1, 'Quiz title is required')
    .max(SECURITY_CONFIG.TITLE_MAX_LENGTH, `Title must be ${SECURITY_CONFIG.TITLE_MAX_LENGTH} characters or less`)
    .transform(sanitizeInput),
  
  description: z.string()
    .min(1, 'Quiz description is required')
    .max(SECURITY_CONFIG.DESCRIPTION_MAX_LENGTH, `Description must be ${SECURITY_CONFIG.DESCRIPTION_MAX_LENGTH} characters or less`)
    .transform(sanitizeInput),
  
  questions: z.array(z.object({
    id: z.string(),
    question: z.string()
      .min(1, 'Question text is required')
      .max(SECURITY_CONFIG.QUESTION_MAX_LENGTH, `Question must be ${SECURITY_CONFIG.QUESTION_MAX_LENGTH} characters or less`)
      .transform(sanitizeInput),
    optionA: z.string()
      .min(1, 'Option A is required')
      .max(SECURITY_CONFIG.OPTION_MAX_LENGTH, `Option A must be ${SECURITY_CONFIG.OPTION_MAX_LENGTH} characters or less`)
      .transform(sanitizeInput),
    optionB: z.string()
      .min(1, 'Option B is required')
      .max(SECURITY_CONFIG.OPTION_MAX_LENGTH, `Option B must be ${SECURITY_CONFIG.OPTION_MAX_LENGTH} characters or less`)
      .transform(sanitizeInput),
    optionC: z.string()
      .min(1, 'Option C is required')
      .max(SECURITY_CONFIG.OPTION_MAX_LENGTH, `Option C must be ${SECURITY_CONFIG.OPTION_MAX_LENGTH} characters or less`)
      .transform(sanitizeInput),
    optionD: z.string()
      .min(1, 'Option D is required')
      .max(SECURITY_CONFIG.OPTION_MAX_LENGTH, `Option D must be ${SECURITY_CONFIG.OPTION_MAX_LENGTH} characters or less`)
      .transform(sanitizeInput),
    correct: z.string()
      .min(1, 'Correct answer is required')
      .max(SECURITY_CONFIG.OPTION_MAX_LENGTH, `Correct answer must be ${SECURITY_CONFIG.OPTION_MAX_LENGTH} characters or less`)
      .transform(sanitizeInput),
  }))
  .min(SECURITY_CONFIG.MIN_QUESTIONS, `At least ${SECURITY_CONFIG.MIN_QUESTIONS} question is required`)
  .max(SECURITY_CONFIG.MAX_QUESTIONS, `Maximum ${SECURITY_CONFIG.MAX_QUESTIONS} questions allowed`),
});

// Performance-optimized rate limiting with memory management
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Start cleanup interval
    this.startCleanupInterval();
  }
  
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, SECURITY_CONFIG.MEMORY_CLEANUP_INTERVAL_MS);
  }
  
  private cleanup(): void {
    const now = Date.now();
    const cooldownMs = SECURITY_CONFIG.SAVE_COOLDOWN_MS;
    
    // Remove expired entries
    const entries = Array.from(this.attempts.entries());
    for (const [key, value] of entries) {
      if (now - value.lastAttempt > cooldownMs) {
        this.attempts.delete(key);
      }
    }
  }
  
  isRateLimited(userId: string, operation: string): boolean {
    const key = `${userId}_${operation}`;
    const now = Date.now();
    const userAttempts = this.attempts.get(key);
    
    if (!userAttempts) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return false;
    }
    
    // Reset if cooldown period has passed
    if (now - userAttempts.lastAttempt > SECURITY_CONFIG.SAVE_COOLDOWN_MS) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return false;
    }
    
    // Check if user has exceeded max attempts
    if (userAttempts.count >= SECURITY_CONFIG.MAX_SAVE_ATTEMPTS) {
      return true;
    }
    
    // Increment attempt count
    userAttempts.count++;
    userAttempts.lastAttempt = now;
    return false;
  }
  
  reset(userId: string, operation: string): void {
    const key = `${userId}_${operation}`;
    this.attempts.delete(key);
  }
  
  // Cleanup method for component unmount
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.attempts.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Validation cache for performance
const validationCache = new Map<string, { result: { isValid: boolean; errors: string[] }; timestamp: number }>();
const validationCacheSize = 500; // Limit cache size

// Performance-optimized validation with caching
export function validateQuizData(data: any): { isValid: boolean; errors: string[] } {
  // Create a cache key from the data
  const cacheKey = JSON.stringify(data);
  const now = Date.now();
  
  // Check cache first
  const cached = validationCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < SECURITY_CONFIG.CACHE_TTL_MS) {
    return cached.result;
  }
  
  try {
    // Validate using Zod schema
    QuizValidationSchema.parse(data);
    
    // Additional business logic validation
    const errors: string[] = [];
    
      // Check for duplicate questions
  const questions = data.questions || [];
  const questionTexts = questions.map((q: any) => q.question?.toLowerCase().trim()).filter(Boolean);
  const uniqueQuestions = new Set(questionTexts);
  
  if (questionTexts.length !== uniqueQuestions.size) {
    errors.push('Duplicate questions are not allowed');
  }
  
  // Check for duplicate options within each question
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const options = [
      question.optionA?.toLowerCase().trim() || '',
      question.optionB?.toLowerCase().trim() || '',
      question.optionC?.toLowerCase().trim() || '',
      question.optionD?.toLowerCase().trim() || ''
    ].filter(opt => opt !== '');
    
    const uniqueOptions = new Set(options);
    if (options.length !== uniqueOptions.size) {
      errors.push(`Question ${i + 1} has duplicate options`);
    }
  }
    
    const result = { isValid: errors.length === 0, errors };
    
    // Cache the result (with size limit)
    if (validationCache.size >= validationCacheSize) {
      // Remove oldest entries
      const firstKey = validationCache.keys().next().value;
      if (firstKey) {
        validationCache.delete(firstKey);
      }
    }
    validationCache.set(cacheKey, { result, timestamp: now });
    
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      const result = { isValid: false, errors };
      
      // Cache the result
      if (validationCache.size >= validationCacheSize) {
        const firstKey = validationCache.keys().next().value;
        if (firstKey) {
          validationCache.delete(firstKey);
        }
      }
      validationCache.set(cacheKey, { result, timestamp: now });
      
      return result;
    }
    
    const result = { isValid: false, errors: ['Validation failed'] };
    validationCache.set(cacheKey, { result, timestamp: now });
    return result;
  }
}

// Memory management for validation cache
export function cleanupValidationCache(): void {
  validationCache.clear();
}

// Debounced validation function
export function createDebouncedValidator(delay: number = SECURITY_CONFIG.DEBOUNCE_DELAY_MS) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function debouncedValidate(data: any, callback: (result: { isValid: boolean; errors: string[] }) => void) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      const result = validateQuizData(data);
      callback(result);
    }, delay);
  };
}

// CSRF token generation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// CSRF token validation
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}



// Security event logging
export function logSecurityEvent(event: string, userId: string, data: any): void {
  console.log('🔒 SECURITY EVENT:', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    data,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  });
  
  // In production, this would be sent to a logging service
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/logging/security-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      }),
    }).catch(console.error);
  }
}

// Memory cleanup function for component unmount
export function cleanupMemory(): void {
  cleanupSanitizationCache();
  cleanupValidationCache();
  rateLimiter.destroy();
} 