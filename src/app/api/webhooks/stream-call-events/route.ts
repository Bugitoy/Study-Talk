import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import { startStudySession, updateStudySessionWithStreamDuration, endStudyGroupRoom, listActiveStudyGroupRooms, endCompeteRoom } from '@/lib/db-utils';
import prisma from '@/db/prisma';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    console.log('Stream.io webhook received:', body);
    console.log('Webhook event type:', body.type);

    // Stream.io sends the event data directly, not wrapped in an 'event' property
    const event = body;
    
    if (!event || !event.type) {
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
      case 'call.member_updated':
        // Handle member updated events (these might include joins)
        console.log('Member updated event received for call:', event.call_cid);
        // Check if this is actually a join event
        if (event.members && event.members.length > 0) {
          console.log('Processing member updated as potential join event');
          await handleMemberAdded(event, client);
        }
        break;
      case 'user.updated':
        // Handle user updates (these are normal, not errors)
        console.log('User updated event received:', event.user?.id);
        break;
      case 'call.stats_report_ready':
        // Handle stats report events (these are normal, not errors)
        console.log('Stats report ready event received for call:', event.call_cid);
        break;
      default:
        console.log('Unhandled Stream event type:', event.type);
        // For any unhandled event, check if it contains member information
        if (event.members && event.members.length > 0) {
          console.log('Unhandled event contains members, checking for bans...');
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
      console.log('No callId found in session started event');
      return;
    }
    
    console.log('Call session started:', callId);
    
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
      console.log('No callId or userId found in member added event');
      console.log('Event structure:', {
        callId,
        userId,
        hasMembers: !!event.members,
        hasParticipant: !!event.participant,
        eventType: event.type
      });
      return;
    }
    
    console.log('Member added:', userId, 'in call:', callId);
    
    // Check if user is globally blocked
    console.log('Checking if user is globally blocked:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    console.log('User found:', user ? { id: user.id, name: user.name, isBlocked: user.isBlocked } : 'NOT FOUND');
    
    if (user?.isBlocked) {
      console.log('Blocked user attempted to join call:', userId);
      // Remove user from call using Stream.io
      try {
        console.log('Attempting to remove blocked user using Stream.io API (member added)...');
        console.log('Call details:', { callId, type: event.call?.type || 'default', userId });
        
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        
        console.log('Stream.io API response for removing blocked user (member added):', removeResult);
        
        // Verify the user was actually removed by querying call members
        const membersAfterRemoval = await client.video.queryCallMembers({
          id: callId,
          type: event.call?.type || 'default'
        });
        
        const userStillInCall = (membersAfterRemoval.members || []).some((m: any) => 
          (m.user_id || m.user?.id) === userId
        );
        
        console.log('User still in call after removal attempt:', userStillInCall);
        
        // If user is still in call, try alternative removal method
        if (userStillInCall) {
          console.log('User still in call, trying alternative removal method...');
          try {
            // Try using a different approach - end the call for this specific user
            await client.video.endCall({
              id: callId,
              type: event.call?.type || 'default'
            });
            console.log('Ended call as alternative removal method');
          } catch (endCallError) {
            console.error('Failed to end call as alternative removal:', endCallError);
          }
        } else {
          console.log('Successfully removed blocked user from call (member added):', userId);
        }
      } catch (removeError) {
        console.error('Failed to remove blocked user from call (member added):', removeError);
        console.error('Error details:', {
          message: (removeError as any).message,
          code: (removeError as any).code,
          status: (removeError as any).status,
          response: (removeError as any).response
        });
      }
      return;
    }
    
    // Check if user is banned from this specific room
    console.log('Checking for room ban - userId:', userId, 'callId:', callId);
    const roomBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });
    
    console.log('Room ban check result:', roomBan ? 'BANNED' : 'NOT BANNED');
    
    if (roomBan) {
      console.log('Room-banned user attempted to join call:', userId, 'callId:', callId);
      // Remove user from call using Stream.io
      try {
        console.log('Attempting to remove banned user from call using Stream.io API...');
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        console.log('Stream.io API response for removing banned user:', removeResult);
        console.log('Successfully removed room-banned user from call:', userId);
      } catch (removeError) {
        console.error('Failed to remove room-banned user from call:', removeError);
        console.error('Error details:', {
          message: (removeError as any).message,
          code: (removeError as any).code,
          status: (removeError as any).status,
          response: (removeError as any).response
        });
      }
      return;
    }
  } catch (error) {
    console.error('Error handling member added event:', error);
  }
}

