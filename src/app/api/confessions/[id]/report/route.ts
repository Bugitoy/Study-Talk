import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/db/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason, reportType } = await req.json();
    const { id: confessionId } = await params;
    
    if (!reason || !reportType || !confessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the confession to get the author ID
    const confession = await prisma.confession.findUnique({
      where: { id: confessionId },
      select: { authorId: true }
    });

    if (!confession) {
      return NextResponse.json({ error: 'Confession not found' }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id, // Use authenticated user ID
        reportedId: confession.authorId,
        confessionId,
        reason,
        reportType,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error handling confession report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
} 