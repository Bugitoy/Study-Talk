import { NextRequest, NextResponse } from 'next/server';
import { startStudySession, endStudySession, getDailyStudyTime, updateStudySessionWithStreamDuration, updateStudySessionWithStreamDurationByCallId } from '@/lib/db-utils';
import { getStreamCallDuration } from '@/lib/stream-duration-utils';

// Performance optimization: Only log in development or when explicitly enabled
const isDebugMode = process.env.NODE_ENV === 'development' || process.env.STREAM_WEBHOOK_DEBUG === 'true';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle manual API calls only
    const { userId, callId, action } = body;
    
    if (!userId || !callId || !action) {
      if (isDebugMode) {
        console.log('Manual API call with missing fields:', { userId, callId, action });
      }
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'start') {
      // Start session as before
      const session = await startStudySession(userId, callId);
      return NextResponse.json(session);
    } else if (action === 'end') {
      // Get call duration from Stream.io
      try {
        const streamDuration = await getStreamCallDuration(callId);
        
        if (streamDuration === 0) {
          if (isDebugMode) {
            console.warn('Call not found in Stream.io or duration is 0:', callId);
          }
          // Fallback to manual duration calculation
          const session = await endStudySession(userId, callId);
          return NextResponse.json(session);
        }
        
        // Update session with Stream.io duration
        const session = await updateStudySessionWithStreamDuration(userId, callId, streamDuration);
        return NextResponse.json(session);
      } catch (streamError) {
        console.error('Error fetching call duration from Stream.io:', streamError);
        // Fallback to manual duration calculation
        const session = await endStudySession(userId, callId);
        return NextResponse.json(session);
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling Stream duration API call:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    const dailyStudyTime = await getDailyStudyTime(userId);
    if (isDebugMode) {
      console.log('Daily study time:', dailyStudyTime);
    }
    return NextResponse.json({ hours: dailyStudyTime });
  } catch (error) {
    console.error('Error getting daily study time:', error);
    return NextResponse.json({ error: 'Failed to get daily study time' }, { status: 500 });
  }
} 