import { NextRequest, NextResponse } from 'next/server'
import { getQuizResults } from '@/lib/db-utils'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const results = await getQuizResults(params.id)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching quiz results:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}