import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import { startStudySession, updateStudySessionWithStreamDuration, endStudyGroupRoom, listActiveStudyGroupRooms, endCompeteRoom } from '@/lib/db-utils';
import prisma from '@/db/prisma';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

// In-memory cache for study groups (shared with study-groups API)
const studyGroupsCache = new Map<string, { data: any; timestamp: number }>();

// Cache invalidation function for study groups
const invalidateStudyGroupsCache = () => {
  console.log('Invalidating study groups cache due to participant change');
  studyGroupsCache.clear();
};

// Cache invalidation function for compete rooms
const invalidateCompeteRoomsCache = () => {
  console.log('Invalidating compete rooms cache due to participant change');
  // Note: compete rooms cache is handled by the useCompeteRooms hook
  // This function is for future use if we implement server-side caching
};

// Debug mode for development
const isDebugMode = process.env.NODE_ENV === 'development' || process.env.STREAM_WEBHOOK_DEBUG === 'true';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Minimal logging for performance
    if (isDebugMode) {
      console.log('Webhook received:', body.type);
    }

    // Stream.io sends the event data directly, not wrapped in an 'event' property
    const event = body;
    
    if (!event || !event.type) {
      console.error('Invalid webhook payload:', { hasEvent: !!event, hasType: !!event?.type });
      return NextResponse.json({ error: 'No event data or event type' }, { status: 400 });
    }

    const client = new StreamClient(apiKey!, apiSecret!);

    switch (event.type) {
      case 'call.session_started':
        await handleSessionStarted(event, client);
        break;
      case 'call.session_participant_joined':
        await handleParticipantJoined(event, client);
        break;
      case 'call.session_participant_left':
        await handleParticipantLeft(event, client);
        break;
      case 'call.session_ended':
        await handleSessionEnded(event, client);
        break;
      case 'call.ended':
        await handleCallEnded(event, client);
        break;
      case 'call.member_added':
        // Handle member added event for user blocking/banning
        await handleMemberAdded(event, client);
        break;
      case 'call.member_removed':
        // Handle member removed event (when users are banned/removed)
        if (isDebugMode) {
          console.log('Member removed event received for call:', event.call_cid);
        }
        await handleMemberRemoved(event, client);
        break;
      case 'call.member_updated':
        // Handle member updated events (these might include joins)
        if (isDebugMode) {
          console.log('Member updated event received for call:', event.call_cid);
        }
        // Check if this is actually a join event
        if (event.members && event.members.length > 0) {
          if (isDebugMode) {
            console.log('Processing member updated as potential join event');
          }
          await handleMemberAdded(event, client);
        }
        break;
      case 'user.updated':
        // Handle user updates (these are normal, not errors)
        if (isDebugMode) {
          console.log('User updated event received:', event.user?.id);
        }
        break;
      case 'call.stats_report_ready':
        // Handle stats report events (these are normal, not errors)
        if (isDebugMode) {
          console.log('Stats report ready event received for call:', event.call_cid);
        }
        break;
      case 'call.updated':
        // Handle call updates (these are normal, not errors)
        if (isDebugMode) {
          console.log('Call updated event received for call:', event.call_cid);
        }
        break;
      default:
        if (isDebugMode) {
          console.log('Unhandled Stream event type:', event.type);
        }
        // For any unhandled event, check if it contains member information
        if (event.members && event.members.length > 0) {
          if (isDebugMode) {
            console.log('Unhandled event contains members, checking for bans...');
          }
          await handleMemberAdded(event, client);
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Stream webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

async function handleSessionStarted(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    
    if (!callId) {
      if (isDebugMode) {
        console.log('No callId found in session started event');
      }
      return;
    }
    
    if (isDebugMode) {
      console.log('Call session started:', callId);
    }
    
    // Store session start time in database for duration calculation
    await prisma.callSession.upsert({
      where: { callId },
      update: { 
        sessionStartedAt: new Date(),
        isActive: true 
      },
      create: {
        callId,
        sessionStartedAt: new Date(),
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error handling session started event:', error);
  }
}

async function handleMemberRemoved(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    
    // Handle different event structures for member removal
    let userId = null;
    if (event.members && event.members.length > 0) {
      userId = event.members[0];
    }
    
    if (!callId || !userId) {
      if (isDebugMode) {
        console.log('No callId or userId found in member removed event');
      }
      return;
    }
    
    if (isDebugMode) {
      console.log('Member removed:', userId, 'from call:', callId);
    }
    
    // Update participant record to mark them as left
    await prisma.callParticipant.updateMany({
      where: { 
        callId,
        userId,
        isActive: true
      },
      data: {
        leftAt: new Date(),
        isActive: false,
      },
    });
    
    if (isDebugMode) {
      console.log('Updated participant record for removed user:', userId);
    }
  } catch (error) {
    console.error('Error handling member removed event:', error);
  }
}

async function handleMemberAdded(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    
    // Handle different event structures
    let userId = null;
    if (event.members && event.members.length > 0) {
      userId = event.members[0]?.user_id || event.members[0]?.user?.id;
    } else if (event.participant) {
      userId = event.participant?.user?.id || event.participant?.user_id;
    }
    
    if (!callId || !userId) {
      if (isDebugMode) {
        console.log('No callId or userId found in member added event');
      }
      return;
    }
    
    if (isDebugMode) {
      console.log('Member added:', userId, 'in call:', callId);
    }
    
    // Check if user is globally blocked
    if (isDebugMode) {
      console.log('Checking if user is globally blocked:', userId);
    }
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (isDebugMode) {
      console.log('User found:', user ? { id: user.id, name: user.name, isBlocked: user.isBlocked } : 'NOT FOUND');
    }
    
    if (user?.isBlocked) {
      console.log('Blocked user attempted to join call:', userId);
      // Remove user from call using Stream.io
      try {
        if (isDebugMode) {
          console.log('Attempting to remove blocked user using Stream.io API (member added)...');
        }
        
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        
        if (isDebugMode) {
          console.log('Stream.io API response for removing blocked user (member added):', removeResult);
        }
        
        // Verify the user was actually removed by querying call members
        const membersAfterRemoval = await client.video.queryCallMembers({
          id: callId,
          type: event.call?.type || 'default'
        });
        
        const userStillInCall = (membersAfterRemoval.members || []).some((m: any) => 
          (m.user_id || m.user?.id) === userId
        );
        
        if (isDebugMode) {
          console.log('User still in call after removal attempt:', userStillInCall);
        }
        
        // If user is still in call, log but don't end the call to avoid removing all users
        if (userStillInCall) {
          if (isDebugMode) {
            console.log('User still in call, but not ending call to avoid removing all users');
            console.log('Blocked user removal may not be immediate - webhook will handle future joins');
          }
        } else {
          console.log('Successfully removed blocked user from call (member added):', userId);
        }
      } catch (removeError) {
        console.error('Failed to remove blocked user from call (member added):', removeError);
      }
      return;
    }
    
    // Check if user is banned from this specific room
    if (isDebugMode) {
      console.log('Checking for room ban - userId:', userId, 'callId:', callId);
    }
    const roomBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });
    
    if (isDebugMode) {
      console.log('Room ban check result:', roomBan ? 'BANNED' : 'NOT BANNED');
    }
    
    if (roomBan) {
      console.log('Room-banned user attempted to join call:', userId, 'callId:', callId);
      // Remove user from call using Stream.io
      try {
        if (isDebugMode) {
          console.log('Attempting to remove banned user from call using Stream.io API...');
        }
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        if (isDebugMode) {
          console.log('Stream.io API response for removing banned user:', removeResult);
        }
        console.log('Successfully removed room-banned user from call:', userId);
      } catch (removeError) {
        console.error('Failed to remove room-banned user from call:', removeError);
      }
      return;
    }
    
    // Start study session for this user
    if (isDebugMode) {
      console.log('startStudySession called with userId:', userId, 'callId:', callId);
    }
    await startStudySession(userId, callId);
    
    // Store participant join time
    await prisma.callParticipant.upsert({
      where: { 
        callId_userId: {
          callId,
          userId
        }
      },
      update: { 
        joinedAt: new Date(),
        leftAt: null,
        isActive: true
      },
      create: {
        callId,
        userId,
        joinedAt: new Date(),
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error handling member added event:', error);
  }
}

async function handleParticipantJoined(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    const userId = event.participant?.user?.id || event.participant?.user_id;
    
    if (!callId || !userId) {
      if (isDebugMode) {
        console.log('No callId or userId found in participant joined event');
      }
      return;
    }
    
    if (isDebugMode) {
      console.log('Participant joined:', userId, 'in call:', callId);
    }
    
    // Check if user is globally blocked
    if (isDebugMode) {
      console.log('Checking if user is globally blocked (participant joined):', userId);
    }
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (isDebugMode) {
      console.log('User found (participant joined):', user ? { id: user.id, name: user.name, isBlocked: user.isBlocked } : 'NOT FOUND');
    }
    
    if (user?.isBlocked) {
      console.log('Blocked user attempted to join call:', userId);
      // Remove user from call using Stream.io
      try {
        if (isDebugMode) {
          console.log('Attempting to remove blocked user using Stream.io API...');
        }
        
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        
        if (isDebugMode) {
          console.log('Stream.io API response for removing blocked user:', removeResult);
        }
        
        // Verify the user was actually removed by querying call members
        const membersAfterRemoval = await client.video.queryCallMembers({
          id: callId,
          type: event.call?.type || 'default'
        });
        
        const userStillInCall = (membersAfterRemoval.members || []).some((m: any) => 
          (m.user_id || m.user?.id) === userId
        );
        
        if (isDebugMode) {
          console.log('User still in call after removal attempt:', userStillInCall);
        }
        
        // If user is still in call, log but don't end the call to avoid removing all users
        if (userStillInCall) {
          if (isDebugMode) {
            console.log('User still in call, but not ending call to avoid removing all users');
            console.log('Blocked user removal may not be immediate - webhook will handle future joins');
          }
        } else {
          console.log('Successfully removed blocked user from call:', userId);
        }
      } catch (removeError) {
        console.error('Failed to remove blocked user from call:', removeError);
      }
      return;
    }
    
    // Check if user is banned from this specific room
    if (isDebugMode) {
      console.log('Checking for room ban - userId:', userId, 'callId:', callId);
    }
    const roomBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });
    
    if (isDebugMode) {
      console.log('Room ban check result:', roomBan ? 'BANNED' : 'NOT BANNED');
    }
    
    if (roomBan) {
      console.log('Room-banned user attempted to join call:', userId, 'callId:', callId);
      // Remove user from call using Stream.io
      try {
        if (isDebugMode) {
          console.log('Attempting to remove banned user from call using Stream.io API...');
        }
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        if (isDebugMode) {
          console.log('Stream.io API response for removing banned user:', removeResult);
        }
        console.log('Successfully removed room-banned user from call:', userId);
      } catch (removeError) {
        console.error('Failed to remove room-banned user from call:', removeError);
      }
      return;
    }
    
    // Start study session for this user
    if (isDebugMode) {
      console.log('startStudySession called with userId:', userId, 'callId:', callId);
    }
    await startStudySession(userId, callId);
    
    // Store participant join time
    await prisma.callParticipant.upsert({
      where: { 
        callId_userId: {
          callId,
          userId
        }
      },
      update: { 
        joinedAt: new Date(),
        leftAt: null,
        isActive: true
      },
      create: {
        callId,
        userId,
        joinedAt: new Date(),
        isActive: true,
      },
    });
    
    // Invalidate study groups cache to reflect participant count change
    invalidateStudyGroupsCache();
    
    // Invalidate compete rooms cache to reflect participant count change
    invalidateCompeteRoomsCache();
  } catch (error) {
    console.error('Error handling participant joined event:', error);
  }
}

