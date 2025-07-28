import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getUserInfoOptimized } from '@/lib/db-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const userInfo = await getUserInfoOptimized(user.id);
    if (!userInfo?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!action || !['flag', 'unflag'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const isFlagged = action === 'flag';

    const userToUpdate = await prisma.user.update({
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
      user: userToUpdate,
      message: `User ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
    });
  } catch (error) {
    console.error('Error updating user flag:', error);
    return NextResponse.json({ error: 'Failed to update user flag' }, { status: 500 });
  }
} 