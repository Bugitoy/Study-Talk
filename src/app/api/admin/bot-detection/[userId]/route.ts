import { NextRequest, NextResponse } from 'next/server';
import { getUserBotDetectionInfo } from '@/lib/db-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const botDetectionInfo = await getUserBotDetectionInfo(userId);

    if (!botDetectionInfo) {
      return NextResponse.json(
        { error: 'User not found or bot detection failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(botDetectionInfo);
  } catch (error) {
    console.error('Error getting bot detection info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 