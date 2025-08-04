'use client';
import { useState, useEffect } from 'react';

export interface Region {
  region: string;
  _count: {
    region: number;
  };
}

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/universities/regions');
      if (!response.ok) {
        throw new Error('Failed to fetch regions');
      }

      const data = await response.json();
      setRegions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return {
    regions,
    loading,
    error,
    refresh: fetchRegions,
  };
} 