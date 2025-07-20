import { NextRequest, NextResponse } from 'next/server';
import { getBotDetectionStats } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const stats = await getBotDetectionStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting bot detection stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 