async function handleParticipantJoined(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    const userId = event.participant?.user?.id || event.participant?.user_id;
    
    if (!callId || !userId) {
      console.log('No callId or userId found in participant joined event');
      return;
    }
    
    console.log('Participant joined:', userId, 'in call:', callId);
    
    // Check if user is globally blocked
    console.log('Checking if user is globally blocked (participant joined):', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    console.log('User found (participant joined):', user ? { id: user.id, name: user.name, isBlocked: user.isBlocked } : 'NOT FOUND');
    
    if (user?.isBlocked) {
      console.log('Blocked user attempted to join call:', userId);
      // Remove user from call using Stream.io
      try {
        console.log('Attempting to remove blocked user using Stream.io API...');
        console.log('Call details:', { callId, type: event.call?.type || 'default', userId });
        
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        
        console.log('Stream.io API response for removing blocked user:', removeResult);
        
        // Verify the user was actually removed by querying call members
        const membersAfterRemoval = await client.video.queryCallMembers({
          id: callId,
          type: event.call?.type || 'default'
        });
        
        const userStillInCall = (membersAfterRemoval.members || []).some((m: any) => 
          (m.user_id || m.user?.id) === userId
        );
        
        console.log('User still in call after removal attempt:', userStillInCall);
        
        // If user is still in call, try alternative removal method
        if (userStillInCall) {
          console.log('User still in call, trying alternative removal method...');
          try {
            // Try using a different approach - end the call for this specific user
            await client.video.endCall({
              id: callId,
              type: event.call?.type || 'default'
            });
            console.log('Ended call as alternative removal method');
          } catch (endCallError) {
            console.error('Failed to end call as alternative removal:', endCallError);
          }
        } else {
          console.log('Successfully removed blocked user from call:', userId);
        }
      } catch (removeError) {
        console.error('Failed to remove blocked user from call:', removeError);
        console.error('Error details:', {
          message: (removeError as any).message,
          code: (removeError as any).code,
          status: (removeError as any).status,
          response: (removeError as any).response
        });
      }
      return;
    }
    
    // Check if user is banned from this specific room
    console.log('Checking for room ban - userId:', userId, 'callId:', callId);
    const roomBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });
    
    console.log('Room ban check result:', roomBan ? 'BANNED' : 'NOT BANNED');
    
    if (roomBan) {
      console.log('Room-banned user attempted to join call:', userId, 'callId:', callId);
      // Remove user from call using Stream.io
      try {
        console.log('Attempting to remove banned user from call using Stream.io API...');
        const removeResult = await client.video.updateCallMembers({
          id: callId,
          type: event.call?.type || 'default',
          remove_members: [userId],
        });
        console.log('Stream.io API response for removing banned user:', removeResult);
        console.log('Successfully removed room-banned user from call:', userId);
      } catch (removeError) {
        console.error('Failed to remove room-banned user from call:', removeError);
        console.error('Error details:', {
          message: (removeError as any).message,
          code: (removeError as any).code,
          status: (removeError as any).status,
          response: (removeError as any).response
        });
      }
      return;
    }
    
    // Start study session for this user
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
    console.error('Error handling participant joined event:', error);
  }
}

async function handleParticipantLeft(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    const userId = event.participant?.user?.id || event.participant?.user_id;
    
    if (!callId || !userId) {
      console.log('No callId or userId found in participant left event');
      return;
    }
    
    console.log('Participant left:', userId, 'from call:', callId);
    
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
        console.log('Using duration from webhook payload:', durationSeconds, 'seconds');
      } else {
        // Fallback to manual calculation
        durationSeconds = Math.floor(
          (new Date().getTime() - participantRecord.joinedAt.getTime()) / 1000
        );
        console.log('Using manual duration calculation:', durationSeconds, 'seconds');
      }
      
      await updateStudySessionWithStreamDuration(userId, callId, durationSeconds);
    }

    // Check if this was the host leaving (for study group rooms)
    const studyGroupRoom = await prisma.studyGroupRoom.findFirst({
      where: { callId, ended: false }
    });

    if (studyGroupRoom && studyGroupRoom.hostId === userId) {
      console.log('Host left the call:', userId);
      
      // Check if there are still other participants in the call
      const remainingParticipants = await client.video.queryCallMembers({ 
        id: callId, 
        type: event.call?.type || 'default'
      });
      
      const activeMembers = (remainingParticipants as any).members?.filter((m: any) => 
        (m.user_id || m.user?.id) !== userId
      ) || [];
      
      console.log('Remaining participants after host left:', activeMembers.length);
      
      if (activeMembers.length === 0) {
        // No one left in the call, end the room
        console.log('No participants remaining, ending study group room');
        await endStudyGroupRoom(callId);
      } else {
        console.log('Other participants still in call, room remains active');
      }
    } else {
      // Regular participant left, check if call is now empty
      const remainingParticipants = await client.video.queryCallMembers({ 
        id: callId, 
        type: event.call?.type || 'default'
      });
      
      const activeMembers = (remainingParticipants as any).members || [];
      
      console.log('Remaining participants after regular user left:', activeMembers.length);
      
      if (activeMembers.length === 0) {
        // No one left in the call, end the room
        console.log('No participants remaining, ending study group room');
        await endStudyGroupRoom(callId);
      }
    }
    
    // Check if this was the host leaving (for compete rooms)
    const competeRoom = await prisma.competeRoom.findFirst({
      where: { callId, ended: false }
    });

    if (competeRoom && competeRoom.hostId === userId) {
      console.log('Compete room host left the call:', userId);
      
      // Check if there are still other participants in the call
      const remainingParticipants = await client.video.queryCallMembers({ 
        id: callId, 
        type: event.call?.type || 'default'
      });
      
      const activeMembers = (remainingParticipants as any).members?.filter((m: any) => 
        (m.user_id || m.user?.id) !== userId
      ) || [];
      
      console.log('Remaining participants after compete host left:', activeMembers.length);
      
      if (activeMembers.length === 0) {
        // No one left in the call, end the room
        console.log('No participants remaining, ending compete room');
        await endCompeteRoom(callId);
      } else {
        console.log('Other participants still in call, compete room remains active');
      }
    } else if (competeRoom) {
      // Regular participant left, check if call is now empty
      const remainingParticipants = await client.video.queryCallMembers({ 
        id: callId, 
        type: event.call?.type || 'default'
      });
      
      const activeMembers = (remainingParticipants as any).members || [];
      
      console.log('Remaining participants after regular user left compete room:', activeMembers.length);
      
      if (activeMembers.length === 0) {
        // No one left in the call, end the room
        console.log('No participants remaining, ending compete room');
        await endCompeteRoom(callId);
      }
    }
  } catch (error) {
    console.error('Error handling participant left event:', error);
  }
}

