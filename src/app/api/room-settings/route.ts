import { NextRequest, NextResponse } from 'next/server';
import { createRoomSetting } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const setting = await createRoomSetting(data);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error creating room setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}