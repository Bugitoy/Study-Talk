import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    
    // Get the report to find the reported user
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update the reported user to be blocked
    await prisma.user.update({
      where: { id: report.reportedId },
      data: { isBlocked: true },
    });

    // Update the report status to resolved
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        adminNotes: 'User blocked due to this report',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
} 