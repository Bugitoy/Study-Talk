import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reporterId, reason, reportType } = await req.json();
    const confessionId = params.id;
    
    if (!reporterId || !reason || !reportType || !confessionId) {
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
        reporterId,
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