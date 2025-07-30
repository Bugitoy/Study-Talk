import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/db/prisma';
import { getDailyStudyTime } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, callId } = await req.json();

    if (!userId || !callId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate that the requesting user matches the session
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Perform all access checks in parallel
    const [userBlock, roomBan, roomSettings, userInfo] = await Promise.all([
      // Check if user is globally blocked
      prisma.user.findUnique({
        where: { id: userId },
        select: { isBlocked: true, plan: true }
      }),
      
      // Check if user is banned from this specific room
      prisma.roomBan.findFirst({
        where: {
          userId: userId,
          callId: callId
        }
      }),
      
      // Get room settings for additional checks
      prisma.roomSetting.findFirst({
        where: { callId: callId },
        select: { 
          id: true,
          roomName: true,
          mic: true,
          camera: true,
          availability: true,
          participants: true  // Include participants for limit checking
        }
      }),
      
      // Get user info for plan checking
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, plan: true }
      })
    ]);

    // Check daily study time limit for free and plus users
    let hasReachedDailyLimit = false;
    if (userInfo?.plan === 'free' || userInfo?.plan === 'plus') {
      const dailyStudyTime = await getDailyStudyTime(userId);
      if (userInfo?.plan === 'free') {
        hasReachedDailyLimit = dailyStudyTime >= 3; // 3 hours limit for free users
      } else if (userInfo?.plan === 'plus') {
        hasReachedDailyLimit = dailyStudyTime >= 15; // 15 hours limit for plus users
      }
    }

    // Determine access based on all checks
    const isBlocked = userBlock?.isBlocked || false;
    const isBanned = !!roomBan;
    
    // Check participant limit if room has one
    let isRoomFull = false;
    if (roomSettings?.participants && roomSettings.participants !== null) {
      // Get current participant count from CallParticipant table
      const currentParticipants = await prisma.callParticipant.count({
        where: {
          callId: callId,
          isActive: true
        }
      });
      
      if (currentParticipants >= roomSettings.participants) {
        isRoomFull = true;
      }
    }
    
    const hasAccess = !isBlocked && !isBanned && !isRoomFull && !hasReachedDailyLimit;

    return NextResponse.json({
      hasAccess,
      isBlocked,
      isBanned,
      isRoomFull,
      hasReachedDailyLimit,
      userPlan: userInfo?.plan,
      roomSettings,
      userId,
      callId
    });

  } catch (error) {
    console.error('Error checking access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 