async function handleSessionEnded(event: any, client: StreamClient) {
  try {
    const callId = event.call?.id || event.call_cid?.split(':')[1];
    
    if (!callId) {
      console.log('No callId found in session ended event');
      return;
    }
    
    console.log('Call session ended:', callId);
    
    // Check if this is a study group room (don't filter by ended status)
    const studyGroupRoom = await prisma.studyGroupRoom.findFirst({
      where: { callId }
    });
    
    if (studyGroupRoom) {
      console.log('Found study group room to end:', studyGroupRoom.roomName, 'ended:', studyGroupRoom.ended);
      
      // End the room if it's not already ended
      if (!studyGroupRoom.ended) {
        console.log('Ending study group room:', callId);
        await endStudyGroupRoom(callId);
      } else {
        console.log('Room already ended, skipping');
      }
    } else {
      console.log('No study group room found for callId:', callId);
    }
    
    // Check if this is a compete room (don't filter by ended status)
    const competeRoom = await prisma.competeRoom.findFirst({
      where: { callId }
    });
    
    if (competeRoom) {
      console.log('Found compete room to end:', competeRoom.roomName, 'ended:', competeRoom.ended);
      
      // End the room if it's not already ended
      if (!competeRoom.ended) {
        console.log('Ending compete room:', callId);
        await endCompeteRoom(callId);
      } else {
        console.log('Compete room already ended, skipping');
      }
    } else {
      console.log('No compete room found for callId:', callId);
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
    
    // End all active study sessions for this call
    const activeSessions = await prisma.studySession.findMany({
      where: { 
        callId,
        leftAt: null 
      },
    });

    console.log('Ending', activeSessions.length, 'active study sessions for call:', callId);

    for (const session of activeSessions) {
      const durationSeconds = Math.floor(
        (new Date().getTime() - session.joinedAt.getTime()) / 1000
      );
      
      await updateStudySessionWithStreamDuration(
        session.userId,
        callId,
        durationSeconds // Pass seconds directly
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
      console.log('No callId found in call ended event');
      return;
    }
    
    console.log('Call ended:', callId);
    
    // Check if this is a study group room (don't filter by ended status)
    const studyGroupRoom = await prisma.studyGroupRoom.findFirst({
      where: { callId }
    });
    
    if (studyGroupRoom) {
      console.log('Found study group room to end:', studyGroupRoom.roomName, 'ended:', studyGroupRoom.ended);
      
      // End the room if it's not already ended
      if (!studyGroupRoom.ended) {
        console.log('Ending study group room:', callId);
        await endStudyGroupRoom(callId);
      } else {
        console.log('Room already ended, skipping');
      }
    } else {
      console.log('No study group room found for callId:', callId);
    }
    
    // Check if this is a compete room (don't filter by ended status)
    const competeRoom = await prisma.competeRoom.findFirst({
      where: { callId }
    });
    
    if (competeRoom) {
      console.log('Found compete room to end:', competeRoom.roomName, 'ended:', competeRoom.ended);
      
      // End the room if it's not already ended
      if (!competeRoom.ended) {
        console.log('Ending compete room:', callId);
        await endCompeteRoom(callId);
      } else {
        console.log('Compete room already ended, skipping');
      }
    } else {
      console.log('No compete room found for callId:', callId);
    }
    
    // End all active study sessions for this call
    const activeSessions = await prisma.studySession.findMany({
      where: { 
        callId,
        leftAt: null 
      },
    });

    console.log('Ending', activeSessions.length, 'active study sessions for call:', callId);

    for (const session of activeSessions) {
      const durationSeconds = Math.floor(
        (new Date().getTime() - session.joinedAt.getTime()) / 1000
      );
      
      await updateStudySessionWithStreamDuration(
        session.userId,
        callId,
        durationSeconds // Pass seconds directly
      );
    }
  } catch (error) {
    console.error('Error handling call ended event:', error);
  }
} 