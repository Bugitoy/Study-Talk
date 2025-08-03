import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const search = searchParams.get('search') || '';
    
    if (!country) {
      return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
    }
    
    const universities = await prisma.university.findMany({
      where: {
        country: country,
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 50 // Limit results for performance
    });
    
    const response = NextResponse.json(universities);
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching universities by country:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
} 