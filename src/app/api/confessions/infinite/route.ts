import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { 
  getConfessionsInfiniteOptimized,
  getConfessionsAggregated
} from '@/lib/db-utils';

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
    const universityId = searchParams.get('universityId') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'hot') || 'recent';
    const search = searchParams.get('search') || undefined;
    
    // Use authenticated user ID instead of client-provided userId
    const userId = user.id;
    
    // Temporarily use the working method until aggregation is fixed
    const result = await getConfessionsInfiniteOptimized({
      cursor,
      limit,
      universityId,
      sortBy,
      search,
      userId,
    });

    const response = NextResponse.json(result);
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 minutes
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching confessions (infinite):', error);
    return NextResponse.json({ error: 'Failed to fetch confessions' }, { status: 500 });
  }
} 