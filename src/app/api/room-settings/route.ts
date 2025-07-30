import { NextRequest, NextResponse } from 'next/server';
import { createRoomSetting } from '@/lib/db-utils';
import { createRateLimit, ROOM_CREATION_RATE_LIMIT } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/security-utils';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function POST(req: NextRequest) {
  // 1. Authentication check
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Apply server-side rate limiting
  const rateLimit = createRateLimit(ROOM_CREATION_RATE_LIMIT);
  const rateLimitResult = rateLimit(req);
  
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  try {
    const data = await req.json();
    
    // Log room creation attempt for security monitoring
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Room settings creation attempt: IP=${clientIP}, userId=${user.id}, data=${JSON.stringify(data)}`);
    
    // 3. Input validation - check required fields
    if (!data.roomName || !data.numQuestions || !data.mic || !data.camera || data.participants === undefined || !data.availability) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. Input sanitization for room name
    const sanitizedRoomName = sanitizeInput(data.roomName);
    
    // 5. Server-side validation for room name
    if (!sanitizedRoomName.trim()) {
      return NextResponse.json({ error: 'Room name cannot be empty' }, { status: 400 });
    }
    
    if (sanitizedRoomName.length > 50) {
      return NextResponse.json({ error: 'Room name too long (max 50 characters)' }, { status: 400 });
    }
    
    if (sanitizedRoomName.length < 2) {
      return NextResponse.json({ error: 'Room name too short (min 2 characters)' }, { status: 400 });
    }

    // Check for excessive consecutive spaces
    if (sanitizedRoomName.includes('  ')) {
      return NextResponse.json({ error: 'Room name contains too many consecutive spaces' }, { status: 400 });
    }

    // Check for forbidden characters
    const forbiddenChars = /[<>\"'&]/g;
    if (forbiddenChars.test(sanitizedRoomName)) {
      return NextResponse.json({ error: 'Room name contains invalid characters' }, { status: 400 });
    }

    // Check if name contains only allowed characters
    const allowedChars = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
    if (!allowedChars.test(sanitizedRoomName)) {
      return NextResponse.json({ error: 'Room name contains unsupported characters' }, { status: 400 });
    }

    // Check for common inappropriate words (basic filter)
    const inappropriateWords = ['admin', 'moderator', 'system', 'test', 'temp', 'dummy'];
    const lowerValue = sanitizedRoomName.toLowerCase();
    if (inappropriateWords.some(word => lowerValue.includes(word))) {
      return NextResponse.json({ error: 'Room name contains inappropriate words' }, { status: 400 });
    }

    // 6. Validate numeric fields (even though they're from dropdowns, validate for security)
    if (typeof data.numQuestions !== 'number' || ![5, 10, 15, 20, 25, 30].includes(data.numQuestions)) {
      return NextResponse.json({ error: 'Invalid number of questions' }, { status: 400 });
    }

    // Validate participants - allow null for unlimited, or specific values for limited
    if (data.participants !== null && (typeof data.participants !== 'number' || ![5, 10, 15, 20, 25, 30].includes(data.participants))) {
      return NextResponse.json({ error: 'Invalid participant count' }, { status: 400 });
    }

    // Validate time per question (can be null for unlimited)
    if (data.timePerQuestion !== null && (typeof data.timePerQuestion !== 'number' || ![5, 10, 15, 20, 25, 30].includes(data.timePerQuestion))) {
      return NextResponse.json({ error: 'Invalid time per question' }, { status: 400 });
    }

    // Validate mic and camera settings
    const validSettings = ['on', 'off', 'flexible'];
    if (!validSettings.includes(data.mic)) {
      return NextResponse.json({ error: 'Invalid microphone setting' }, { status: 400 });
    }

    if (!validSettings.includes(data.camera)) {
      return NextResponse.json({ error: 'Invalid camera setting' }, { status: 400 });
    }

    // Validate availability
    const validAvailability = ['public', 'private'];
    if (!validAvailability.includes(data.availability)) {
      return NextResponse.json({ error: 'Invalid availability setting' }, { status: 400 });
    }
    
    // Remove any callId from the data to prevent conflicts (callId should only be set via PUT later)
    const { callId, ...cleanData } = data;
    
    if (callId) {
      console.warn('⚠️ callId was included in POST request and has been removed:', callId);
    }
    
    // 7. Use sanitized room name
    const validatedData = {
      ...cleanData,
      roomName: sanitizedRoomName
    };
    
    const setting = await createRoomSetting(validatedData);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error creating room setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}