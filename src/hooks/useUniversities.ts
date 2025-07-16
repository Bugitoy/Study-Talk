'use client';
import { useState, useEffect } from 'react';

export interface University {
  id: string;
  name: string;
  domain?: string;
  isVerified: boolean;
  confessionCount: number;
  studentCount: number;
  totalViews: number;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/universities');
      if (!response.ok) {
        throw new Error('Failed to fetch universities');
      }

      const data = await response.json();
      setUniversities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  return {
    universities,
    loading,
    error,
    refresh: fetchUniversities,
  };
} 