import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get basic stats
    const totalUsers = await prisma.user.count();
    const flaggedUsers = await prisma.user.count({ where: { isFlagged: true } });
    const suspiciousUsers = await prisma.user.count({ where: { botProbability: { gt: 50 } } });
    
    // Get average reputation
    const avgReputationResult = await prisma.user.aggregate({
      _avg: { reputationScore: true },
    });
    const averageReputation = avgReputationResult._avg.reputationScore || 0;

    // Calculate bot detection rate
    const botDetectionRate = totalUsers > 0 ? Math.round((suspiciousUsers / totalUsers) * 100) : 0;

    // Get reputation distribution
    const reputationDistribution = await Promise.all([
      prisma.user.count({ where: { reputationScore: { gte: 800 } } }), // Legendary
      prisma.user.count({ where: { reputationScore: { gte: 600, lt: 800 } } }), // Expert
      prisma.user.count({ where: { reputationScore: { gte: 400, lt: 600 } } }), // Trusted
      prisma.user.count({ where: { reputationScore: { gte: 200, lt: 400 } } }), // Active
      prisma.user.count({ where: { reputationScore: { gte: 100, lt: 200 } } }), // Regular
      prisma.user.count({ where: { reputationScore: { lt: 100 } } }), // New
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentActivity = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }), // New users
      prisma.user.count({ where: { isFlagged: true, updatedAt: { gte: sevenDaysAgo } } }), // Flagged users
      prisma.reputationHistory.count({ where: { createdAt: { gte: sevenDaysAgo } } }), // Reputation changes
    ]);

    return NextResponse.json({
      totalUsers,
      flaggedUsers,
      suspiciousUsers,
      averageReputation,
      botDetectionRate,
      reputationDistribution: {
        legendary: reputationDistribution[0],
        expert: reputationDistribution[1],
        trusted: reputationDistribution[2],
        active: reputationDistribution[3],
        regular: reputationDistribution[4],
        new: reputationDistribution[5],
      },
      recentActivity: {
        newUsers: recentActivity[0],
        flaggedUsers: recentActivity[1],
        reputationChanges: recentActivity[2],
      },
    });
  } catch (error) {
    console.error('Error fetching reputation analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch reputation analytics' }, { status: 500 });
  }
} 