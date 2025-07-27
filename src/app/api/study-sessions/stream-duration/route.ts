import { NextRequest, NextResponse } from 'next/server';
import { startStudySession, endStudySession, getDailyStudyTime, updateStudySessionWithStreamDuration, updateStudySessionWithStreamDurationByCallId } from '@/lib/db-utils';
import { getStreamCallDuration } from '@/lib/stream-duration-utils';

// Performance optimization: Only log in development or when explicitly enabled
const isDebugMode = process.env.NODE_ENV === 'development' || process.env.STREAM_WEBHOOK_DEBUG === 'true';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Minimal logging for performance
    if (isDebugMode) {
      console.log('Stream duration webhook received:', body.type);
    }

    // Handle Stream.io webhook payload
    if (body.type === 'call.ended') {
      const { call } = body;
      const callId = call.id;
      const duration = call.duration || 0; // Duration in seconds
      
      if (isDebugMode) {
        console.log('Call ended webhook:', { callId, duration });
      }
      
      // Find the session for this call and update it with Stream.io duration
      const session = await updateStudySessionWithStreamDurationByCallId(callId, duration);
      if (isDebugMode) {
        console.log('Session updated:', session);
      }
      return NextResponse.json({ success: true, session });
    }
    
    // Handle participant left event which contains duration
    if (body.type === 'call.session_participant_left') {
      const callId = body.call_cid?.split(':')[1] || body.call?.id;
      const duration = body.duration_seconds || 0; // Duration in seconds
      const participant = body.participant;
      const userId = participant?.user?.id;
      
      if (isDebugMode) {
        console.log('Participant left webhook:', { callId, duration, userId });
      }
      
      if (callId && duration > 0 && userId) {
        // Find the session for this call and update it with Stream.io duration
        const session = await updateStudySessionWithStreamDurationByCallId(callId, duration);
        if (isDebugMode) {
          console.log('Session updated from participant left:', session);
        }
        
        if (!session) {
          if (isDebugMode) {
            console.log('No session found for callId, trying to find by userId...');
          }
          // Try to find session by userId
          const sessionByUser = await updateStudySessionWithStreamDuration(userId, callId, duration);
          if (sessionByUser) {
            if (isDebugMode) {
              console.log('Session found and updated by userId:', sessionByUser);
            }
            return NextResponse.json({ success: true, session: sessionByUser });
          }
        }
        
        return NextResponse.json({ success: true, session });
      } else {
        if (isDebugMode) {
          console.log('Participant left webhook skipped:', { callId, duration, userId, hasCallId: !!callId, hasDuration: duration > 0, hasUserId: !!userId });
        }
      }
    }
    
    // Handle call.session_ended event - this contains session duration
    if (body.type === 'call.session_ended') {
      const callId = body.call_cid?.split(':')[1] || body.call?.id;
      const session = body.call?.session;
      
      if (isDebugMode) {
        console.log('Call session ended webhook:', { callId, session });
      }
      
      if (callId && session) {
        // Calculate duration from session start and end times
        const sessionStart = new Date(session.started_at);
        const sessionEnd = new Date(session.ended_at);
        const durationSeconds = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000);
        
        if (isDebugMode) {
          console.log('Session duration calculated:', { durationSeconds, sessionStart, sessionEnd });
        }
        
        if (durationSeconds > 0) {
          // Update all study sessions for this call with the session duration
          const updatedSession = await updateStudySessionWithStreamDurationByCallId(callId, durationSeconds);
          if (isDebugMode) {
            console.log('Study sessions updated with session duration:', updatedSession);
          }
          
          if (!updatedSession) {
            if (isDebugMode) {
              console.log('No session found for callId in session_ended, trying to find by created_by...');
            }
            // Try to find session by the call creator
            const createdBy = body.call?.created_by;
            if (createdBy?.id) {
              const userId = createdBy.id;
              if (isDebugMode) {
                console.log('Trying to find session by created_by userId:', userId);
              }
              const sessionByUser = await updateStudySessionWithStreamDuration(userId, callId, durationSeconds);
              if (sessionByUser) {
                if (isDebugMode) {
                  console.log('Session found and updated by created_by userId:', sessionByUser);
                }
                return NextResponse.json({ success: true, session: sessionByUser });
              }
            }
          }
          
          return NextResponse.json({ success: true, session: updatedSession });
        }
      }
    }
    
    // Handle other call events (for debugging)
    if (body.type && body.type.startsWith('call.')) {
      if (isDebugMode) {
        console.log('Other call event received:', body.type);
      }
      return NextResponse.json({ success: true, message: 'Event received' });
    }
    
    // Handle manual API calls (existing functionality)
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
    console.error('Error handling Stream duration webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
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
    return NextResponse.json(dailyStudyTime);
  } catch (error) {
    console.error('Error getting daily study time:', error);
    return NextResponse.json({ error: 'Failed to get daily study time' }, { status: 500 });
  }
} 