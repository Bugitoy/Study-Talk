'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export interface Confession {
  id: string;
  title: string;
  content: string;
  authorId: string;
  universityId?: string;
  isAnonymous: boolean;
  viewCount: number;
  hotScore: number;
  believeCount: number;
  doubtCount: number;
  commentCount: number;
  savedCount: number;
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

export interface UseInfiniteConfessionsOptions {
  limit?: number;
  universityId?: string;
  sortBy?: 'recent' | 'hot';
  search?: string;
  autoRefresh?: boolean;
}

export function useInfiniteConfessions(options: UseInfiniteConfessionsOptions = {}) {
  const {
    limit = 20,
    universityId,
    sortBy = 'recent',
    search,
    autoRefresh = true,
  } = options;

  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Track new posts that arrive during auto-refresh
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [shouldShowNewPostsBanner, setShouldShowNewPostsBanner] = useState(false);
  
  // Refs to track if we're currently fetching
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchConfessions = useCallback(async (
    cursor?: string, 
    append = false, 
    isRefresh = false,
    signal?: AbortSignal
  ) => {
    if (isFetchingRef.current && !isRefresh) return;
    
    try {
      isFetchingRef.current = true;
      
      if (!append) {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        setLoadingMore(true);
      }
      
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        sortBy,
      });

      if (cursor) params.append('cursor', cursor);
      if (universityId) params.append('universityId', universityId);
      if (search) params.append('search', search);

      const response = await fetch(`/api/confessions/infinite?${params}`, {
        signal,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch confessions');
      }

      const data = await response.json();
      const { confessions: newConfessions, nextCursor: newNextCursor, hasMore: moreAvailable } = data;
      
      if (append) {
        // Append to existing confessions
        setConfessions(prev => [...prev, ...newConfessions]);
      } else if (isRefresh) {
        // Handle refresh - check for new posts
        const currentFirstId = confessions.length > 0 ? confessions[0]?.id : null;
        const firstNewId = newConfessions.length > 0 ? newConfessions[0]?.id : null;
        
        if (currentFirstId && firstNewId && currentFirstId !== firstNewId) {
          // There are new posts, count how many
                     const newPostsIndex = newConfessions.findIndex((c: Confession) => c.id === currentFirstId);
          const newCount = newPostsIndex >= 0 ? newPostsIndex : newConfessions.length;
          
          if (newCount > 0) {
            setNewPostsCount(prev => prev + newCount);
            setShouldShowNewPostsBanner(true);
            // Don't automatically replace - let user choose
            return;
          }
        }
        
        // No new posts or first refresh
        setConfessions(newConfessions);
        setNewPostsCount(0);
        setShouldShowNewPostsBanner(false);
      } else {
        // Initial load
        setConfessions(newConfessions);
      }

      setNextCursor(newNextCursor);
      setHasMore(moreAvailable);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [limit, universityId, sortBy, search, confessions]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || !nextCursor) return;
    fetchConfessions(nextCursor, true);
  }, [fetchConfessions, hasMore, loadingMore, nextCursor]);

  // Refresh function - checks for new posts without replacing
  const refresh = useCallback(() => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;
    
    fetchConfessions(undefined, false, true, newAbortController.signal);
  }, [fetchConfessions]);

  // Function to load new posts (when user clicks the banner)
  const loadNewPosts = useCallback(() => {
    setConfessions([]);
    setNextCursor(null);
    setNewPostsCount(0);
    setShouldShowNewPostsBanner(false);
    fetchConfessions(undefined, false, false);
  }, [fetchConfessions]);

  // Reset function for when filters change
  const reset = useCallback(() => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setConfessions([]);
    setNextCursor(null);
    setNewPostsCount(0);
    setShouldShowNewPostsBanner(false);
    setHasMore(true);
    
    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;
    
    fetchConfessions(undefined, false, false, newAbortController.signal);
  }, [fetchConfessions]);

  const createConfession = async (data: {
    title: string;
    content: string;
    authorId: string;
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
      
      // Add to top of list (new behavior - new posts go to top)
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

  const voteOnConfession = async (confessionId: string, voteType: 'BELIEVE' | 'DOUBT', userId: string) => {
    try {
      // Optimistic update first for instant feedback
      setConfessions(prev => prev.map(confession => {
        if (confession.id === confessionId) {
          return {
            ...confession,
            believeCount: voteType === 'BELIEVE' ? confession.believeCount + 1 : confession.believeCount,
            doubtCount: voteType === 'DOUBT' ? confession.doubtCount + 1 : confession.doubtCount,
          };
        }
        return confession;
      }));

      const response = await fetch('/api/confessions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, confessionId, voteType }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setConfessions(prev => prev.map(confession => {
          if (confession.id === confessionId) {
            return {
              ...confession,
              believeCount: voteType === 'BELIEVE' ? confession.believeCount - 1 : confession.believeCount,
              doubtCount: voteType === 'DOUBT' ? confession.doubtCount - 1 : confession.doubtCount,
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

  const incrementView = async (confessionId: string) => {
    try {
      // Optimistically increment view count
      setConfessions(prev => prev.map(confession => {
        if (confession.id === confessionId) {
          return {
            ...confession,
            viewCount: confession.viewCount + 1,
          };
        }
        return confession;
      }));

      const params = new URLSearchParams({ viewConfessionId: confessionId });
      await fetch(`/api/confessions/infinite?${params}`);
    } catch (error) {
      console.error('Failed to increment view:', error);
      // Revert optimistic update on error
      setConfessions(prev => prev.map(confession => {
        if (confession.id === confessionId) {
          return {
            ...confession,
            viewCount: Math.max(0, confession.viewCount - 1),
          };
        }
        return confession;
      }));
    }
  };

  // Initial load when dependencies change
  useEffect(() => {
    reset();
  }, [universityId, sortBy, search]);

  // Auto-refresh for new posts (but don't replace current view)
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (!loading && !loadingMore) {
          refresh();
        }
      }, 30000); // Check for new posts every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refresh, loading, loadingMore]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    confessions,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    newPostsCount,
    shouldShowNewPostsBanner,
    loadMore,
    refresh,
    loadNewPosts,
    reset,
    createConfession,
    voteOnConfession,
    incrementView,
  };
} 