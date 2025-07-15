import { NextRequest, NextResponse } from 'next/server';
import { getRoomSettingByCallId } from '@/lib/db-utils';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ callId: string }> },
  ) {
    const { callId } = await context.params;
    try {
      const setting = await getRoomSettingByCallId(callId);
    if (!setting) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error fetching room setting by callId:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}