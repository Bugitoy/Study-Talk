'use client';
import { useState, useEffect, useCallback } from 'react';
import { Confession } from './useConfessions';
import { useVoteState } from './useVoteState';

export function useSavedConfessions(userId?: string) {
  const { getVoteState, updateVoteState, completeVote, isVotePending } = useVoteState();
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
      
      // Sync confessions with global vote state
      const syncedConfessions = confessions.map((confession: Confession) => {
        const globalState = getVoteState(confession.id);
        if (globalState && globalState.lastUpdated > Date.now() - 30000) { // Only use recent state (30 seconds)
          return {
            ...confession,
            believeCount: globalState.believeCount,
            doubtCount: globalState.doubtCount,
            userVote: globalState.userVote,
          };
        }
        return confession;
      });
      
      setSavedConfessions(syncedConfessions);
      setSavedIds(new Set(syncedConfessions.map((c: Confession) => c.id)));
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

      if (currentUserVote === voteType) {
        // User clicked the same button - unvote
        action = 'unvote';
      } else {
        // User clicked different button or no previous vote
        action = 'vote';
      }

      // Check if vote is already pending
      if (isVotePending(confessionId, voteType)) {
        return; // Vote already in progress, ignore this click
      }

      // Update global vote state (this will prevent duplicate votes across tabs)
      const stateUpdated = updateVoteState(
        confessionId,
        voteType,
        action,
        currentConfession.believeCount,
        currentConfession.doubtCount,
        currentUserVote
      );

      if (!stateUpdated) {
        return; // Vote already in progress
      }

      // Apply optimistic update to local state
      const globalState = getVoteState(confessionId);
      if (globalState) {
        setSavedConfessions(prev => prev.map(confession => {
          if (confession.id === confessionId) {
            return {
              ...confession,
              believeCount: globalState.believeCount,
              doubtCount: globalState.doubtCount,
              userVote: globalState.userVote,
            };
          }
          return confession;
        }));
      }

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
        completeVote(confessionId, voteType, false);
        
        // Revert local state
        setSavedConfessions(prev => prev.map(confession => {
          if (confession.id === confessionId) {
            return {
              ...confession,
              believeCount: currentConfession.believeCount,
              doubtCount: currentConfession.doubtCount,
              userVote: currentUserVote,
            };
          }
          return confession;
        }));
        
        throw new Error('Failed to vote on confession');
      }

      // Mark vote as completed successfully
      completeVote(confessionId, voteType, true);

      return await response.json();
    } catch (error) {
      // Mark vote as failed
      completeVote(confessionId, voteType, false);
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