import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

/**
 * Get call duration from Stream.io API
 * @param callId - The Stream.io call ID
 * @returns Duration in seconds, or 0 if not found
 */
export async function getStreamCallDuration(callId: string): Promise<number> {
  if (!apiKey || !apiSecret) {
    console.warn('Stream credentials not configured');
    return 0;
  }

  try {
    const client = new StreamClient(apiKey, apiSecret);
    const { calls } = await client.video.queryCalls({
      filter_conditions: { id: callId },
      limit: 1,
    });

    if (calls.length === 0) {
      console.warn('Call not found in Stream.io:', callId);
      return 0;
    }

    const call = calls[0];
    
    // Try different ways to access duration
    let duration = 0;
    
    // Method 1: Direct property access
    if ((call.call as any).duration) {
      duration = (call.call as any).duration;
    }
    // Method 2: Check if duration is in a different property
    else if ((call.call as any).duration_seconds) {
      duration = (call.call as any).duration_seconds;
    }
    // Method 3: Calculate from timestamps if available
    else if ((call.call as any).created_at && (call.call as any).ended_at) {
      const startTime = new Date((call.call as any).created_at).getTime();
      const endTime = new Date((call.call as any).ended_at).getTime();
      duration = Math.floor((endTime - startTime) / 1000);
    }
    
    console.log(`Stream.io call duration for ${callId}:`, duration, 'seconds');
    console.log('Call object keys:', Object.keys(call.call));
    console.log('Call duration property:', (call.call as any).duration);
    
    return duration;
  } catch (error) {
    console.error('Error fetching call duration from Stream.io:', error);
    return 0;
  }
}

/**
 * Convert Stream.io duration (seconds) to minutes
 * @param durationSeconds - Duration in seconds from Stream.io
 * @returns Duration in minutes
 */
export function convertStreamDurationToMinutes(durationSeconds: number): number {
  return Math.floor(durationSeconds / 60);
}

/**
 * Get call details from Stream.io including duration and member information
 * @param callId - The Stream.io call ID
 * @returns Call details or null if not found
 */
export async function getStreamCallDetails(callId: string) {
  if (!apiKey || !apiSecret) {
    console.warn('Stream credentials not configured');
    return null;
  }

  try {
    const client = new StreamClient(apiKey, apiSecret);
    const { calls } = await client.video.queryCalls({
      filter_conditions: { id: callId },
      limit: 1,
    });

    if (calls.length === 0) {
      return null;
    }

    const call = calls[0];
    const membersResp = await client.video.queryCallMembers({ 
      id: callId, 
      type: call.call.type 
    });

    return {
      call: call.call,
      members: membersResp.members || [],
      duration: (call.call as any).duration || 0,
    };
  } catch (error) {
    console.error('Error fetching call details from Stream.io:', error);
    return null;
  }
}

/**
 * Check if a call is still active in Stream.io
 * @param callId - The Stream.io call ID
 * @returns True if call is active, false otherwise
 */
export async function isStreamCallActive(callId: string): Promise<boolean> {
  const details = await getStreamCallDetails(callId);
  if (!details) return false;
  
  // Check if call has ended
  return !details.call.ended_at;
}

/**
 * Get all active calls for a user from Stream.io
 * @param userId - The user ID
 * @returns Array of active call IDs
 */
export async function getUserActiveCalls(userId: string): Promise<string[]> {
  if (!apiKey || !apiSecret) {
    console.warn('Stream credentials not configured');
    return [];
  }

  try {
    const client = new StreamClient(apiKey, apiSecret);
    const { calls } = await client.video.queryCalls({
      filter_conditions: {
        'members.user_id': userId,
      },
      limit: 50,
    });

    return calls
      .filter(call => !call.call.ended_at)
      .map(call => call.call.id as string);
  } catch (error) {
    console.error('Error fetching user active calls from Stream.io:', error);
    return [];
  }
} 