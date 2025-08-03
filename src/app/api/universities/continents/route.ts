import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET() {
  try {
    const continents = await prisma.university.groupBy({
      by: ['region'],
      _count: { region: true },
      orderBy: {
        region: 'asc'
      }
    });
    
    const response = NextResponse.json(continents);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return response;
  } catch (error) {
    console.error('Error fetching continents:', error);
    return NextResponse.json({ error: 'Failed to fetch continents' }, { status: 500 });
  }
} 