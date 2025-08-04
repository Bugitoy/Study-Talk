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

  const voteOnConfession = async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    if (!userId) return;

    try {
      // Get current state to determine action
      const currentConfession = savedConfessions.find(c => c.id === confessionId);
      if (!currentConfession) return;

      const currentUserVote = currentConfession.userVote;
      let action: 'vote' | 'unvote';
      let newUserVote: 'BELIEVE' | 'DOUBT' | null;
      let believeChange = 0;
      let doubtChange = 0;

      if (currentUserVote === voteType) {
        // User clicked the same button - unvote
        action = 'unvote';
        newUserVote = null;
        if (voteType === 'BELIEVE') believeChange = -1;
        if (voteType === 'DOUBT') doubtChange = -1;
      } else {
        // User clicked different button or no previous vote
        action = 'vote';
        newUserVote = voteType;
        
        if (currentUserVote === 'BELIEVE') {
          // Had BELIEVE, switching to DOUBT
          believeChange = -1;
          doubtChange = 1;
        } else if (currentUserVote === 'DOUBT') {
          // Had DOUBT, switching to BELIEVE
          believeChange = 1;
          doubtChange = -1;
        } else {
          // No previous vote
          if (voteType === 'BELIEVE') believeChange = 1;
          if (voteType === 'DOUBT') doubtChange = 1;
        }
      }

      // Immediate optimistic update
      setSavedConfessions(prev => {
        const updated = prev.map(confession => {
          if (confession.id === confessionId) {
            return {
              ...confession,
              believeCount: Math.max(0, confession.believeCount + believeChange),
              doubtCount: Math.max(0, confession.doubtCount + doubtChange),
              userVote: newUserVote,
            };
          }
          return confession;
        });
        return updated;
      });

      // API call
      const requestBody = action === 'unvote' 
        ? { userId, confessionId, action: 'unvote' }
        : { userId, confessionId, voteType, action: 'vote' };

      const response = await fetch('/api/confessions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setSavedConfessions(prev => prev.map(confession => {
          if (confession.id === confessionId) {
            return {
              ...confession,
              believeCount: Math.max(0, confession.believeCount - believeChange),
              doubtCount: Math.max(0, confession.doubtCount - doubtChange),
              userVote: currentUserVote,
            };
          }
          return confession;
        }));
        throw new Error('Failed to vote on confession');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
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
    voteOnConfession,
    refresh: fetchSavedConfessions,
  };
} 