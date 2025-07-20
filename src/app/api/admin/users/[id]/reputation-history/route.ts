import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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