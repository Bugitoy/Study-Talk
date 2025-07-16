import { NextRequest, NextResponse } from 'next/server';
import { startStudySession, endStudySession, getDailyStudyTime } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const { userId, callId, action } = await req.json();
    
    if (!userId || !callId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (action === 'start') {
      const session = await startStudySession(userId, callId);
      return NextResponse.json(session);
    } else if (action === 'end') {
      const session = await endStudySession(userId, callId);
      return NextResponse.json(session);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling study session:', error);
    return NextResponse.json({ error: 'Failed to handle study session' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    const targetDate = date ? new Date(date) : undefined;
    const hours = await getDailyStudyTime(userId, targetDate);
    
    return NextResponse.json({ hours });
  } catch (error) {
    console.error('Error getting study time:', error);
    return NextResponse.json({ error: 'Failed to get study time' }, { status: 500 });
  }
} 