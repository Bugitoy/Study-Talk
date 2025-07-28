import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
}

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(req: NextRequest) {
    const now = Date.now();
    
    // Generate rate limit key (IP address by default)
    const key = config.keyGenerator 
      ? config.keyGenerator(req)
      : req.headers.get('x-forwarded-for') || 
        req.headers.get('x-real-ip') || 
        'unknown';
    
    const record = rateLimitStore.get(key);
    
    if (record) {
      // Check if window has expired
      if (now > record.resetTime) {
        // Reset the counter
        rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
        return null; // Allow request
      }
      
      // Check if limit exceeded
      if (record.count >= config.maxAttempts) {
        const timeRemaining = Math.ceil((record.resetTime - now) / 1000);
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: `Too many requests. Please wait ${timeRemaining} seconds before trying again.`,
            timeRemaining 
          },
          { status: 429 }
        );
      }
      
      // Increment counter
      record.count++;
      rateLimitStore.set(key, record);
      return null; // Allow request
    } else {
      // First request from this IP
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
      return null; // Allow request
    }
  };
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of Array.from(rateLimitStore.entries())) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Export specific rate limit configurations
export const STUDY_GROUPS_RATE_LIMIT = {
  maxAttempts: 25,
  windowMs: 60 * 1000, // 1 minute
};

export const ROOM_CREATION_RATE_LIMIT = {
  maxAttempts: 30,
  windowMs: 5 * 60 * 1000, // 5 minutes
};

export const CONFESSION_RATE_LIMIT = {
  maxAttempts: 20, // Generous limit - 20 confessions per 5 minutes
  windowMs: 5 * 60 * 1000, // 5 minutes
}; 

export const COMPETE_ROOMS_RATE_LIMIT = {
  maxAttempts: 30, // 30 requests per minute
  windowMs: 60 * 1000, // 1 minute
};

export const COMPETE_VERIFICATION_RATE_LIMIT = {
  maxAttempts: 50, // 50 verification requests per minute
  windowMs: 60 * 1000, // 1 minute
}; 