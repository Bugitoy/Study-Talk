import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, callId, hostId, reason } = await req.json();

    if (!userId || !callId || !hostId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is already banned from this room
    const existingBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });

    if (existingBan) {
      return NextResponse.json({ 
        success: true, 
        message: 'User is already banned from this room' 
      });
    }

    // Create room ban record
    await prisma.roomBan.create({
      data: {
        userId,
        callId,
        hostId,
        reason: reason || 'Banned by host',
        bannedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error banning user from room:', error);
    return NextResponse.json({ error: 'Failed to ban user from room' }, { status: 500 });
  }
} 