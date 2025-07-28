import { NextRequest, NextResponse } from 'next/server';
import { getRoomSetting, updateRoomSetting } from '@/lib/db-utils';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) {
    // Add authentication check
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    try {
      const setting = await getRoomSetting(id);
    if (!setting) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error fetching room setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) {
    // Add authentication check
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    try {
      const data = await req.json();
      
      const setting = await updateRoomSetting(id, data);
      
      return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating room setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}