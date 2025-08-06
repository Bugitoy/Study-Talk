import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getConfessionById } from '@/lib/db-utils';

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

    const confession = await getConfessionById(id, user.id); // Use authenticated user ID

    if (!confession) {
      return NextResponse.json({ error: 'Confession not found' }, { status: 404 });
    }

    return NextResponse.json(confession);
  } catch (error) {
    console.error('Error fetching confession:', error);
    return NextResponse.json({ error: 'Failed to fetch confession' }, { status: 500 });
  }
} 