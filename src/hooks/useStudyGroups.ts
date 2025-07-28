'use client';
import { useEffect, useState, useCallback } from 'react';

export interface StudyGroup {
  callId: string;
  roomName: string;
  members: string[]; // avatar urls
}

export interface StudyGroupsResponse {
  data: StudyGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  cached?: boolean;
  cacheTimestamp?: number;
}

export interface UseStudyGroupsOptions {
  page?: number;
  limit?: number;
  search?: string;
  autoRefresh?: boolean;
}

export function useStudyGroups(options: UseStudyGroupsOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    autoRefresh = true
  } = options;

  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; timestamp?: number } | null>(null);

  const fetchGroups = useCallback(async (isInitialLoad = false) => {
    try {
      // Only show loading state on initial load, not on refreshes
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const res = await fetch(`/api/study-groups?${params}`);
      
      if (res.ok) {
        const data: StudyGroupsResponse = await res.json();
        setGroups(data.data);
        setPagination(data.pagination);
        setCacheInfo({
          cached: data.cached || false,
          timestamp: data.cacheTimestamp
        });
      } else if (res.status === 429) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else {
        setError('Failed to load study groups');
      }
    } catch (err) {
      console.error('Failed to fetch study groups', err);
      setError('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchGroups(true); // Initial load with loading state
    
    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(() => fetchGroups(false), 15000); // Silent refreshes
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchGroups, autoRefresh]);

  const refresh = useCallback(() => {
    fetchGroups(false); // Silent refresh
  }, [fetchGroups]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      // This will trigger a re-fetch with the new page
      // The parent component should handle page changes
      return newPage;
    }
    return page;
  }, [page, pagination.totalPages]);

  return {
    groups,
    pagination,
    loading,
    error,
    cacheInfo,
    refresh,
    goToPage
  };
}