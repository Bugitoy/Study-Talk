'use client'
import { useEffect, useState } from 'react'

export interface QuizQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correct: string
}

export interface QuizRoom {
  id: string
  name: string
  timePerQuestion: number
  questions: QuizQuestion[]
}

export function useQuizRoom(roomId: string) {
  const [data, setData] = useState<QuizRoom | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!roomId) return
    const load = async () => {
      try {
        const res = await fetch(`/api/quiz-room/${roomId}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [roomId])
  return { data, loading }
}
