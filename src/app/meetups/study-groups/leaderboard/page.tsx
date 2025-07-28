'use client';
import React, { useState, useEffect } from 'react';
import NextLayout from '@/components/NextLayout';
import { User as UserIcon, Trophy, Medal, Award, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  name: string;
  image?: string;
  hours: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
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

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; timestamp?: number } | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/leaderboard?period=${period}&page=${pagination.page}&limit=${pagination.limit}`);
        
        if (response.ok) {
          const data: LeaderboardResponse = await response.json();
          setLeaderboardData(data.data);
          setPagination(data.pagination);
          setCacheInfo({
            cached: data.cached || false,
            timestamp: data.cacheTimestamp
          });
        } else if (response.status === 429) {
          setError('Too many requests. Please wait a moment before trying again.');
        } else {
          setError('Failed to load leaderboard data');
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 font-bold';
    if (rank === 2) return 'text-gray-600 font-semibold';
    if (rank === 3) return 'text-orange-600 font-semibold';
    return 'text-gray-500';
  };

  const getActualRank = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  return (
    <NextLayout>
      <div className="min-h-screen py-10 px-2">
        <div className="max-w-3xl mx-auto rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Leaderboard</h1>
          <p className="text-center text-gray-500 mb-4">Top students by hours studied</p>
          
          {/* Period Toggle */}
          <div className="flex justify-center mb-6" role="group" aria-label="Time period selection">
            <div className="bg-gray-200 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                  period === 'daily'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setPeriod('daily')}
                aria-pressed={period === 'daily'}
              >
                Today
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                  period === 'weekly'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setPeriod('weekly')}
                aria-pressed={period === 'weekly'}
              >
                This Week
              </button>
            </div>
          </div>



          {loading ? (
            <div className="text-center py-8" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" aria-hidden="true"></div>
              <p className="mt-2 text-gray-500">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8" role="alert">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2" role="table" aria-label={`Study leaderboard for ${period === 'daily' ? 'today' : 'this week'}`}>
                  <thead>
                    <tr className="text-gray-600 text-center text-sm" role="row">
                      <th className="px-4 py-2" role="columnheader" scope="col">Rank</th>
                      <th className="px-4 py-2" role="columnheader" scope="col">User</th>
                      <th className="px-4 py-2" role="columnheader" scope="col">Hours studied {period === 'daily' ? 'today' : 'this week'}</th>
                    </tr>
                  </thead>
                  <tbody role="rowgroup">
                    {leaderboardData.length === 0 ? (
                      <tr role="row">
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          No study sessions recorded {period === 'daily' ? 'today' : 'this week'}
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.map((row, index) => (
                        <tr key={row.userId} className="hover:bg-orange-50/20 rounded-lg text-slate-400 transition-colors" role="row">
                          <td className={`px-4 py-2 font-semibold text-center rounded-l-[8px] ${getRankColor(getActualRank(index))}`}>
                            <div className="flex items-center justify-center gap-2">
                              {getRankIcon(getActualRank(index))}
                              <span>{getActualRank(index)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 font-medium text-center flex justify-center items-center gap-2">
                            {row.image ? (
                              <img 
                                src={row.image} 
                                alt={`${row.name}'s profile picture`} 
                                className="w-8 h-8 rounded-[8px] object-cover" 
                              />
                            ) : (
                              <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-[8px]">
                                <UserIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                              </span>
                            )}
                            <span>{row.name}</span>
                          </td>
                          <td className="px-4 py-2 text-center rounded-r-[8px] font-semibold">{row.hours.toFixed(1)}h</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Total Results Info */}
              <div className="text-center mt-4 text-sm text-gray-500">
                Showing {leaderboardData.length} of {pagination.total} students
              </div>
            </>
          )}
        </div>
      </div>
    </NextLayout>
  );
}
