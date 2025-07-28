import { NextRequest, NextResponse } from 'next/server'
import { createQuizRoom } from '@/lib/db-utils'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function POST(request: NextRequest) {
  // Add authentication check
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json()
    const { id, name, timePerQuestion, questions } = body
    
    if (!id || timePerQuestion === undefined || !questions) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    
    const room = await createQuizRoom({ id, name: name || 'Quiz', timePerQuestion, questions })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error creating quiz room:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}