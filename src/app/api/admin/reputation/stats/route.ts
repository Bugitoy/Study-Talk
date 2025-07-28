import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getUserInfoOptimized } from '@/lib/db-utils';

export async function GET(req: NextRequest) {
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

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get flagged users
    const flaggedUsers = await prisma.user.count({
      where: { isFlagged: true },
    });

    // Get suspicious users (bot probability > 50)
    const suspiciousUsers = await prisma.user.count({
      where: { botProbability: { gt: 50 } },
    });

    // Get average reputation
    const avgReputationResult = await prisma.user.aggregate({
      _avg: { reputationScore: true },
    });
    const averageReputation = avgReputationResult._avg.reputationScore || 0;

    // Calculate bot detection rate
    const botDetectionRate = totalUsers > 0 ? Math.round((suspiciousUsers / totalUsers) * 100) : 0;

    return NextResponse.json({
      totalUsers,
      flaggedUsers,
      suspiciousUsers,
      averageReputation,
      botDetectionRate,
    });
  } catch (error) {
    console.error('Error fetching reputation stats:', error);
    return NextResponse.json({ error: 'Failed to fetch reputation stats' }, { status: 500 });
  }
} 