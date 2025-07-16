import { NextRequest, NextResponse } from 'next/server';
import { updateUserUniversity } from '@/lib/db-utils';

export async function PUT(req: NextRequest) {
  try {
    const { userId, university } = await req.json();

    if (!userId || !university) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedUser = await updateUserUniversity(userId, university);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user university:', error);
    
    if (error instanceof Error && error.message.includes('can only be changed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update university' }, { status: 500 });
  }
} 