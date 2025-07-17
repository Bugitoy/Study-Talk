import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, reason, blockedBy } = await req.json();

    if (!userId || !reason || !blockedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Note: Stream.io doesn't have a direct blockUser method in the video namespace
    // We'll rely on our database blocking and webhook enforcement
    console.log('Blocking user in database:', userId);

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isBlocked: true 
      },
    });

    // Create user report record
    await prisma.userReport.create({
      data: {
        userId,
        isBlocked: true,
        blockedAt: new Date(),
        blockedBy,
        blockReason: reason,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
} 