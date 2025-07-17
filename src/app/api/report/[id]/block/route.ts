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

    // Use the global block API
    const blockRes = await fetch(`${req.nextUrl.origin}/api/user/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: report.reportedId,
        reason: `Blocked due to report: ${report.reason}`,
        blockedBy: 'admin'
      }),
    });

    if (!blockRes.ok) {
      return NextResponse.json({ error: 'Failed to block user globally' }, { status: 500 });
    }

    // Update the report status to resolved
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        adminNotes: 'User blocked globally due to this report',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
} 