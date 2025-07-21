import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        reputationScore: true,
        activityScore: true,
        qualityScore: true,
        trustScore: true,
        botProbability: true,
        verificationLevel: true,
        isFlagged: true,
        isBlocked: true,
        reputationLevel: true,
        lastActivityAt: true,
        dailyConfessions: true,
        dailyVotes: true,
        dailyComments: true,
        confessionsCreated: true,
        votesCast: true,
        commentsCreated: true,
        confessions: {
          select: { id: true },
        },
        confessionVotes: {
          select: { id: true },
        },
        confessionComments: {
          select: { id: true },
        },
      },
      orderBy: {
        reputationScore: 'desc',
      },
    });

    const usersWithStats = users.map((user: any) => {
      return {
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        reputationScore: user.reputationScore,
        activityScore: user.activityScore,
        qualityScore: user.qualityScore,
        trustScore: user.trustScore,
        botProbability: user.botProbability,
        verificationLevel: user.verificationLevel,
        isFlagged: user.isFlagged,
        isBlocked: user.isBlocked,
        reputationLevel: user.reputationLevel || getReputationLevel(user.reputationScore),
        lastActivityAt: user.lastActivityAt?.toISOString() || null,
        confessionCount: user.confessions.length,
        voteCount: user.confessionVotes.length,
        commentCount: user.confessionComments.length,
        dailyConfessions: user.dailyConfessions,
        dailyVotes: user.dailyVotes,
        dailyComments: user.dailyComments,
        confessionsCreated: user.confessionsCreated,
        votesCast: user.votesCast,
        commentsCreated: user.commentsCreated,
      };
    });

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching user reputation data:', error);
    return NextResponse.json({ error: 'Failed to fetch user reputation data' }, { status: 500 });
  }
}

function getReputationLevel(reputationScore: number): string {
  if (reputationScore >= 800) return 'LEGENDARY';
  if (reputationScore >= 600) return 'EXPERT';
  if (reputationScore >= 400) return 'TRUSTED';
  if (reputationScore >= 200) return 'ACTIVE';
  if (reputationScore >= 100) return 'REGULAR';
  return 'NEW';
} 