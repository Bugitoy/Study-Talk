"use client";
import { useEffect, useState } from "react";

export interface QuizResultsUser {
  userId: string;
  username: string | null;
  score: number;
  correct: string[];
  wrong: string[];
}

export interface QuizResultsData {
  questions: { id: string; question: string }[];
  users: QuizResultsUser[];
}

export function useQuizResults(roomId: string) {
  const [data, setData] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/quiz-room/${roomId}/results`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId]);

  return { data, loading };
}