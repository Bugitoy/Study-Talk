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