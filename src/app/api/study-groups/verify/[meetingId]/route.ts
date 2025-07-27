import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/db/prisma';

// Logging utility
const logSecurityEvent = (event: string, details: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, {
    ...details,
    timestamp,
    environment: process.env.NODE_ENV
  });
};

const logPerformanceEvent = (event: string, duration: number, details: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[PERFORMANCE] ${timestamp} - ${event} (${duration}ms):`, {
    ...details,
    timestamp,
    duration,
    environment: process.env.NODE_ENV
  });
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const startTime = Date.now();
  
  try {
    // Get user session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', {
        meetingId: await params.then(p => p.meetingId),
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params to get meetingId
    const { meetingId } = await params;

    logSecurityEvent('MEETING_VERIFICATION_ATTEMPT', {
      meetingId,
      userId: user.id,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });

    // Validate meeting ID format
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(meetingId)) {
      logSecurityEvent('INVALID_MEETING_ID_FORMAT', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'Invalid meeting ID format' }, { status: 400 });
    }

    // Check if user is blocked
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isBlocked: true }
    });

    if (userRecord?.isBlocked) {
      logSecurityEvent('BLOCKED_USER_ATTEMPT', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'User is blocked' }, { status: 403 });
    }

    // Check if meeting exists and is active
    const meeting = await prisma.callSession.findFirst({
      where: {
        callId: meetingId,
        isActive: true
      },
      select: {
        id: true,
        callId: true,
        sessionStartedAt: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!meeting) {
      logSecurityEvent('MEETING_NOT_FOUND', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'Meeting not found or inactive' }, { status: 404 });
    }

    // Check if meeting is not too old (optional security measure)
    const meetingAge = Date.now() - meeting.createdAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (meetingAge > maxAge) {
      logSecurityEvent('EXPIRED_MEETING_ATTEMPT', {
        meetingId,
        userId: user.id,
        meetingAge: Math.round(meetingAge / (1000 * 60 * 60)) // hours
      });
      return NextResponse.json({ error: 'Meeting has expired' }, { status: 410 });
    }

    // Check if user is banned from this specific room
    const roomBan = await prisma.roomBan.findFirst({
      where: {
        userId: user.id,
        callId: meetingId
      }
    });

    if (roomBan) {
      logSecurityEvent('BANNED_USER_ROOM_ATTEMPT', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'You are banned from this room' }, { status: 403 });
    }

    const duration = Date.now() - startTime;
    logPerformanceEvent('MEETING_VERIFICATION_SUCCESS', duration, {
      meetingId,
      userId: user.id
    });

    // Meeting is valid and accessible
    return NextResponse.json({
      meetingId: meeting.callId,
      sessionStartedAt: meeting.sessionStartedAt,
      isActive: meeting.isActive
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logSecurityEvent('MEETING_VERIFICATION_ERROR', {
      meetingId: await params.then(p => p.meetingId).catch(() => 'unknown'),
      userId: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.error('Error verifying meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 