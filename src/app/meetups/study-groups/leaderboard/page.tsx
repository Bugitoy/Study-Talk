'use client';
import React, { useState, useEffect } from 'react';
import NextLayout from '@/components/NextLayout';
import { User as UserIcon } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  name: string;
  image?: string;
  hours: number;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leaderboard?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  return (
    <NextLayout>
      <div className="min-h-screen py-10 px-2">
        <div className="max-w-3xl mx-auto rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Leaderboard</h1>
          <p className="text-center text-gray-500 mb-4">Top students by hours studied</p>
          
          {/* Period Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-200 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  period === 'daily'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setPeriod('daily')}
              >
                Today
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  period === 'weekly'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setPeriod('weekly')}
              >
                This Week
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading leaderboard...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-600 text-center text-sm">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Hours studied {period === 'daily' ? 'today' : 'this week'}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No study sessions recorded {period === 'daily' ? 'today' : 'this week'}
                    </td>
                  </tr>
                ) : (
                  leaderboardData.map((row, index) => (
                  <tr key={row.userId} className="hover:bg-thanodi-peach/20 rounded-lg text-slate-400">
                    <td className="px-4 py-2 font-semibold text-center rounded-l-[8px]">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-center flex justify-items-start gap-2 ml-[2rem]">
                      {row.image ? (
                        <img src={row.image} alt={row.name} className="w-8 h-8 mr-[10px] rounded-[8px] object-cover" />
                      ) : (
                        <span className="w-8 h-8 mr-[10px] flex items-center justify-center bg-white rounded-[8px]">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        </span>
                      )}
                      <span>{row.name}</span>
                    </td>
                    <td className="px-4 py-2 text-center rounded-r-[8px]">{row.hours.toFixed(1)}h</td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </NextLayout>
  );
}
