import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import prisma from '@/db/prisma';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const { userId, unblockedBy } = await req.json();

    if (!userId || !unblockedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = new StreamClient(apiKey!, apiSecret!);

    // Unblock user in Stream.io
    await client.video.unblockUser(userId);

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