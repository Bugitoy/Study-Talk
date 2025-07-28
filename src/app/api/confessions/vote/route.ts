import { NextRequest, NextResponse } from 'next/server';
import { voteConfession, removeVoteOnConfession } from '@/lib/db-utils';
import { createRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting for voting (very generous)
    const VOTE_RATE_LIMIT = {
      maxAttempts: 100, // 100 votes per 5 minutes
      windowMs: 5 * 60 * 1000, // 5 minutes
    };
    
    const rateLimit = createRateLimit(VOTE_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { confessionId, userId, voteType, action } = await req.json();

    if (!confessionId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'unvote') {
      // Handle unvote - remove the vote completely
      const result = await removeVoteOnConfession({ userId, confessionId });
      return NextResponse.json({ success: true, action: 'unvote', result });
    } else {
      // Handle vote - requires voteType
      if (!voteType) {
        return NextResponse.json({ error: 'Missing voteType for vote action' }, { status: 400 });
      }
      const result = await voteConfession(confessionId, userId, voteType);
      return NextResponse.json({ success: true, action: 'vote', result });
    }
  } catch (error) {
    console.error('Error voting on confession:', error);
    return NextResponse.json({ error: 'Failed to vote on confession' }, { status: 500 });
  }
} 