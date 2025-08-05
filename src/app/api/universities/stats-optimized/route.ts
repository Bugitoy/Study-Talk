import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const country = searchParams.get('country');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where conditions for universities
    let universityWhereClause: any = {};
    
    if (region && region !== 'all') {
      universityWhereClause.region = region;
    }
    
    if (country && country !== 'all') {
      universityWhereClause.country = country;
    }
    
    if (search) {
      universityWhereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get universities with basic info
    const universities = await prisma.university.findMany({
      where: universityWhereClause,
      select: {
        id: true,
        name: true,
        domain: true,
        isVerified: true,
        region: true,
        country: true,
        confessionCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { confessionCount: 'desc' },
        { isVerified: 'desc' },
        { name: 'asc' }
      ],
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.university.count({
      where: universityWhereClause
    });

    // Get university names for matching
    const universityNames = universities.map(uni => uni.name);

    // Use raw MongoDB aggregation for better performance
    const db = prisma.$runCommandRaw;
    
    // Get student counts for all universities in one query
    const studentCountsResult = await prisma.$runCommandRaw({
      aggregate: 'User',
      pipeline: [
        {
          $match: {
            university: { $in: universityNames }
          }
        },
        {
          $group: {
            _id: '$university',
            studentCount: { $sum: 1 }
          }
        }
      ],
      cursor: {}
    });

    // Get vote counts for all universities in one query
    const voteCountsResult = await prisma.$runCommandRaw({
      aggregate: 'ConfessionVote',
      pipeline: [
        {
          $lookup: {
            from: 'User',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $match: {
            'user.university': { $in: universityNames }
          }
        },
        {
          $group: {
            _id: '$user.university',
            totalVotes: { $sum: 1 }
          }
        }
      ],
      cursor: {}
    });

    // Create maps for quick lookup
    const studentCountsMap = new Map();
    const voteCountsMap = new Map();

    // Process student counts
    if (studentCountsResult.cursor && studentCountsResult.cursor.firstBatch) {
      studentCountsResult.cursor.firstBatch.forEach((item: any) => {
        studentCountsMap.set(item._id, item.studentCount);
      });
    }

    // Process vote counts
    if (voteCountsResult.cursor && voteCountsResult.cursor.firstBatch) {
      voteCountsResult.cursor.firstBatch.forEach((item: any) => {
        voteCountsMap.set(item._id, item.totalVotes);
      });
    }

    // Transform data for response
    const universitiesWithStats = universities.map(uni => ({
      id: uni.id,
      name: uni.name,
      domain: uni.domain,
      isVerified: uni.isVerified,
      confessionCount: uni.confessionCount,
      studentCount: studentCountsMap.get(uni.name) || 0,
      totalVotes: voteCountsMap.get(uni.name) || 0,
      createdAt: uni.createdAt.toISOString(),
      updatedAt: uni.updatedAt.toISOString(),
    }));

    const response = NextResponse.json({
      universities: universitiesWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      }
    });

    // Aggressive caching for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=1800');
    
    return response;
  } catch (error) {
    console.error('Error fetching optimized university statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch university statistics' }, { status: 500 });
  }
} 