async function handleParticipantLeft(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    const userId = event.participant?.user?.id || event.participant?.user_id;
    
    if (!callId || !userId) {
      if (isDebugMode) {
        console.log('No callId or userId found in participant left event');
      }
      return;
    }
    
    if (isDebugMode) {
      console.log('Participant left:', userId, 'from call:', callId);
    }
    
    // Update participant record
    await prisma.callParticipant.updateMany({
      where: { 
        callId,
        userId,
        isActive: true
      },
      data: {
        leftAt: new Date(),
        isActive: false,
      },
    });
    
    // Calculate duration and update study session
    const participantRecord = await prisma.callParticipant.findFirst({
      where: { 
        callId,
        userId,
      },
      orderBy: { joinedAt: 'desc' },
    });
    
    if (participantRecord && participantRecord.joinedAt) {
      // Use duration from webhook payload if available, otherwise calculate manually
      let durationSeconds = 0;
      
      // Check if the event has duration_seconds (from Stream.io webhook)
      if (event.duration_seconds) {
        durationSeconds = event.duration_seconds;
        if (isDebugMode) {
          console.log('Using duration from webhook payload:', durationSeconds, 'seconds');
        }
      } else {
        // Fallback to manual calculation
        durationSeconds = Math.floor(
          (new Date().getTime() - participantRecord.joinedAt.getTime()) / 1000
        );
        if (isDebugMode) {
          console.log('Using manual duration calculation:', durationSeconds, 'seconds');
        }
      }
      
      await updateStudySessionWithStreamDuration(userId, callId, durationSeconds);
    }

    // Check if this was the host leaving (for study group rooms)
    const studyGroupRoom = await prisma.studyGroupRoom.findFirst({
      where: { callId, ended: false }
    });
    
    if (studyGroupRoom) {
      if (isDebugMode) {
        console.log('Host left study group room, ending room:', callId);
      }
      await endStudyGroupRoom(callId);
    }
    
    // Check if this was the host leaving (for compete rooms)
    const competeRoom = await prisma.competeRoom.findFirst({
      where: { callId, ended: false }
    });
    
    if (competeRoom) {
      if (isDebugMode) {
        console.log('Host left compete room, ending room:', callId);
      }
      await endCompeteRoom(callId);
    }
    
    // Invalidate study groups cache to reflect participant count change
    invalidateStudyGroupsCache();
    
    // Invalidate compete rooms cache to reflect participant count change
    invalidateCompeteRoomsCache();
  } catch (error) {
    console.error('Error handling participant left event:', error);
  }
}

