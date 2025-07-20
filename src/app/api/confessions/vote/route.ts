import { NextRequest, NextResponse } from 'next/server';
import { voteConfession } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const { confessionId, userId, voteType, action } = await req.json();

    if (!confessionId || !userId || !voteType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'unvote') {
      // Handle unvote - remove the vote
      const result = await voteConfession(confessionId, userId, voteType === 'BELIEVE' ? 'DOUBT' : 'BELIEVE');
      // Then vote again to remove it (this will toggle it off)
      await voteConfession(confessionId, userId, voteType);
      return NextResponse.json({ success: true, action: 'unvote' });
    } else {
      // Handle vote
      const result = await voteConfession(confessionId, userId, voteType);
      return NextResponse.json({ success: true, action: 'vote', result });
    }
  } catch (error) {
    console.error('Error voting on confession:', error);
    return NextResponse.json({ error: 'Failed to vote on confession' }, { status: 500 });
  }
} 