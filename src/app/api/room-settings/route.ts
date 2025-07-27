import { NextRequest, NextResponse } from 'next/server';
import { createRoomSetting } from '@/lib/db-utils';
import { createRateLimit, ROOM_CREATION_RATE_LIMIT } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Apply server-side rate limiting
  const rateLimit = createRateLimit(ROOM_CREATION_RATE_LIMIT);
  const rateLimitResult = rateLimit(req);
  
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  try {
    const data = await req.json();
    
    // Log room creation attempt for security monitoring
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Room settings creation attempt: IP=${clientIP}, data=${JSON.stringify(data)}`);
    
    // Remove any callId from the data to prevent conflicts (callId should only be set via PUT later)
    const { callId, ...cleanData } = data;
    
    if (callId) {
      console.warn('⚠️ callId was included in POST request and has been removed:', callId);
    }
    
    const setting = await createRoomSetting(cleanData);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error creating room setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}