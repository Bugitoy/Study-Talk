import { NextRequest, NextResponse } from 'next/server'
import { getTopicQuestions } from '@/lib/db-utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  const questions = await getTopicQuestions(topic)
  if (!questions.length) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  return NextResponse.json(
    questions.map(({ question, optionA, optionB, optionC, optionD, correct }: 
        { question: string, 
          optionA: string, 
          optionB: string, 
          optionC: string, 
          optionD: string, 
          correct: string 
        }) => ({
            
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correct,
    }))
  )
}
