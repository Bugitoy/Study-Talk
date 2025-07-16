import { NextRequest, NextResponse } from 'next/server';
import { startStudySession, endStudySession, getDailyStudyTime } from '@/lib/db-utils';
import prisma from '@/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    console.log('=== DEBUG STUDY SESSIONS API ===');
    
    // Get all sessions for the user
    const allSessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log('Total sessions for user:', allSessions.length);
    console.log('Sessions:', allSessions);
    
    // Get daily study time
    const dailyMinutes = await getDailyStudyTime(userId);
    console.log('Daily minutes for user:', dailyMinutes);
    
    return NextResponse.json({
      totalSessions: allSessions.length,
      sessions: allSessions,
      dailyMinutes,
    });
  } catch (error) {
    console.error('Error in debug study sessions:', error);
    return NextResponse.json({ error: 'Failed to debug study sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, callId, action } = await req.json();
    
    console.log('=== DEBUG STUDY SESSIONS POST ===');
    console.log('Action:', action, 'User:', userId, 'Call:', callId);
    
    if (!userId || !callId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    let result;
    if (action === 'start') {
      result = await startStudySession(userId, callId);
    } else if (action === 'end') {
      result = await endStudySession(userId, callId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Get updated daily minutes
    const dailyMinutes = await getDailyStudyTime(userId);
    
    return NextResponse.json({
      action,
      result,
      dailyMinutes,
    });
  } catch (error) {
    console.error('Error in debug study sessions POST:', error);
    return NextResponse.json({ error: 'Failed to debug study sessions' }, { status: 500 });
  }
} 