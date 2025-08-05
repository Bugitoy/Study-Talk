import { NextRequest, NextResponse } from 'next/server';
import { getConfessionsInfiniteOptimized } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'hot') || 'recent';
    const search = searchParams.get('search') || undefined;
    
    // Get the current user's ID from the session
    // For now, we'll get it from the query params, but in a real implementation
    // you'd get it from the session
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Use the existing function but pass the userId as authorId to filter by author
    const result = await getConfessionsInfiniteOptimized({
      cursor,
      limit,
      sortBy,
      search,
      userId, // This is for getting user's vote information
      authorId: userId, // This will filter confessions by the author
    });

    const response = NextResponse.json(result);
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 minutes
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching user confessions:', error);
    return NextResponse.json({ error: 'Failed to fetch user confessions' }, { status: 500 });
  }
} 