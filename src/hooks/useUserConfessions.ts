'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Confession } from './useInfiniteConfessions';
import { useVoteState } from './useVoteState';
import { useTabVisibility } from './useTabVisibility';

export interface UseUserConfessionsOptions {
  limit?: number;
  sortBy?: 'recent' | 'hot';
  search?: string;
  autoRefresh?: boolean;
  userId?: string;
}

export function useUserConfessions(options: UseUserConfessionsOptions = {}) {
  const {
    limit = 20,
    sortBy = 'recent',
    search,
    autoRefresh = true,
    userId,
  } = options;

  const { getVoteState, updateVoteState, completeVote, isVotePending, subscribeToVoteState, syncAllVoteStates } = useVoteState();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserConfessions = useCallback(async (cursor?: string) => {
    if (!userId) {
      setConfessions([]);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        sortBy,
        type: 'user', // Special parameter to indicate we want user's own confessions
      });

      if (search) params.append('search', search);
      if (userId) params.append('userId', userId);

      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`/api/confessions/user?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user confessions');
      }

      const data = await response.json();
      
      // Sync confessions with global vote state
      const syncedConfessions = data.confessions.map((confession: Confession) => {
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
      
      if (cursor) {
        setConfessions(prev => [...prev, ...syncedConfessions]);
      } else {
        setConfessions(syncedConfessions);
      }
      
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user confessions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [limit, sortBy, search, userId]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !nextCursor) return;
    
    setLoadingMore(true);
    fetchUserConfessions(nextCursor);
  }, [loadingMore, hasMore, nextCursor, fetchUserConfessions]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setNextCursor(null);
    fetchUserConfessions();
  }, [fetchUserConfessions]);

  const voteOnConfession = async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    if (!userId) return;

    try {
      // Get current state to determine action
      const currentConfession = confessions.find(c => c.id === confessionId);
      if (!currentConfession) return;

      const currentUserVote = currentConfession.userVote || null;
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
        setConfessions(prev => prev.map(confession => {
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
        setConfessions(prev => prev.map(confession => {
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

  // Initial load
  useEffect(() => {
    fetchUserConfessions();
  }, [fetchUserConfessions]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  // Function to sync vote states with current confessions
  const syncVoteStates = useCallback(() => {
    setConfessions(prev => prev.map(confession => {
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
    }));
  }, [getVoteState]);

  // Subscribe to vote state changes for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToVoteState((confessionId, voteState) => {
      // Update the confession in user confessions if it exists
      setConfessions(prev => prev.map(confession => {
        if (confession.id === confessionId) {
          if (voteState) {
            return {
              ...confession,
              believeCount: voteState.believeCount,
              doubtCount: voteState.doubtCount,
              userVote: voteState.userVote,
            };
          } else {
            // Vote was reverted, we need to fetch fresh data
            // This is a fallback - ideally we'd have the original state
            return confession;
          }
        }
        return confession;
      }));
    });

    return unsubscribe;
  }, [subscribeToVoteState]);

  // Sync vote states when component mounts or when data changes
  useEffect(() => {
    if (confessions.length > 0) {
      // Small delay to ensure any pending vote states are processed
      const timeoutId = setTimeout(() => {
        syncVoteStates();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [confessions.length, syncVoteStates]);

  // Sync vote states when tab becomes visible
  useTabVisibility(syncVoteStates);

  return {
    confessions,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    voteOnConfession,
  };
} 