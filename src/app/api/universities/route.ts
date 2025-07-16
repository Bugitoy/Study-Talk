import { NextRequest, NextResponse } from 'next/server';
import { getUniversities } from '@/lib/db-utils';

export async function GET() {
  try {
    const universities = await getUniversities();
    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
} 