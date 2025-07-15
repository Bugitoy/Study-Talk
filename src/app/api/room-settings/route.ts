import { NextRequest, NextResponse } from 'next/server';
import { createRoomSetting } from '@/lib/db-utils';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Remove any callId from the data to prevent conflicts (callId should only be set via PUT later)
    const { callId, ...cleanData } = data;
    
    if (callId) {
      console.warn('⚠️ callId was included in POST request and has been removed:', callId);
    }
    
    const setting = await createRoomSetting(cleanData);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error creating room setting:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}