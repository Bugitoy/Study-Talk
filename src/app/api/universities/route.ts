import { NextRequest, NextResponse } from 'next/server';
import { getUniversitiesOptimized } from '@/lib/db-utils';

export async function GET() {
  try {
    const universities = await getUniversitiesOptimized();
    
    // Add caching headers
    const response = NextResponse.json(universities);
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
} 