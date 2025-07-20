import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    if (!action || !['flag', 'unflag'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const isFlagged = action === 'flag';

    const user = await prisma.user.update({
      where: { id },
      data: { isFlagged },
      select: {
        id: true,
        name: true,
        email: true,
        isFlagged: true,
      },
    });

    // Log the action
    await prisma.reputationHistory.create({
      data: {
        userId: id,
        changeType: 'MANUAL',
        changeAmount: isFlagged ? -50 : 50,
        reason: `User ${isFlagged ? 'flagged' : 'unflagged'} by admin`,
        previousScore: 0, // We'll calculate this properly
        newScore: 0,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: `User ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
    });
  } catch (error) {
    console.error('Error updating user flag:', error);
    return NextResponse.json({ error: 'Failed to update user flag' }, { status: 500 });
  }
} 