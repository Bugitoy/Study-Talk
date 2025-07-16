import { NextRequest, NextResponse } from 'next/server';
import { startStudySession, endStudySession, getDailyStudyTime, updateStudySessionWithStreamDuration, updateStudySessionWithStreamDurationByCallId } from '@/lib/db-utils';
import { getStreamCallDuration } from '@/lib/stream-duration-utils';

export async function POST(req: NextRequest) {
  try {
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('Stream.io webhook received:', JSON.stringify(body, null, 2));

    // Handle Stream.io webhook payload
    if (body.type === 'call.ended') {
      const { call } = body;
      const callId = call.id;
      const duration = call.duration || 0; // Duration in seconds
      
      console.log('Call ended webhook:', { callId, duration });
      
      // Find the session for this call and update it with Stream.io duration
      const session = await updateStudySessionWithStreamDurationByCallId(callId, duration);
      console.log('Session updated:', session);
      return NextResponse.json({ success: true, session });
    }
    
    // Handle participant left event which contains duration
    if (body.type === 'call.session_participant_left') {
      const callId = body.call_cid?.split(':')[1] || body.call?.id;
      const duration = body.duration_seconds || 0; // Duration in seconds
      
      console.log('Participant left webhook:', { callId, duration });
      
      if (callId && duration > 0) {
        // Find the session for this call and update it with Stream.io duration
        const session = await updateStudySessionWithStreamDurationByCallId(callId, duration);
        console.log('Session updated from participant left:', session);
        return NextResponse.json({ success: true, session });
      }
    }
    
    // Handle other call events (for debugging)
    if (body.type && body.type.startsWith('call.')) {
      console.log('Other call event received:', body.type);
      return NextResponse.json({ success: true, message: 'Event received' });
    }
    
    // Handle manual API calls (existing functionality)
    const { userId, callId, action } = body;
    
    if (!userId || !callId || !action) {
      console.log('Manual API call with missing fields:', { userId, callId, action });
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
          console.warn('Call not found in Stream.io or duration is 0:', callId);
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
    console.error('Error handling study session with Stream duration:', error);
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