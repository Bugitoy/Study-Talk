import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import { createCompeteRoom, listActiveCompeteRooms, endCompeteRoom } from '@/lib/db-utils';
import prisma from '@/db/prisma';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function GET() {
  try {
    const rooms = await listActiveCompeteRooms();
    console.log('Active rooms from database:', rooms.length, rooms.map(r => r.roomName));
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json([], { status: 200 });
    }
    
    const client = new StreamClient(apiKey, apiSecret);
    const ids = rooms.map(r => r.callId);
    
    if (ids.length === 0) {
      console.log('No room IDs to query, returning empty array');
      return NextResponse.json([]);
    }
    
    console.log('Call IDs to query:', ids);
    
    const { calls } = await client.video.queryCalls({
      filter_conditions: { id: { $in: ids } },
      limit: ids.length,
    });
    
    const results: any[] = [];
    for (const c of calls) {
      const callId = c.call.id as string;
      const room = rooms.find(r => r.callId === callId);
      if (!room) continue;
      
      // Double-check if the room is actually ended in the database
      const dbRoom = await prisma.competeRoom.findFirst({
        where: { callId }
      });
      
      console.log(`Database check for room ${room.roomName} (${callId}): ended=${dbRoom?.ended}, exists=${!!dbRoom}`);
      
      if (dbRoom && dbRoom.ended) {
        console.log(`Room ${room.roomName} (${callId}) is already ended in database, skipping`);
        continue;
      }
      
      const membersResp = await client.video.queryCallMembers({ id: callId, type: c.call.type });
      const members: any[] = (membersResp as any).members || [];
      const hostPresent = members.some(m => (m.user_id || m.user?.id) === room.hostId);
      
      console.log(`Room ${room.roomName} (${callId}): members=${members.length}, hostPresent=${hostPresent}, ended_at=${c.call.ended_at}`);
      
      // Check if the call has ended in Stream.io or if there are no members
      if (c.call.ended_at || members.length === 0 || !hostPresent) {
        console.log(`Ending room ${room.roomName} (${callId}) due to: ended_at=${c.call.ended_at}, members=${members.length}, hostPresent=${hostPresent}`);
        await endCompeteRoom(callId);
        // Don't include this room in results since it should be ended
        continue;
      }
      
      // Additional check: if the call has been inactive for more than 5 minutes, end it
      const lastActivity = c.call.updated_at ? new Date(c.call.updated_at) : new Date();
      const now = new Date();
      const minutesSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (minutesSinceActivity > 5) {
        console.log(`Ending room ${room.roomName} (${callId}) due to inactivity: ${minutesSinceActivity.toFixed(1)} minutes`);
        await endCompeteRoom(callId);
        continue;
      }
      
      // Only include rooms that are active and have participants
      results.push({
        callId,
        roomName: room.roomName,
        members: members.map((m: any) => {
          const u: any = m.user || {};
          return u.image || m.image || u.avatar || u.photo || null;
        }),
      });
    }
    console.log(`Returning ${results.length} active compete rooms`);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error listing compete rooms:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { callId, roomName, hostId } = await req.json();
    if (!callId || !roomName || !hostId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const room = await createCompeteRoom({ callId, roomName, hostId });
    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating compete room:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
} 