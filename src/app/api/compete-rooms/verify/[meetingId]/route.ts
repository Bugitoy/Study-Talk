import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/db/prisma';
import { createRateLimit, COMPETE_VERIFICATION_RATE_LIMIT } from '@/lib/rate-limit';
import { getDailyStudyTime } from '@/lib/db-utils';

// Logging utility for compete meetings
const logCompeteSecurityEvent = (event: string, details: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[COMPETE_SECURITY] ${timestamp} - ${event}:`, {
    ...details,
    timestamp,
    environment: process.env.NODE_ENV
  });
};

const logCompetePerformanceEvent = (event: string, duration: number, details: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[COMPETE_PERFORMANCE] ${timestamp} - ${event} (${duration}ms):`, {
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
    // Apply rate limiting
    const rateLimit = createRateLimit(COMPETE_VERIFICATION_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get user session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      logCompeteSecurityEvent('COMPETE_UNAUTHORIZED_ACCESS', {
        meetingId: await params.then(p => p.meetingId),
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params to get meetingId
    const { meetingId } = await params;

    logCompeteSecurityEvent('COMPETE_MEETING_VERIFICATION_ATTEMPT', {
      meetingId,
      userId: user.id,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    });

    // Validate meeting ID format (MongoDB ObjectId - 24 hex characters)
    const objectIdPattern = /^[0-9a-f]{24}$/i;
    if (!objectIdPattern.test(meetingId)) {
      logCompeteSecurityEvent('COMPETE_INVALID_MEETING_ID_FORMAT', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'Invalid meeting ID format' }, { status: 400 });
    }

    // Check if user is blocked and get plan info
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isBlocked: true, plan: true }
    });

    if (userRecord?.isBlocked) {
      logCompeteSecurityEvent('COMPETE_BLOCKED_USER_ATTEMPT', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'User is blocked' }, { status: 403 });
    }

    // Check daily study time limit for free and plus users
    if (userRecord?.plan === 'free' || userRecord?.plan === 'plus') {
      const dailyStudyTime = await getDailyStudyTime(user.id);
      if (userRecord?.plan === 'free' && dailyStudyTime >= 3) { // 3 hours limit for free users
        logCompeteSecurityEvent('COMPETE_DAILY_LIMIT_EXCEEDED', {
          meetingId,
          userId: user.id,
          dailyStudyTime,
          limit: 3,
          plan: 'free'
        });
        return NextResponse.json({ 
          error: 'Daily study limit reached. Free users can only study for 3 hours per day. Upgrade to Plus or Premium for more study time.' 
        }, { status: 403 });
      } else if (userRecord?.plan === 'plus' && dailyStudyTime >= 15) { // 15 hours limit for plus users
        logCompeteSecurityEvent('COMPETE_DAILY_LIMIT_EXCEEDED', {
          meetingId,
          userId: user.id,
          dailyStudyTime,
          limit: 15,
          plan: 'plus'
        });
        return NextResponse.json({ 
          error: 'Daily study limit reached. Plus users can only study for 15 hours per day. Upgrade to Premium for more study time.' 
        }, { status: 403 });
      }
    }

    // Check if compete meeting exists and is active
    const meeting = await prisma.callSession.findFirst({
      where: {
        callId: meetingId,
        isActive: true,
        // Add additional check for compete rooms if needed
        // roomType: 'compete' // Uncomment if you have room types
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
      logCompeteSecurityEvent('COMPETE_MEETING_NOT_FOUND', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'Meeting not found or inactive' }, { status: 404 });
    }

    // Check if meeting is not too old (optional security measure)
    const meetingAge = Date.now() - meeting.createdAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (meetingAge > maxAge) {
      logCompeteSecurityEvent('COMPETE_EXPIRED_MEETING_ATTEMPT', {
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
      logCompeteSecurityEvent('COMPETE_BANNED_USER_ROOM_ATTEMPT', {
        meetingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'You are banned from this room' }, { status: 403 });
    }

    const duration = Date.now() - startTime;
    logCompetePerformanceEvent('COMPETE_MEETING_VERIFICATION_SUCCESS', duration, {
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
    logCompeteSecurityEvent('COMPETE_MEETING_VERIFICATION_ERROR', {
      meetingId: await params.then(p => p.meetingId).catch(() => 'unknown'),
      userId: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.error('Error verifying compete meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 