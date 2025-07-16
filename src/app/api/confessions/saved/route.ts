import { NextRequest, NextResponse } from 'next/server';
import { saveConfession, unsaveConfession, getSavedConfessions } from '@/lib/db-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const savedConfessions = await getSavedConfessions(userId);
    return NextResponse.json(savedConfessions);
  } catch (error) {
    console.error('Error fetching saved confessions:', error);
    return NextResponse.json({ error: 'Failed to fetch saved confessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, confessionId, action } = await req.json();

    if (!userId || !confessionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'save') {
      const saved = await saveConfession(userId, confessionId);
      return NextResponse.json(saved);
    } else if (action === 'unsave') {
      await unsaveConfession(userId, confessionId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error saving/unsaving confession:', error);
    return NextResponse.json({ error: 'Failed to save/unsave confession' }, { status: 500 });
  }
} 