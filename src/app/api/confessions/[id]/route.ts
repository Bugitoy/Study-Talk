import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getConfessionById, deleteConfession } from '@/lib/db-utils';

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

export async function DELETE(
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

    // Check if confession exists and user owns it
    const confession = await getConfessionById(id, user.id);
    if (!confession) {
      return NextResponse.json({ error: 'Confession not found' }, { status: 404 });
    }

    // Check if user is the author
    if (confession.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own confessions' }, { status: 403 });
    }

    // Delete the confession
    await deleteConfession(id);

    return NextResponse.json({ message: 'Confession deleted successfully' });
  } catch (error) {
    console.error('Error deleting confession:', error);
    return NextResponse.json({ error: 'Failed to delete confession' }, { status: 500 });
  }
} 