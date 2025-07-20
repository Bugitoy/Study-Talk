import { NextRequest, NextResponse } from 'next/server';
import { getConfessionById, incrementConfessionView } from '@/lib/db-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;

    // Increment view count
    await incrementConfessionView(id);

    const confession = await getConfessionById(id, userId);

    if (!confession) {
      return NextResponse.json({ error: 'Confession not found' }, { status: 404 });
    }

    return NextResponse.json(confession);
  } catch (error) {
    console.error('Error fetching confession:', error);
    return NextResponse.json({ error: 'Failed to fetch confession' }, { status: 500 });
  }
} 