import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, unblockedBy } = await req.json();

    if (!userId || !unblockedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Note: Stream.io doesn't have a direct unblockUser method in the video namespace
    // We'll rely on our database unblocking and webhook enforcement
    console.log('Unblocking user in database:', userId);

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isBlocked: false 
      },
    });

    // Update user report record
    await prisma.userReport.updateMany({
      where: { 
        userId,
        isBlocked: true 
      },
      data: {
        isBlocked: false,
        blockReason: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
  }
} 