import { NextRequest, NextResponse } from 'next/server';
import { 
  createConfession, 
  getConfessions, 
  getOrCreateUniversity
} from '@/lib/db-utils';
import { createRateLimit, CONFESSION_RATE_LIMIT } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/security-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const universityId = searchParams.get('universityId') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'recent' | 'hot') || 'recent';
    const search = searchParams.get('search') || undefined;

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
    // Apply rate limiting
    const rateLimit = createRateLimit(CONFESSION_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { title, content, authorId, university, isAnonymous } = await req.json();

    // Input validation
    if (!title || !content || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);

    // Content length validation
    if (sanitizedTitle.length > 200) {
      return NextResponse.json({ error: 'Title too long (max 200 characters)' }, { status: 400 });
    }

    if (sanitizedContent.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400 });
    }

    if (sanitizedTitle.trim().length === 0) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }

    if (sanitizedContent.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    let universityId: string | undefined;
    if (university) {
      const uni = await getOrCreateUniversity(university);
      universityId = uni.id;
    }

    const confession = await createConfession({
      title: sanitizedTitle,
      content: sanitizedContent,
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