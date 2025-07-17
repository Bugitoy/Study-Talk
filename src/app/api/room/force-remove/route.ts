import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const { userId, callId } = await req.json();

    if (!userId || !callId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = new StreamClient(apiKey!, apiSecret!);
    
    console.log('Force removing user from call:', { userId, callId });
    
    // First, try to remove the user from call members
    const removeResult = await client.video.updateCallMembers({
      id: callId,
      type: 'default',
      remove_members: [userId],
    });
    
    console.log('Stream.io API response for force removal:', removeResult);
    
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
    
    console.log('User still in call after force removal:', userStillInCall);
    
    if (userStillInCall) {
      console.log('User still in call, but not ending the call session to avoid removing all users');
      // Don't end the call session as it would remove all users
      // Instead, just log that the user couldn't be removed immediately
      console.log('User removal may not be immediate - webhook will handle future joins');
    } else {
      console.log('Successfully force removed user from call:', userId);
      
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

    return NextResponse.json({ 
      success: true, 
      userRemoved: !userStillInCall,
      callEnded: false // Never end the call to avoid removing all users
    });
  } catch (error) {
    console.error('Error force removing user from call:', error);
    return NextResponse.json({ error: 'Failed to force remove user from call' }, { status: 500 });
  }
} 