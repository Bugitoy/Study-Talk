'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Confession } from './useInfiniteConfessions';

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
      
      if (cursor) {
        setConfessions(prev => [...prev, ...data.confessions]);
      } else {
        setConfessions(data.confessions);
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

  return {
    confessions,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
} 