import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getUserInfoOptimized } from '@/lib/db-utils';

export async function GET(
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

    const reputationHistory = await prisma.reputationHistory.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 entries
      select: {
        id: true,
        changeType: true,
        changeAmount: true,
        reason: true,
        createdAt: true,
      },
    });

    return NextResponse.json(reputationHistory);
  } catch (error) {
    console.error('Error fetching reputation history:', error);
    return NextResponse.json({ error: 'Failed to fetch reputation history' }, { status: 500 });
  }
} 