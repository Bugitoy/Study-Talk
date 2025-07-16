import { NextRequest, NextResponse } from 'next/server';
import { 
  createConfession, 
  getConfessions, 
  getOrCreateUniversity,
  incrementConfessionView 
} from '@/lib/db-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
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
    
    const confessions = await getConfessions({
      page,
      limit,
      universityId,
      sortBy,
      search,
      userId,
    });

    return NextResponse.json(confessions);
  } catch (error) {
    console.error('Error fetching confessions:', error);
    return NextResponse.json({ error: 'Failed to fetch confessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, authorId, university, isAnonymous } = await req.json();

    if (!title || !content || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let universityId: string | undefined;
    if (university) {
      const uni = await getOrCreateUniversity(university);
      universityId = uni.id;
    }

    const confession = await createConfession({
      title,
      content,
      authorId,
      universityId,
      isAnonymous,
    });

    return NextResponse.json(confession);
  } catch (error) {
    console.error('Error creating confession:', error);
    return NextResponse.json({ error: 'Failed to create confession' }, { status: 500 });
  }
} 