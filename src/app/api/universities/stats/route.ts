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

    // First, get the universities with basic info
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

    // Get university IDs for efficient querying
    const universityIds = universities.map(uni => uni.id);

    // Calculate student count and total votes for each university
    const universityStats = await Promise.all(
      universities.map(async (uni) => {
        // Get student count (users who have this university name)
        const studentCount = await prisma.user.count({
          where: {
            university: uni.name
          }
        });

        // Get total votes from students who attended this university
        const totalVotes = await prisma.confessionVote.aggregate({
          where: {
            user: {
              university: uni.name
            }
          },
          _count: {
            id: true
          }
        });

        return {
          universityId: uni.id,
          studentCount,
          totalVotes: totalVotes._count.id
        };
      })
    );

    // Create a map for quick lookup
    const statsMap = new Map(
      universityStats.map(stat => [stat.universityId, stat])
    );

    // Transform data for response
    const universitiesWithStats = universities.map(uni => {
      const stats = statsMap.get(uni.id) || { studentCount: 0, totalVotes: 0 };
      
      return {
        id: uni.id,
        name: uni.name,
        domain: uni.domain,
        isVerified: uni.isVerified,
        confessionCount: uni.confessionCount,
        studentCount: stats.studentCount,
        totalVotes: stats.totalVotes,
        createdAt: uni.createdAt.toISOString(),
        updatedAt: uni.updatedAt.toISOString(),
      };
    });

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
    console.error('Error fetching university statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch university statistics' }, { status: 500 });
  }
} 