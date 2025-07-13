import { NextRequest, NextResponse } from 'next/server'
import { getQuizRoom } from '@/lib/db-utils'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await getQuizRoom(id)
    if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching quiz room:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}