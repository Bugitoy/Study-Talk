import { NextRequest, NextResponse } from 'next/server';
import { getStreamCallDuration, getStreamCallDetails } from '@/lib/stream-duration-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('callId');
    
    if (!callId) {
      return NextResponse.json({ error: 'Missing callId parameter' }, { status: 400 });
    }
    
    console.log('=== DEBUG STREAM DURATION ===');
    console.log('Testing call ID:', callId);
    
    // Test duration fetching
    const duration = await getStreamCallDuration(callId);
    console.log('Duration from Stream.io:', duration, 'seconds');
    
    // Test call details
    const details = await getStreamCallDetails(callId);
    console.log('Call details:', details ? 'Found' : 'Not found');
    
    if (details) {
      console.log('Call ended at:', details.call.ended_at);
      console.log('Call members:', details.members.length);
      console.log('Call duration:', details.duration, 'seconds');
    }
    
    return NextResponse.json({
      callId,
      duration,
      details: details ? {
        endedAt: details.call.ended_at,
        memberCount: details.members.length,
        duration: details.duration,
      } : null,
    });
  } catch (error) {
    console.error('Error in debug stream duration:', error);
    return NextResponse.json({ error: 'Failed to debug stream duration' }, { status: 500 });
  }
} 