import { NextRequest, NextResponse } from 'next/server'
import { createQuizRoom } from '@/lib/db-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, timePerQuestion, questions } = body
    if (!id || !timePerQuestion || !questions) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const room = await createQuizRoom({ id, name: name || 'Quiz', timePerQuestion, questions })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error creating quiz room:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}