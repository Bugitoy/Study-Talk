'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface University {
  id: string;
  name: string;
  domain?: string;
  isVerified: boolean;
  confessionCount: number;
  studentCount: number;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function useUniversities(region?: string, country?: string, search?: string, page: number = 1, userId?: string) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pinnedUniversities, setPinnedUniversities] = useState<University[]>([]);

  const fetchUniversities = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (region && region !== 'all') {
        params.append('region', region);
      }
      if (country && country !== 'all') {
        params.append('country', country);
      }
      if (search) {
        params.append('search', search);
      }
      params.append('page', currentPage.toString());
      params.append('limit', '50');

      // Try optimized endpoint first, fallback to simple endpoint
      const endpoints = [
        `/api/universities/stats-optimized?${params.toString()}`,
        `/api/universities/stats-simple?${params.toString()}`
      ];

      let response;
      let data;
      let endpointUsed = '';

      for (const endpoint of endpoints) {
        try {
          endpointUsed = endpoint;
          // Add cache-busting for development
          const cacheBuster = process.env.NODE_ENV === 'development' ? `&t=${Date.now()}` : '';
          response = await fetch(`${endpoint}${cacheBuster}`, {
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          
          if (response.ok) {
            data = await response.json();
            break; // Success, exit loop
          }
        } catch (endpointError) {
          console.warn(`Failed to fetch from ${endpoint}:`, endpointError);
          continue; // Try next endpoint
        }
      }

      if (!response || !response.ok || !data) {
        throw new Error(`Failed to fetch from all endpoints. Last status: ${response?.status}`);
      }

      console.log(`Successfully fetched from: ${endpointUsed}`);
      
      if (reset || currentPage === 1) {
        setUniversities(data.universities);
      } else {
        setUniversities(prev => [...prev, ...data.universities]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching universities:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [region, country, search, currentPage]);

  const loadMore = useCallback(() => {
    if (pagination?.hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination?.hasMore, loading]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchUniversities(true);
  }, [fetchUniversities]);

  // Fetch pinned universities
  const fetchPinnedUniversities = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/universities/pin');
      if (response.ok) {
        const data = await response.json();
        setPinnedUniversities(data.pinnedUniversities || []);
      }
    } catch (error) {
      console.error('Error fetching pinned universities:', error);
    }
  }, [userId]);

  // Pin a university
  const pinUniversity = useCallback(async (universityId: string) => {
    if (!userId) return false;
    
    try {
      const response = await fetch('/api/universities/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityId })
      });
      
      if (response.ok) {
        await fetchPinnedUniversities();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pinning university:', error);
      return false;
    }
  }, [userId, fetchPinnedUniversities]);

  // Unpin a university
  const unpinUniversity = useCallback(async (universityId: string) => {
    if (!userId) return false;
    
    try {
      const response = await fetch(`/api/universities/pin?universityId=${universityId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchPinnedUniversities();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unpinning university:', error);
      return false;
    }
  }, [userId, fetchPinnedUniversities]);

  // Toggle pin status
  const togglePinUniversity = useCallback(async (universityId: string) => {
    const isPinned = pinnedUniversities.some(uni => uni.id === universityId);
    if (isPinned) {
      return await unpinUniversity(universityId);
    } else {
      return await pinUniversity(universityId);
    }
  }, [pinnedUniversities, pinUniversity, unpinUniversity]);

  useEffect(() => {
    setCurrentPage(1);
    fetchUniversities(true);
  }, [region, country, search]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchUniversities(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPinnedUniversities();
  }, [fetchPinnedUniversities]);

  // Combine pinned and regular universities, with pinned ones first
  const allUniversities = useMemo(() => {
    const pinnedIds = new Set(pinnedUniversities.map(uni => uni.id));
    const regularUniversities = universities.filter(uni => !pinnedIds.has(uni.id));
    
    return [
      ...pinnedUniversities.map(uni => ({ ...uni, isPinned: true })),
      ...regularUniversities.map(uni => ({ ...uni, isPinned: false }))
    ];
  }, [pinnedUniversities, universities]);

  return {
    universities: allUniversities,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    pinUniversity,
    unpinUniversity,
    togglePinUniversity,
    pinnedUniversities,
  };
} 