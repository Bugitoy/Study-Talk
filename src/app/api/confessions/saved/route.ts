import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { 
  saveConfession, 
  unsaveConfession, 
  getSavedConfessions,
  getSavedConfessionsAggregated
} from '@/lib/db-utils';

export async function GET(req: NextRequest) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use authenticated user ID instead of client-provided userId
    const savedConfessions = await getSavedConfessions(user.id);
    return NextResponse.json(savedConfessions);
  } catch (error) {
    console.error('Error fetching saved confessions:', error);
    return NextResponse.json({ error: 'Failed to fetch saved confessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Server-side authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { confessionId, action } = await req.json();

    if (!confessionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'save') {
      const saved = await saveConfession(user.id, confessionId); // Use authenticated user ID
      return NextResponse.json(saved);
    } else if (action === 'unsave') {
      await unsaveConfession(user.id, confessionId); // Use authenticated user ID
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error saving/unsaving confession:', error);
    return NextResponse.json({ error: 'Failed to save/unsave confession' }, { status: 500 });
  }
} 