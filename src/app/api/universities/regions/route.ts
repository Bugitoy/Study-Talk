import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET() {
  try {
    // Use cached regions data for better performance
    const regions = await prisma.university.groupBy({
      by: ['region'],
      _count: { region: true },
      orderBy: { region: 'asc' }
    });

    const response = NextResponse.json(regions);
    
    // Aggressive caching for regions (they don't change often)
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=172800'); // 24 hours
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=86400');
    
    return response;
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
  }
} 