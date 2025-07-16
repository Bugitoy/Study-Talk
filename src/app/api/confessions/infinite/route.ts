import { NextRequest, NextResponse } from 'next/server';
import { 
  getConfessionsInfinite,
  incrementConfessionView 
} from '@/lib/db-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const universityId = searchParams.get('universityId') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'hot') || 'recent';
    const search = searchParams.get('search') || undefined;
    const viewConfessionId = searchParams.get('viewConfessionId');

    // Increment view count if specified
    if (viewConfessionId) {
      await incrementConfessionView(viewConfessionId);
    }

    const userId = searchParams.get('userId') || undefined;
    
    const result = await getConfessionsInfinite({
      cursor,
      limit,
      universityId,
      sortBy,
      search,
      userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching confessions (infinite):', error);
    return NextResponse.json({ error: 'Failed to fetch confessions' }, { status: 500 });
  }
} 