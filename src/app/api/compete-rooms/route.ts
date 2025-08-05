import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import { 
  createCompeteRoom, 
  listActiveCompeteRooms, 
  listActiveCompeteRoomsOptimized,
  getCompeteRoomByCallId,
  endCompeteRoom 
} from '@/lib/db-utils';
import prisma from '@/db/prisma';
import { createRateLimit, COMPETE_ROOMS_RATE_LIMIT } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/security-utils';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

// Shared cache for room listings (can be invalidated by webhooks)
const roomCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 1000; // 5 seconds for more real-time updates

export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = createRateLimit(COMPETE_ROOMS_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    
    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `compete-rooms-${page}-${limit}-${search}`;
    const cached = roomCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        cacheTimestamp: cached.timestamp
      });
    }

    // 🚀 Use optimized database query with pagination and search
    const { rooms, pagination } = await listActiveCompeteRoomsOptimized({
      page,
      limit,
      search
    });

    console.log('Active rooms from database:', rooms.length, rooms.map(r => r.roomName));
    
    if (!apiKey || !apiSecret) {
      const emptyResult = {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
      
      roomCache.set(cacheKey, {
        data: emptyResult,
        timestamp: Date.now()
      });
      
      return NextResponse.json({
        ...emptyResult,
        cached: false,
        cacheTimestamp: Date.now()
      });
    }
    
    const client = new StreamClient(apiKey, apiSecret);
    const ids = rooms.map(r => r.callId);
    
    if (ids.length === 0) {
      const result = {
        data: [],
        pagination
      };
      
      roomCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return NextResponse.json({
        ...result,
        cached: false,
        cacheTimestamp: Date.now()
      });
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
      
      // 🚀 Use optimized database check
      const dbRoom = await getCompeteRoomByCallId(callId);
      
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
      
      // Check participant limit - get room settings to see if there's a limit
      const roomSettings = await prisma.roomSetting.findFirst({
        where: { callId }
      });
      
      // If room has a participant limit and has reached it, skip this room
      if (roomSettings?.participants && roomSettings.participants !== null) {
        const currentParticipants = members.length;
        const participantLimit = roomSettings.participants;
        
        console.log(`Room ${room.roomName} (${callId}): current=${currentParticipants}, limit=${participantLimit}`);
        
        if (currentParticipants >= participantLimit) {
          console.log(`Room ${room.roomName} (${callId}) has reached participant limit (${currentParticipants}/${participantLimit}), skipping`);
          continue;
        }
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

    // 🚀 Search and pagination already handled by database query
    const result = {
      data: results,
      pagination
    };

    // Cache the result
    roomCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // Clean up old cache entries (older than 2 minutes)
    const now = Date.now();
    for (const [key, value] of Array.from(roomCache.entries())) {
      if (now - value.timestamp > 2 * 60 * 1000) {
        roomCache.delete(key);
      }
    }

    console.log(`Returning ${results.length} active compete rooms (page ${page} of ${pagination.totalPages})`);
    
    return NextResponse.json({
      ...result,
      cached: false,
      cacheTimestamp: Date.now()
    });
  } catch (error) {
    console.error('Error listing compete rooms:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = createRateLimit(COMPETE_ROOMS_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { callId, roomName, hostId } = await req.json();
    
    // Input validation
    if (!callId || !roomName || !hostId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedRoomName = sanitizeInput(roomName);

    // Content length validation
    if (sanitizedRoomName.length > 100) {
      return NextResponse.json({ error: 'Room name too long (max 100 characters)' }, { status: 400 });
    }

    if (sanitizedRoomName.trim().length === 0) {
      return NextResponse.json({ error: 'Room name cannot be empty' }, { status: 400 });
    }

    // Clear cache when new room is created
    roomCache.clear();
    
    const room = await createCompeteRoom({ 
      callId, 
      roomName: sanitizedRoomName, 
      hostId 
    });
    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating compete room:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
} 