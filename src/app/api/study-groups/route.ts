import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import { createStudyGroupRoom, listActiveStudyGroupRooms, endStudyGroupRoom } from '@/lib/db-utils';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function GET() {
  try {
    const rooms = await listActiveStudyGroupRooms();
    if (!apiKey || !apiSecret) {
      return NextResponse.json([], { status: 200 });
    }
    const client = new StreamClient(apiKey, apiSecret);
    const ids = rooms.map(r => r.callId);
    if (ids.length === 0) return NextResponse.json([]);
    const { calls } = await client.video.queryCalls({
      filter_conditions: { id: { $in: ids } },
      limit: ids.length,
    });
    const results: any[] = [];
    for (const c of calls) {
      const callId = c.call.id as string;
      const room = rooms.find(r => r.callId === callId);
      if (!room) continue;
      const membersResp = await client.video.queryCallMembers({ id: callId, type: c.call.type });
      const members: any[] = (membersResp as any).members || [];
      const hostPresent = members.some(m => (m.user_id || m.user?.id) === room.hostId);
      if (c.call.ended_at || members.length === 0 || !hostPresent) {
        await endStudyGroupRoom(callId);
        continue;
      }
      results.push({
        callId,
        roomName: room.roomName,
        members: members.map((m: any) => {
          const u: any = m.user || {};
          return u.image || m.image || u.avatar || u.photo || null;
        }),
      });
    }
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error listing study group rooms:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { callId, roomName, hostId } = await req.json();
    if (!callId || !roomName || !hostId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const room = await createStudyGroupRoom({ callId, roomName, hostId });
    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating study group room:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}