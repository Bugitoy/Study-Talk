import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import { startStudySession, updateStudySessionWithStreamDuration } from '@/lib/db-utils';
import prisma from '@/db/prisma';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Stream webhook received:', body);

    const { event } = body;
    
    if (!event) {
      return NextResponse.json({ error: 'No event data' }, { status: 400 });
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
      default:
        console.log('Unhandled Stream event type:', event.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Stream webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

async function handleSessionStarted(event: any, client: StreamClient) {
  try {
    const { call } = event;
    const callId = call.id;
    
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

async function handleParticipantJoined(event: any, client: StreamClient) {
  try {
    const { call, participant } = event;
    const callId = call.id;
    const userId = participant.user?.id || participant.user_id;
    
    if (userId) {
      console.log('Participant joined:', userId, 'in call:', callId);
      
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
    }
  } catch (error) {
    console.error('Error handling participant joined event:', error);
  }
}

async function handleParticipantLeft(event: any, client: StreamClient) {
  try {
    const { call, participant } = event;
    const callId = call.id;
    const userId = participant.user?.id || participant.user_id;
    
    if (userId) {
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
        const duration = Math.floor(
          (new Date().getTime() - participantRecord.joinedAt.getTime()) / (1000 * 60)
        );
        
        await updateStudySessionWithStreamDuration(userId, callId, duration * 60); // Convert to seconds
      }
    }
  } catch (error) {
    console.error('Error handling participant left event:', error);
  }
}

async function handleSessionEnded(event: any, client: StreamClient) {
  try {
    const { call } = event;
    const callId = call.id;
    
    console.log('Call session ended:', callId);
    
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

    for (const session of activeSessions) {
      const duration = Math.floor(
        (new Date().getTime() - session.joinedAt.getTime()) / (1000 * 60)
      );
      
      await updateStudySessionWithStreamDuration(
        session.userId,
        callId,
        duration * 60 // Convert to seconds
      );
    }
  } catch (error) {
    console.error('Error handling session ended event:', error);
  }
}

async function handleCallEnded(event: any, client: StreamClient) {
  try {
    const { call } = event;
    const callId = call.id;
    
    console.log('Call ended:', callId);
    
    // End all active study sessions for this call
    const activeSessions = await prisma.studySession.findMany({
      where: { 
        callId,
        leftAt: null 
      },
    });

    for (const session of activeSessions) {
      const duration = Math.floor(
        (new Date().getTime() - session.joinedAt.getTime()) / (1000 * 60)
      );
      
      await updateStudySessionWithStreamDuration(
        session.userId,
        callId,
        duration * 60 // Convert to seconds
      );
    }
  } catch (error) {
    console.error('Error handling call ended event:', error);
  }
} 