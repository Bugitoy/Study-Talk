import { NextRequest, NextResponse } from 'next/server';
import { getRoomSetting, updateRoomSetting } from '@/lib/db-utils';

export async function GET(
    req: NextRequest,
    context: { params: { id: string } },
  ) {
    const { params } = await context;
    const { id } = params;
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
    context: { params: { id: string } },
  ) {
    const { params } = await context;
    const { id } = params;
    try {
      const data = await req.json();
      const setting = await updateRoomSetting(id, data);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating room setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}