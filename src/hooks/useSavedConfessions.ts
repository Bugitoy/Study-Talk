'use client';
import { useState, useEffect, useCallback } from 'react';
import { Confession } from './useConfessions';
import { useVoteState } from './useVoteState';
import { useTabVisibility } from './useTabVisibility';

export function useSavedConfessions() {
  const [savedConfessions, setSavedConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedConfessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/confessions/saved');
      if (!response.ok) {
        throw new Error('Failed to fetch saved confessions');
      }

      const data = await response.json();
      setSavedConfessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved confessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfession = useCallback(async (confessionId: string) => {
    try {
      const response = await fetch('/api/confessions/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confessionId,
          action: 'save'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save confession');
      }

      // Refresh the list
      await fetchSavedConfessions();
    } catch (error) {
      throw error;
    }
  }, [fetchSavedConfessions]);

  const unsaveConfession = useCallback(async (confessionId: string) => {
    try {
      const response = await fetch('/api/confessions/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confessionId,
          action: 'unsave'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsave confession');
      }

      // Refresh the list
      await fetchSavedConfessions();
    } catch (error) {
      throw error;
    }
  }, [fetchSavedConfessions]);

  const toggleSave = useCallback(async (confessionId: string) => {
    try {
      const isCurrentlySaved = savedConfessions.some(c => c.id === confessionId);
      
      if (isCurrentlySaved) {
        await unsaveConfession(confessionId);
      } else {
        await saveConfession(confessionId);
      }
    } catch (error) {
      throw error;
    }
  }, [savedConfessions, saveConfession, unsaveConfession]);

  const isConfessionSaved = useCallback((confessionId: string) => {
    return savedConfessions.some(c => c.id === confessionId);
  }, [savedConfessions]);

  // Vote on confession
  const voteOnConfession = useCallback(async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
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

      // Optimistic update
      setSavedConfessions(prev => prev.map(confession => {
        if (confession.id === confessionId) {
          return {
            ...confession,
            believeCount: Math.max(0, confession.believeCount + believeChange),
            doubtCount: Math.max(0, confession.doubtCount + doubtChange),
            userVote: newUserVote,
          };
        }
        return confession;
      }));

      // API call
      const requestBody = action === 'unvote' 
        ? { confessionId, action: 'unvote' }
        : { confessionId, voteType, action: 'vote' };

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
  }, [savedConfessions]);

  // Initial load
  useEffect(() => {
    fetchSavedConfessions();
  }, [fetchSavedConfessions]);

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