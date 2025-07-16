import { NextRequest, NextResponse } from 'next/server';
import { startStudySession, endStudySession, getDailyStudyTime } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const { userId, callId, action } = await req.json();
    
    console.log('Study session API called:', { userId, callId, action });
    
    if (!userId || !callId || !action) {
      console.error('Missing required fields:', { userId, callId, action });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (action === 'start') {
      console.log('Starting study session for user:', userId, 'call:', callId);
      const session = await startStudySession(userId, callId);
      console.log('Study session started:', session);
      return NextResponse.json(session);
    } else if (action === 'end') {
      console.log('Ending study session for user:', userId, 'call:', callId);
      const session = await endStudySession(userId, callId);
      console.log('Study session ended:', session);
      return NextResponse.json(session);
    } else {
      console.error('Invalid action:', action);
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
    const minutes = await getDailyStudyTime(userId, targetDate);
    
    return NextResponse.json({ minutes });
  } catch (error) {
    console.error('Error getting study time:', error);
    return NextResponse.json({ error: 'Failed to get study time' }, { status: 500 });
  }
} 