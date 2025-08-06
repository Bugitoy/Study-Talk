import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getConfessionsInfiniteOptimized } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'hot') || 'recent';
    const search = searchParams.get('search') || undefined;

    // Use the existing function but pass the authenticated user.id as authorId to filter by author
    const result = await getConfessionsInfiniteOptimized({
      cursor,
      limit,
      sortBy,
      search,
      userId: user.id, // This is for getting user's vote information
      authorId: user.id, // This will filter confessions by the author
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