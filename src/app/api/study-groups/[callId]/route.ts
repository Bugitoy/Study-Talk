import { NextRequest, NextResponse } from 'next/server';
import { endStudyGroupRoom } from '@/lib/db-utils';

export async function PUT(req: NextRequest, { params }: { params: { callId: string } }) {
  const { callId } = params;
  try {
    await endStudyGroupRoom(callId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error ending study group room:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}