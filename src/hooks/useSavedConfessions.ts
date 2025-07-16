'use client';
import { useState, useEffect, useCallback } from 'react';
import { Confession } from './useConfessions';

export function useSavedConfessions(userId?: string) {
  const [savedConfessions, setSavedConfessions] = useState<Confession[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedConfessions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/confessions/saved?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved confessions');
      }

      const confessions = await response.json();
      setSavedConfessions(confessions);
      setSavedIds(new Set(confessions.map((c: Confession) => c.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveConfession = async (confessionId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/confessions/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          confessionId,
          action: 'save',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save confession');
      }

      setSavedIds(prev => new Set(Array.from(prev).concat([confessionId])));
      // Refresh the full list to get the complete confession data
      await fetchSavedConfessions();
    } catch (error) {
      console.error('Error saving confession:', error);
      throw error;
    }
  };

  const unsaveConfession = async (confessionId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/confessions/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          confessionId,
          action: 'unsave',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsave confession');
      }

      setSavedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(confessionId);
        return newSet;
      });
      setSavedConfessions(prev => prev.filter(c => c.id !== confessionId));
    } catch (error) {
      console.error('Error unsaving confession:', error);
      throw error;
    }
  };

  const toggleSave = async (confessionId: string) => {
    if (savedIds.has(confessionId)) {
      await unsaveConfession(confessionId);
    } else {
      await saveConfession(confessionId);
    }
  };

  const isConfessionSaved = (confessionId: string) => {
    return savedIds.has(confessionId);
  };

  useEffect(() => {
    if (userId) {
      fetchSavedConfessions();
    }
  }, [userId, fetchSavedConfessions]);

  return {
    savedConfessions,
    loading,
    error,
    saveConfession,
    unsaveConfession,
    toggleSave,
    isConfessionSaved,
    refresh: fetchSavedConfessions,
  };
} 