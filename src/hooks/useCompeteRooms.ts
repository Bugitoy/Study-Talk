'use client';
import { useEffect, useState, useCallback } from 'react';

export interface CompeteRoom {
  callId: string;
  roomName: string;
  members: string[]; // avatar urls
}

export interface CompeteRoomsResponse {
  data: CompeteRoom[];
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

export interface UseCompeteRoomsOptions {
  page?: number;
  limit?: number;
  search?: string;
  autoRefresh?: boolean;
}

export function useCompeteRooms(options: UseCompeteRoomsOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    autoRefresh = true
  } = options;

  const [rooms, setRooms] = useState<CompeteRoom[]>([]);
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

  const fetchRooms = useCallback(async (isInitialLoad = false) => {
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

      const res = await fetch(`/api/compete-rooms?${params}`);
      
      if (res.ok) {
        const data: CompeteRoomsResponse = await res.json();
        setRooms(data.data);
        setPagination(data.pagination);
        setCacheInfo({
          cached: data.cached || false,
          timestamp: data.cacheTimestamp
        });
      } else if (res.status === 429) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else {
        setError('Failed to load compete rooms');
      }
    } catch (err) {
      console.error('Failed to fetch compete rooms', err);
      setError('Failed to load compete rooms');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchRooms(true); // Initial load with loading state
    
    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(() => fetchRooms(false), 5000); // Refresh every 5 seconds for real-time updates
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchRooms, autoRefresh]);

  return {
    rooms,
    pagination,
    loading,
    error,
    cacheInfo,
    refetch: () => fetchRooms(false)
  };
} 