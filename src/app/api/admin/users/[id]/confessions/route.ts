import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const confessions = await prisma.confession.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to last 10 confessions
      include: {
        votes: {
          select: {
            id: true,
            voteType: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          take: 5, // Limit comments per confession
        },
      },
    });

    return NextResponse.json(confessions);
  } catch (error) {
    console.error('Error fetching user confessions:', error);
    return NextResponse.json({ error: 'Failed to fetch user confessions' }, { status: 500 });
  }
} 