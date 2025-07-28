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