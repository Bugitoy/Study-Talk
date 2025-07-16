import { NextRequest, NextResponse } from 'next/server';
import { voteOnConfession } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const { userId, confessionId, voteType, action = 'vote' } = await req.json();

    if (!userId || !confessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'unvote') {
      // Remove vote - we'll create a separate function for this
      const { removeVoteOnConfession } = await import('@/lib/db-utils');
      const result = await removeVoteOnConfession({
        userId,
        confessionId,
      });
      return NextResponse.json(result);
    }

    if (!voteType || !['BELIEVE', 'DOUBT'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const vote = await voteOnConfession({
      userId,
      confessionId,
      voteType,
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error voting on confession:', error);
    return NextResponse.json({ error: 'Failed to vote on confession' }, { status: 500 });
  }
} 