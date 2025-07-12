'use client'
import NextLayout from '@/components/NextLayout'
import { useParams } from 'next/navigation'
import { useQuizResults } from '@/hooks/useQuizResults'

export default function ResultsPage() {
  const { id } = useParams()
  const { data, loading } = useQuizResults(id as string)

  if (loading) return <NextLayout><p className='text-center'>Loading...</p></NextLayout>

  const entries = Object.entries(data).sort((a,b) => b[1]-a[1])

  return (
    <NextLayout>
      <div className='p-6 max-w-xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6 text-center'>Results</h1>
        <ul className='space-y-2'>
          {entries.map(([user, score]) => (
            <li key={user} className='flex justify-between border-b pb-2'>
              <span>{user}</span>
              <span>{score}</span>
            </li>
          ))}
        </ul>
      </div>
    </NextLayout>
  )
}
