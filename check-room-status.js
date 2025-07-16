const { PrismaClient } = require('@prisma/client');
const { StreamClient } = require('@stream-io/node-sdk');

const prisma = new PrismaClient();
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || 'zqpj4vdp5p95';
const apiSecret = process.env.STREAM_SECRET_KEY;

async function checkRoomStatus() {
  try {
    const callId = '8df874f6-a316-430d-b64e-72bd9eb18a22';
    
    console.log('Checking room status for:', callId);
    
    // Check database
    const dbRoom = await prisma.studyGroupRoom.findFirst({
      where: { callId }
    });
    
    if (dbRoom) {
      console.log('Database room:', {
        id: dbRoom.id,
        callId: dbRoom.callId,
        roomName: dbRoom.roomName,
        hostId: dbRoom.hostId,
        ended: dbRoom.ended
      });
    } else {
      console.log('No room found in database for callId:', callId);
    }
    
    // Check Stream API
    const client = new StreamClient(apiKey, apiSecret);
    const { calls } = await client.video.queryCalls({
      filter_conditions: { id: callId },
      limit: 1,
    });
    
    if (calls.length === 0) {
      console.log('Call not found in Stream API');
      return;
    }
    
    const call = calls[0];
    console.log('Stream call details:', {
      id: call.call.id,
      ended_at: call.call.ended_at,
      created_by: call.call.created_by?.id,
      custom: call.call.custom
    });
    
    // Get call members
    const membersResp = await client.video.queryCallMembers({ 
      id: callId, 
      type: call.call.type 
    });
    
    const members = membersResp.members || [];
    console.log('Stream members:', members.map(m => ({
      user_id: m.user_id || m.user?.id,
      user_name: m.user?.name,
      joined_at: m.joined_at
    })));
    
    console.log('Member count from Stream:', members.length);
    
    // Check if call is ended
    if (call.call.ended_at) {
      console.log('Call is ended at:', call.call.ended_at);
    } else {
      console.log('Call is not ended');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoomStatus(); 