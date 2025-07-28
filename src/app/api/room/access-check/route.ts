import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/db/prisma';

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
    const [userBlock, roomBan, roomSettings] = await Promise.all([
      // Check if user is globally blocked
      prisma.user.findUnique({
        where: { id: userId },
        select: { isBlocked: true }
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
          availability: true
        }
      })
    ]);

    // Determine access based on all checks
    const isBlocked = userBlock?.isBlocked || false;
    const isBanned = !!roomBan;
    const hasAccess = !isBlocked && !isBanned;

    return NextResponse.json({
      hasAccess,
      isBlocked,
      isBanned,
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