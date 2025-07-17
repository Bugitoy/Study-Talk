import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ isBlocked: user.isBlocked });
  } catch (error) {
    console.error('Error checking user block status:', error);
    return NextResponse.json({ error: 'Failed to check block status' }, { status: 500 });
  }
} 