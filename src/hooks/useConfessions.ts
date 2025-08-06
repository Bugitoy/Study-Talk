'use client';
import { useState, useEffect, useCallback } from 'react';

export interface Confession {
  id: string;
  title: string;
  content: string;
  authorId: string;
  universityId?: string;
  isAnonymous: boolean;
  hotScore: number;
  believeCount: number;
  doubtCount: number;
  commentCount: number;
  savedCount: number;
  userVote?: 'BELIEVE' | 'DOUBT' | null;
  author: {
    id: string;
    name?: string;
    image?: string;
    university?: string;
  };
  university?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UseConfessionsOptions {
  page?: number;
  limit?: number;
  universityId?: string;
  sortBy?: 'recent' | 'hot';
  search?: string;
  autoRefresh?: boolean;
}

export function useConfessions(options: UseConfessionsOptions = {}) {
  const {
    page = 1,
    limit = 20,
    universityId,
    sortBy = 'recent',
    search,
    autoRefresh = false,
  } = options;

  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  const fetchConfessions = useCallback(async (resetList = false, isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsBackgroundRefreshing(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
      });

      if (universityId) params.append('universityId', universityId);
      if (search) params.append('search', search);

      const response = await fetch(`/api/confessions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch confessions');
      }

      const newConfessions = await response.json();
      
      if (resetList || page === 1) {
        if (isBackgroundRefresh) {
          // Smooth update: merge new data with existing, preserving user interactions
          setConfessions(prev => smoothMergeConfessions(prev, newConfessions));
        } else {
          // Initial load or manual refresh: replace all
          setConfessions(newConfessions);
        }
      } else {
        setConfessions(prev => [...prev, ...newConfessions]);
      }

      setHasMore(newConfessions.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      } else {
        setIsBackgroundRefreshing(false);
      }
    }
  }, [page, limit, universityId, sortBy, search]);

  // Smart merge function that preserves UI state while updating data
  const smoothMergeConfessions = (existing: Confession[], fresh: Confession[]): Confession[] => {
    const existingMap = new Map(existing.map(c => [c.id, c]));
    const mergedConfessions: Confession[] = [];
    
    // Process fresh confessions
    fresh.forEach(freshConfession => {
      const existingConfession = existingMap.get(freshConfession.id);
      
      if (existingConfession) {
        // Update existing confession with fresh data, but preserve any optimistic updates
        mergedConfessions.push({
          ...freshConfession,
          // Preserve optimistic vote counts if they're higher (user may have voted)
          believeCount: Math.max(existingConfession.believeCount, freshConfession.believeCount),
          doubtCount: Math.max(existingConfession.doubtCount, freshConfession.doubtCount),
        });
        existingMap.delete(freshConfession.id);
      } else {
        // New confession - add it
        mergedConfessions.push(freshConfession);
      }
    });
    
    // Add any remaining existing confessions that weren't in the fresh data
    // (though this shouldn't happen with proper API pagination)
    existingMap.forEach(confession => {
      mergedConfessions.push(confession);
    });
    
    return mergedConfessions;
  };

  // Smooth background refresh - no loading state, no visual disruption
  const backgroundRefresh = useCallback(() => {
    fetchConfessions(true, true);
  }, [fetchConfessions]);

  // Manual refresh - shows loading state
  const refreshConfessions = useCallback(() => {
    fetchConfessions(true, false);
  }, [fetchConfessions]);

  const createConfession = async (data: {
    title: string;
    content: string;
    university?: string;
    isAnonymous?: boolean;
  }) => {
    try {
      const response = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create confession');
      }

      const newConfession = await response.json();
      
      // Optimistically add to top with smooth animation
      setConfessions(prev => {
        // Check if confession already exists (duplicate prevention)
        if (prev.some(c => c.id === newConfession.id)) {
          return prev;
        }
        return [newConfession, ...prev];
      });
      
      return newConfession;
    } catch (error) {
      throw error;
    }
  };

  const voteOnConfession = async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT') => {
    try {
      // Get current state to determine action
      const currentConfession = confessions.find(c => c.id === confessionId);
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
      setConfessions(prev => prev.map(confession => {
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
        setConfessions(prev => prev.map(confession => {
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

  // Initial load and dependency changes
  useEffect(() => {
    fetchConfessions(true, false);
  }, [universityId, sortBy, search]);

  // Smooth auto-refresh - uses background refresh to avoid visual disruption
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(backgroundRefresh, 30000); // Background refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, backgroundRefresh]);

  return {
    confessions,
    loading,
    error,
    hasMore,
    isBackgroundRefreshing, // New: indicates background refresh in progress
    refreshConfessions,      // Manual refresh (shows loading)
    backgroundRefresh,       // Smooth background refresh
    createConfession,
    voteOnConfession,
    fetchMore: () => fetchConfessions(false),
  };
} 