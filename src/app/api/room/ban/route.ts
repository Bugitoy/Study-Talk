import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import prisma from '@/db/prisma';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const { userId, callId, hostId, reason } = await req.json();

    if (!userId || !callId || !hostId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is already banned from this room
    const existingBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });

    if (existingBan) {
      return NextResponse.json({ 
        success: true, 
        message: 'User is already banned from this room' 
      });
    }

    // Create room ban record
    await prisma.roomBan.create({
      data: {
        userId,
        callId,
        hostId,
        reason: reason || 'Banned by host',
        bannedAt: new Date(),
      },
    });

    // Immediately remove user from the call using Stream.io API
    try {
      const client = new StreamClient(apiKey!, apiSecret!);
      
      console.log('Removing banned user from call immediately:', { userId, callId });
      
      // First, try to remove the user from call members
      const removeResult = await client.video.updateCallMembers({
        id: callId,
        type: 'default',
        remove_members: [userId],
      });
      
      console.log('Stream.io API response for immediate removal:', removeResult);
      
      // Wait a moment for the removal to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the user was actually removed
      const membersAfterRemoval = await client.video.queryCallMembers({
        id: callId,
        type: 'default'
      });
      
      const userStillInCall = (membersAfterRemoval.members || []).some((m: any) => 
        (m.user_id || m.user?.id) === userId
      );
      
      console.log('User still in call after immediate removal:', userStillInCall);
      
      if (userStillInCall) {
        console.log('User still in call, but not ending the call session to avoid removing all users');
        // Don't end the call session as it would remove all users
        // The webhook will handle removal when the user tries to rejoin
        console.log('User removal may not be immediate - webhook will handle future joins');
      } else {
        console.log('Successfully removed banned user from call immediately:', userId);
        
        // Now trigger a call end for the specific user by updating the call state
        // This will force the user's client to disconnect
        try {
          console.log('Triggering call end for banned user by updating call state');
          await client.video.updateCall({
            id: callId,
            type: 'default',
            custom: {
              forceUserDisconnect: userId,
              disconnectTimestamp: Date.now(),
              disconnectReason: 'banned'
            }
          });
          console.log('Successfully triggered call end for banned user');
        } catch (updateError) {
          console.error('Failed to trigger call end for banned user:', updateError);
        }
      }
      
      // Also call the force remove endpoint as a backup
      try {
        const forceRemoveRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/api/room/force-remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, callId }),
        });
        
        if (forceRemoveRes.ok) {
          const forceRemoveData = await forceRemoveRes.json();
          console.log('Force remove backup response:', forceRemoveData);
        }
      } catch (forceRemoveError) {
        console.error('Failed to call force remove backup:', forceRemoveError);
      }
    } catch (removeError) {
      console.error('Failed to immediately remove banned user from call:', removeError);
      console.error('Error details:', {
        message: (removeError as any).message,
        code: (removeError as any).code,
        status: (removeError as any).status,
        response: (removeError as any).response
      });
      // Continue with the ban even if immediate removal fails
      // The webhook will handle removal when the user tries to rejoin
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error banning user from room:', error);
    return NextResponse.json({ error: 'Failed to ban user from room' }, { status: 500 });
  }
} 