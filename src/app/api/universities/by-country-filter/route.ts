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

    // Build where conditions
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

    // Use the new confessionCount field for lightning-fast performance!
    const universities = await prisma.university.findMany({
      where: whereClause,
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
        { confessionCount: 'desc' }, // Highest confession count first
        { isVerified: 'desc' },      // Verified universities first
        { name: 'asc' }              // Then alphabetical
      ],
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.university.count({
      where: whereClause
    });

    // Transform data for response
    const universitiesWithStats = universities.map(uni => ({
      id: uni.id,
      name: uni.name,
      domain: uni.domain,
      isVerified: uni.isVerified,
      confessionCount: uni.confessionCount,
      studentCount: 0, // We'll add this later if needed
      totalVotes: 0, // We'll add this later if needed
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
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching universities by filter:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
} 