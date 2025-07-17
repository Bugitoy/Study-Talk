import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, adminNotes, resolvedBy } = await req.json();
    const reportId = params.id;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes,
        resolvedBy,
        resolvedAt: status === 'RESOLVED' || status === 'DISMISSED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 });
  }
} 