import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/db/prisma';
import { createRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting for comment votes
    const VOTE_RATE_LIMIT = {
      maxAttempts: 100, // 100 votes per 5 minutes
      windowMs: 5 * 60 * 1000, // 5 minutes
    };
    
    const rateLimit = createRateLimit(VOTE_RATE_LIMIT);
    const rateLimitResult = rateLimit(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { id: confessionId, commentId } = await params;
    const { voteType } = await req.json();

    if (!voteType || !['BELIEVE', 'DOUBT'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if comment exists and belongs to the confession
    const comment = await prisma.confessionComment.findFirst({
      where: {
        id: commentId,
        confessionId: confessionId,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user already voted on this comment
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: commentId,
        },
      },
    });

    let updatedComment;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if clicking the same button
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId: commentId,
            },
          },
        });

        // Update comment counts
        updatedComment = await prisma.confessionComment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              decrement: voteType === 'BELIEVE' ? 1 : 0,
            },
            dislikeCount: {
              decrement: voteType === 'DOUBT' ? 1 : 0,
            },
          },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        });
      } else {
        // Change vote type
        await prisma.commentVote.update({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId: commentId,
            },
          },
          data: { voteType },
        });

        // Update comment counts (increment new vote, decrement old vote)
        updatedComment = await prisma.confessionComment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              increment: voteType === 'BELIEVE' ? 1 : -1,
            },
            dislikeCount: {
              increment: voteType === 'DOUBT' ? 1 : -1,
            },
          },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        });
      }
    } else {
      // Create new vote
      await prisma.commentVote.create({
        data: {
          userId: user.id,
          commentId: commentId,
          voteType,
        },
      });

      // Update comment counts
      updatedComment = await prisma.confessionComment.update({
        where: { id: commentId },
        data: {
          likeCount: {
            increment: voteType === 'BELIEVE' ? 1 : 0,
          },
          dislikeCount: {
            increment: voteType === 'DOUBT' ? 1 : 0,
          },
        },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      });
    }

    // Get user's current vote for this comment
    const userVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: commentId,
        },
      },
    });

    return NextResponse.json({
      comment: updatedComment,
      userVote: userVote?.voteType || null,
    });
  } catch (error) {
    console.error('Error voting on comment:', error);
    return NextResponse.json({ error: 'Failed to vote on comment' }, { status: 500 });
  }
} 