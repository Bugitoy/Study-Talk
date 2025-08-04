'use client';
import { useState, useEffect } from 'react';

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
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function useUniversities(region?: string, country?: string, search?: string, page: number = 1) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUniversities = async (reset: boolean = false) => {
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

      const url = `/api/universities/by-country-filter?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch universities');
      }

      const data = await response.json();
      
      if (reset || currentPage === 1) {
        setUniversities(data.universities);
      } else {
        setUniversities(prev => [...prev, ...data.universities]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination?.hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchUniversities(true);
  }, [region, country, search]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchUniversities(false);
    }
  }, [currentPage]);

  return {
    universities,
    pagination,
    loading,
    error,
    loadMore,
    refresh: () => {
      setCurrentPage(1);
      fetchUniversities(true);
    },
  };
} 