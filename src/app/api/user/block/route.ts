import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, action, reason, blockedBy } = await req.json();

    if (!userId || !action || !reason || !blockedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['block', 'unblock'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const isBlocked = action === 'block';
    
    if (isBlocked) {
      console.log('Blocking user in database:', userId);
    } else {
      console.log('Unblocking user in database:', userId);
    }

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isBlocked 
      },
    });

    // Create or update user report record
    if (isBlocked) {
      await prisma.userReport.create({
        data: {
          userId,
          isBlocked: true,
          blockedAt: new Date(),
          blockedBy,
          blockReason: reason,
        },
      });
    } else {
      // Update existing report to mark as unblocked
      await prisma.userReport.updateMany({
        where: { 
          userId,
          isBlocked: true 
        },
        data: {
          isBlocked: false,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${action === 'block' ? 'blocked' : 'unblocked'} successfully` 
    });
  } catch (error) {
    console.error('Error updating user block status:', error);
    return NextResponse.json({ error: 'Failed to update user block status' }, { status: 500 });
  }
} 