async function handleSessionEnded(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    
    if (!callId) {
      if (isDebugMode) {
        console.log('No callId found in session ended event');
      }
      return;
    }
    
    if (isDebugMode) {
      console.log('Call session ended:', callId);
    }
    
    // Check if this is a study group room (don't filter by ended status)
    const studyGroupRoom = await prisma.studyGroupRoom.findFirst({
      where: { callId }
    });
    
    if (studyGroupRoom) {
      if (isDebugMode) {
        console.log('Found study group room to end:', studyGroupRoom.roomName, 'ended:', studyGroupRoom.ended);
      }
      
      // End the room if it's not already ended
      if (!studyGroupRoom.ended) {
        if (isDebugMode) {
          console.log('Ending study group room:', callId);
        }
        await endStudyGroupRoom(callId);
      } else {
        if (isDebugMode) {
          console.log('Room already ended, skipping');
        }
      }
    } else {
      if (isDebugMode) {
        console.log('No study group room found for callId:', callId);
      }
    }
    
    // Check if this is a compete room (don't filter by ended status)
    const competeRoom = await prisma.competeRoom.findFirst({
      where: { callId }
    });
    
    if (competeRoom) {
      if (isDebugMode) {
        console.log('Found compete room to end:', competeRoom.roomName, 'ended:', competeRoom.ended);
      }
      
      // End the room if it's not already ended
      if (!competeRoom.ended) {
        if (isDebugMode) {
          console.log('Ending compete room:', callId);
        }
        await endCompeteRoom(callId);
      } else {
        if (isDebugMode) {
          console.log('Compete room already ended, skipping');
        }
      }
    } else {
      if (isDebugMode) {
        console.log('No compete room found for callId:', callId);
      }
    }
    
    // Update session record
    await prisma.callSession.updateMany({
      where: { 
        callId,
        isActive: true
      },
      data: {
        sessionEndedAt: new Date(),
        isActive: false,
      },
    });
    
    // Get Stream.io duration from the webhook payload
    let streamDurationSeconds = 0;
    
    // Try to get duration from the session data
    if (event.call?.session) {
      const session = event.call.session;
      if (session.started_at && session.ended_at) {
        const startTime = new Date(session.started_at).getTime();
        const endTime = new Date(session.ended_at).getTime();
        streamDurationSeconds = Math.floor((endTime - startTime) / 1000);
        
        if (isDebugMode) {
          console.log('Using duration from webhook payload:', streamDurationSeconds, 'seconds');
        }
      }
    }
    
    // If no duration from session, try to get it from call duration
    if (streamDurationSeconds === 0 && event.call?.duration) {
      streamDurationSeconds = event.call.duration;
      if (isDebugMode) {
        console.log('Using duration from call object:', streamDurationSeconds, 'seconds');
      }
    }
    
    // If still no duration, calculate manually as fallback
    if (streamDurationSeconds === 0) {
      if (isDebugMode) {
        console.log('No Stream.io duration available, using manual calculation');
      }
    }
    
    // End all active study sessions for this call
    const activeSessions = await prisma.studySession.findMany({
      where: { 
        callId,
        leftAt: null 
      },
    });

    if (isDebugMode) {
      console.log('Ending', activeSessions.length, 'active study sessions for call:', callId);
    }

    for (const session of activeSessions) {
      // Use Stream.io duration if available, otherwise calculate manually
      const finalDurationSeconds = streamDurationSeconds > 0 
        ? streamDurationSeconds 
        : Math.floor((new Date().getTime() - session.joinedAt.getTime()) / 1000);
      
      await updateStudySessionWithStreamDuration(
        session.userId,
        callId,
        finalDurationSeconds
      );
    }
  } catch (error) {
    console.error('Error handling session ended event:', error);
  }
}

