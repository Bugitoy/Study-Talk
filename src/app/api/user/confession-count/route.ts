import { NextRequest, NextResponse } from 'next/server';
import { getDailyConfessionCount } from '@/lib/db-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const dailyCount = await getDailyConfessionCount(userId);

    return NextResponse.json({ dailyCount });
  } catch (error) {
    console.error('Error getting daily confession count:', error);
    return NextResponse.json({ error: 'Failed to get daily confession count' }, { status: 500 });
  }
} 