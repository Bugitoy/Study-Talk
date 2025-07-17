import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const callId = searchParams.get('callId');

    if (!userId || !callId) {
      return NextResponse.json({ error: 'Missing userId or callId' }, { status: 400 });
    }

    // Check if user is banned from this specific room
    const roomBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });

    return NextResponse.json({ 
      isBanned: !!roomBan,
      banDetails: roomBan ? {
        reason: roomBan.reason,
        bannedAt: roomBan.bannedAt,
        hostId: roomBan.hostId
      } : null
    });
  } catch (error) {
    console.error('Error checking ban status:', error);
    return NextResponse.json({ error: 'Failed to check ban status' }, { status: 500 });
  }
} 