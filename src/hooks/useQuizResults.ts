'use client'
import { useEffect, useState } from 'react'

export function useQuizResults(roomId: string) {
  const [data, setData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return
    const load = async () => {
      try {
        const res = await fetch(`/api/quiz-room/${roomId}/results`)
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