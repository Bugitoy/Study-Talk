import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db-utils';
import { createRateLimit } from '@/lib/rate-limit';

// Rate limiting configuration for leaderboard
const LEADERBOARD_RATE_LIMIT = {
  maxAttempts: 30,
  windowMs: 60 * 1000, // 1 minute
};

// In-memory cache (in production, use Redis)
const leaderboardCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = createRateLimit(LEADERBOARD_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' || 'weekly';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Validate parameters
    if (!['daily', 'weekly'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period parameter' }, { status: 400 });
    }
    
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `leaderboard-${period}-${page}-${limit}`;
    const cached = leaderboardCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        cacheTimestamp: cached.timestamp
      });
    }

    // Get leaderboard data with pagination
    const offset = (page - 1) * limit;
    const leaderboard = await getLeaderboard(period, limit, offset);
    
    // Cache the result
    const cacheData = {
      data: leaderboard.data,
      pagination: {
        page,
        limit,
        total: leaderboard.total,
        totalPages: Math.ceil(leaderboard.total / limit),
        hasNext: page < Math.ceil(leaderboard.total / limit),
        hasPrev: page > 1
      }
    };
    
    leaderboardCache.set(cacheKey, {
      data: cacheData,
      timestamp: Date.now()
    });

    // Clean up old cache entries (older than 10 minutes)
    const now = Date.now();
    for (const [key, value] of Array.from(leaderboardCache.entries())) {
      if (now - value.timestamp > 10 * 60 * 1000) {
        leaderboardCache.delete(key);
      }
    }

    return NextResponse.json({
      ...cacheData,
      cached: false,
      cacheTimestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
  }
} 