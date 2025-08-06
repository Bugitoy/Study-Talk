import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getConfessionCommentsOptimized, createConfessionComment } from '@/lib/db-utils';
import { createRateLimit } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/security-utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const comments = await getConfessionCommentsOptimized(id);
    
    const response = NextResponse.json(comments);
    
    // Add aggressive caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200'); // 10 minutes
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
    
    return response;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting for comments (more generous than confessions)
    const COMMENT_RATE_LIMIT = {
      maxAttempts: 50, // 50 comments per 5 minutes
      windowMs: 5 * 60 * 1000, // 5 minutes
    };
    
    const rateLimit = createRateLimit(COMMENT_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { id } = await params;
    const { content, isAnonymous = true, parentId } = await req.json();

    // Input validation - remove authorId since we use authenticated user
    if (!content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize input
    const sanitizedContent = sanitizeInput(content);

    // Content length validation
    if (sanitizedContent.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 });
    }

    if (sanitizedContent.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    const comment = await createConfessionComment({
      content: sanitizedContent,
      authorId: user.id, // Use authenticated user ID
      confessionId: id,
      isAnonymous,
      parentId,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
} 