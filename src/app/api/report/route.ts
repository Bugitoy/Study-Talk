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

    // Optimized single query with includes (no reportedUser/confession relation)
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

    // Batch fetch all reported users
    const reportedUserIds = Array.from(new Set(reports.map(r => r.reportedId)));
    const reportedUsers = await prisma.user.findMany({
      where: { id: { in: reportedUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        isBlocked: true,
      },
    });
    const reportedUserMap = Object.fromEntries(reportedUsers.map(u => [u.id, u]));

    // Batch fetch all confessions (with author) for reports with confessionId
    const confessionIds = Array.from(new Set(reports.map(r => r.confessionId).filter((id): id is string => Boolean(id))));
    let confessionsMap: Record<string, any> = {};
    if (confessionIds.length > 0) {
      const confessions = await prisma.confession.findMany({
        where: { id: { in: confessionIds } },
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
      confessionsMap = Object.fromEntries(confessions.map(c => [c.id, c]));
    }

    // Attach reportedUser and confession to each report
    const reportsWithDetails = reports.map(report => ({
      ...report,
      reportedUser: reportedUserMap[report.reportedId] || null,
      confession: report.confessionId ? confessionsMap[report.confessionId] || null : null,
    }));

    // Add HTTP caching headers
    const response = NextResponse.json({
      reports: reportsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
} 