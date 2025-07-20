import { NextRequest, NextResponse } from 'next/server';
import { getUserReputation } from '@/lib/db-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const reputation = await getUserReputation(id);
    
    if (!reputation) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(reputation);
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    return NextResponse.json({ error: 'Failed to fetch user reputation' }, { status: 500 });
  }
} 