import { NextRequest, NextResponse } from 'next/server';
import { getUserBotDetectionInfo } from '@/lib/db-utils';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getUserInfoOptimized } from '@/lib/db-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const userInfo = await getUserInfoOptimized(user.id);
    if (!userInfo?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { userId } = await params;

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