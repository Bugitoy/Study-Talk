import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('callId');
    const userId = searchParams.get('userId');

    if (!callId || !userId) {
      return NextResponse.json({ error: 'Missing callId or userId parameter' }, { status: 400 });
    }

    const client = new StreamClient(apiKey!, apiSecret!);
    
    // Query call members from Stream.io
    const membersResp = await client.video.queryCallMembers({
      id: callId,
      type: 'default'
    });

    const members = membersResp.members || [];
    const isInCall = members.some((m: any) => 
      (m.user_id || m.user?.id) === userId
    );

    return NextResponse.json({ 
      isInCall,
      memberCount: members.length,
      members: members.map((m: any) => ({
        userId: m.user_id || m.user?.id,
        userName: m.user?.name
      }))
    });
  } catch (error) {
    console.error('Error checking call membership:', error);
    return NextResponse.json({ error: 'Failed to check call membership' }, { status: 500 });
  }
} 