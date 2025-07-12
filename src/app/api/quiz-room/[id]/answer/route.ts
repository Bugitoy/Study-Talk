import { NextRequest, NextResponse } from 'next/server'
import { saveQuizAnswer } from '@/lib/db-utils'

export async function POST(request: NextRequest, { params }: any) {
  try {
    const { userId, questionId, answer } = await request.json()
    if (!userId || !questionId || !answer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    await saveQuizAnswer({ roomId: params.id, questionId, userId, answer })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving quiz answer:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
