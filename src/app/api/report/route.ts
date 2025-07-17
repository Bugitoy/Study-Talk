import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { reporterId, reportedId, callId, reason, reportType } = await req.json();
    if (!reporterId || !reportedId || !callId || !reason || !reportType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId,
        callId,
        reason,
        reportType,
      },
    });
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error handling report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = status && status !== 'ALL' ? { status: status as any } : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
} 