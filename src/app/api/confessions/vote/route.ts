import { NextRequest, NextResponse } from 'next/server';
import { voteOnConfession } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const { userId, confessionId, voteType } = await req.json();

    if (!userId || !confessionId || !voteType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['BELIEVE', 'DOUBT'].includes(voteType)) {
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