async function handleCallEnded(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    
    if (!callId) {
      if (isDebugMode) {
        console.log('No callId found in call ended event');
      }
      return;
    }
    
    if (isDebugMode) {
      console.log('Call ended:', callId);
    }
    
    // Check if this is a study group room (don't filter by ended status)
    const studyGroupRoom = await prisma.studyGroupRoom.findFirst({
      where: { callId }
    });
    
    if (studyGroupRoom) {
      if (isDebugMode) {
        console.log('Found study group room to end:', studyGroupRoom.roomName, 'ended:', studyGroupRoom.ended);
      }
      
      // End the room if it's not already ended
      if (!studyGroupRoom.ended) {
        if (isDebugMode) {
          console.log('Ending study group room:', callId);
        }
        await endStudyGroupRoom(callId);
      } else {
        if (isDebugMode) {
          console.log('Room already ended, skipping');
        }
      }
    } else {
      if (isDebugMode) {
        console.log('No study group room found for callId:', callId);
      }
    }
    
    // Check if this is a compete room (don't filter by ended status)
    const competeRoom = await prisma.competeRoom.findFirst({
      where: { callId }
    });
    
    if (competeRoom) {
      if (isDebugMode) {
        console.log('Found compete room to end:', competeRoom.roomName, 'ended:', competeRoom.ended);
      }
      
      // End the room if it's not already ended
      if (!competeRoom.ended) {
        if (isDebugMode) {
          console.log('Ending compete room:', callId);
        }
        await endCompeteRoom(callId);
      } else {
        if (isDebugMode) {
          console.log('Compete room already ended, skipping');
        }
      }
    } else {
      if (isDebugMode) {
        console.log('No compete room found for callId:', callId);
      }
    }
    
    // End all active study sessions for this call
    const activeSessions = await prisma.studySession.findMany({
      where: { 
        callId,
        leftAt: null 
      },
    });

    if (isDebugMode) {
      console.log('Ending', activeSessions.length, 'active study sessions for call:', callId);
    }

    // Get Stream.io duration from the webhook payload
    let streamDurationSeconds = 0;
    
    // Try to get duration from the call object
    if (event.call?.duration) {
      streamDurationSeconds = event.call.duration;
      if (isDebugMode) {
        console.log('Using duration from call object:', streamDurationSeconds, 'seconds');
      }
    }
    
    // If no duration from call, try to get it from session data
    if (streamDurationSeconds === 0 && event.call?.session) {
      const session = event.call.session;
      if (session.started_at && session.ended_at) {
        const startTime = new Date(session.started_at).getTime();
        const endTime = new Date(session.ended_at).getTime();
        streamDurationSeconds = Math.floor((endTime - startTime) / 1000);
        
        if (isDebugMode) {
          console.log('Using duration from session data:', streamDurationSeconds, 'seconds');
        }
      }
    }
    
    // If still no duration, calculate manually as fallback
    if (streamDurationSeconds === 0) {
      if (isDebugMode) {
        console.log('No Stream.io duration available, using manual calculation');
      }
    }

    for (const session of activeSessions) {
      // Use Stream.io duration if available, otherwise calculate manually
      const finalDurationSeconds = streamDurationSeconds > 0 
        ? streamDurationSeconds 
        : Math.floor((new Date().getTime() - session.joinedAt.getTime()) / 1000);
      
      await updateStudySessionWithStreamDuration(
        session.userId,
        callId,
        finalDurationSeconds
      );
    }
  } catch (error) {
    console.error('Error handling call ended event:', error);
  }
} 