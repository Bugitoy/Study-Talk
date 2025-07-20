import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { reporterId, reportedId, reason, reportType } = await req.json();
    
    if (!reporterId || !reportedId || !reason || !reportType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId,
        reason,
        reportType,
        // For Talk reports, we don't have a callId, so we'll use a special identifier
        callId: 'TALK_CONVERSATION',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error handling Talk report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
} 