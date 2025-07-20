import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { reporterId, reportedId, callId, confessionId, reason, reportType } = await req.json();
    if (!reporterId || !reportedId || !reason || !reportType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Either callId or confessionId must be provided
    if (!callId && !confessionId) {
      return NextResponse.json({ error: 'Either callId or confessionId must be provided' }, { status: 400 });
    }
    
    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId,
        callId,
        confessionId,
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

    // Get reported user information and confession details
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const reportedUser = await prisma.user.findUnique({
          where: { id: report.reportedId },
          select: {
            id: true,
            name: true,
            email: true,
            isBlocked: true,
          },
        });
        
        // Get confession details if this is a confession report
        let confession = null;
        if (report.confessionId) {
          confession = await prisma.confession.findUnique({
            where: { id: report.confessionId },
            select: {
              id: true,
              title: true,
              content: true,
              isAnonymous: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });
        }
        
        return {
          ...report,
          reportedUser,
          confession,
        };
      })
    );

    return NextResponse.json({
      reports: reportsWithDetails,
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