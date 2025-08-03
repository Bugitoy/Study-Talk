import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    
    if (!region) {
      return NextResponse.json({ error: 'Region parameter is required' }, { status: 400 });
    }
    
    const countries = await prisma.university.groupBy({
      by: ['country'],
      where: {
        region: region
      },
      _count: { country: true },
      orderBy: {
        country: 'asc'
      }
    });
    
    const response = NextResponse.json(countries);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return response;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
} 