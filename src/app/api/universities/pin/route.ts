import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/db/prisma';

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `pin_${userId}`;
  const userLimit = rateLimitMap.get(key);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    if (!checkRateLimit(user.id, 50, 60000)) { // 50 requests per minute
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    const { universityId } = await request.json();

    if (!universityId) {
      return NextResponse.json({ error: 'University ID is required' }, { status: 400 });
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId }
    });

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    // Check if already pinned
    let existingPin = null;
    try {
      existingPin = await prisma.pinnedUniversity.findUnique({
        where: {
          userId_universityId: {
            userId: user.id,
            universityId: universityId
          }
        }
      });
    } catch (error) {
      console.error('Error checking existing pin:', error);
      // If the model doesn't exist yet, treat as not pinned
      existingPin = null;
    }

    if (existingPin) {
      return NextResponse.json({ error: 'University is already pinned' }, { status: 400 });
    }

    // Pin the university
    let pinnedUniversity = null;
    try {
      pinnedUniversity = await prisma.pinnedUniversity.create({
        data: {
          userId: user.id,
          universityId: universityId
        },
        include: {
          university: true
        }
      });
    } catch (error) {
      console.error('Error creating pinned university:', error);
      return NextResponse.json({ error: 'Failed to pin university - model may not be ready' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      pinnedUniversity 
    });

  } catch (error) {
    console.error('Error pinning university:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    if (!checkRateLimit(user.id, 50, 60000)) { // 50 requests per minute
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');

    if (!universityId) {
      return NextResponse.json({ error: 'University ID is required' }, { status: 400 });
    }

    // Unpin the university
    const deletedPin = await prisma.pinnedUniversity.deleteMany({
      where: {
        userId: user.id,
        universityId: universityId
      }
    });

    if (deletedPin.count === 0) {
      return NextResponse.json({ error: 'University is not pinned' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'University unpinned successfully' 
    });

  } catch (error) {
    console.error('Error unpinning university:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all pinned universities for the user
    const pinnedUniversities = await prisma.pinnedUniversity.findMany({
      where: {
        userId: user.id
      },
      include: {
        university: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get the university IDs that are pinned
    const pinnedUniversityIds = pinnedUniversities.map(pin => pin.universityId);

    // Fetch complete university data with statistics for pinned universities
    const completePinnedUniversities = await prisma.university.findMany({
      where: {
        id: { in: pinnedUniversityIds }
      },
      select: {
        id: true,
        name: true,
        domain: true,
        isVerified: true,
        region: true,
        country: true,
        confessionCount: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Get student counts for pinned universities
    const pinnedUniversityNames = completePinnedUniversities.map(uni => uni.name);
    const studentCountsResult = await prisma.$runCommandRaw({
      aggregate: 'User',
      pipeline: [
        {
          $match: {
            university: { $in: pinnedUniversityNames }
          }
        },
        {
          $group: {
            _id: '$university',
            studentCount: { $sum: 1 }
          }
        }
      ],
      cursor: {}
    });

    // Get vote counts for pinned universities
    const voteCountsResult = await prisma.$runCommandRaw({
      aggregate: 'ConfessionVote',
      pipeline: [
        {
          $lookup: {
            from: 'User',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $match: {
            'user.university': { $in: pinnedUniversityNames }
          }
        },
        {
          $group: {
            _id: '$user.university',
            totalVotes: { $sum: 1 }
          }
        }
      ],
      cursor: {}
    });

    // Combine the data
    const studentCounts = new Map();
    const voteCounts = new Map();

    if (studentCountsResult && typeof studentCountsResult === 'object' && 'cursor' in studentCountsResult) {
      const cursor = (studentCountsResult as any).cursor;
      if (cursor && cursor.firstBatch) {
        cursor.firstBatch.forEach((item: any) => {
          studentCounts.set(item._id, item.studentCount);
        });
      }
    }

    if (voteCountsResult && typeof voteCountsResult === 'object' && 'cursor' in voteCountsResult) {
      const cursor = (voteCountsResult as any).cursor;
      if (cursor && cursor.firstBatch) {
        cursor.firstBatch.forEach((item: any) => {
          voteCounts.set(item._id, item.totalVotes);
        });
      }
    }

    // Add statistics to universities
    const universitiesWithStats = completePinnedUniversities.map(uni => ({
      ...uni,
      studentCount: studentCounts.get(uni.name) || 0,
      totalVotes: voteCounts.get(uni.name) || 0
    }));

    return NextResponse.json({ 
      pinnedUniversities: universitiesWithStats
    });

  } catch (error) {
    console.error('Error fetching pinned universities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 