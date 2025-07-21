import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await prisma.confessionComment.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to last 10 comments
      include: {
        confession: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return NextResponse.json({ error: 'Failed to fetch user comments' }, { status: 500 });
  }
} 