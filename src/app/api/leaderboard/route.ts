import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' || 'weekly';
    
    const leaderboard = await getLeaderboard(period);
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 });
  }
} 