import { NextRequest, NextResponse } from 'next/server'
import { getQuizRoom } from '@/lib/db-utils'

export async function GET(request: NextRequest, { params }: any) {
  try {
    const room = await getQuizRoom(params.id)
    if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching quiz room:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
