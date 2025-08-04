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

    let whereClause: any = {};
    
    if (region && region !== 'all') {
      whereClause.region = region;
    }
    
    if (country && country !== 'all') {
      whereClause.country = country;
    }
    
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.university.count({
      where: whereClause
    });

    const universities = await prisma.university.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            confessions: true,
          },
        },
      },
      orderBy: {
        confessions: {
          _count: 'desc',
        },
      },
      take: limit,
      skip: offset,
    });

    // Get additional stats for each university
    const universitiesWithStats = await Promise.all(
      universities.map(async (uni) => {
        const [votes, uniqueStudents] = await Promise.all([
          prisma.confessionVote.count({
            where: {
              confession: {
                universityId: uni.id,
              },
            },
          }),
          prisma.confession.groupBy({
            by: ['authorId'],
            where: { universityId: uni.id },
          }),
        ]);

        return {
          id: uni.id,
          name: uni.name,
          domain: uni.domain,
          isVerified: uni.isVerified,
          confessionCount: uni._count.confessions,
          studentCount: uniqueStudents.length,
          totalVotes: votes,
          createdAt: uni.createdAt.toISOString(),
          updatedAt: uni.updatedAt.toISOString(),
        };
      })
    );

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
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching universities by filter:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
} 