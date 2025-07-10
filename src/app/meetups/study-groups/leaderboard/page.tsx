import React from 'react';
import NextLayout from '@/components/NextLayout';
import { User as UserIcon } from 'lucide-react';

const leaderboardData = [
  { rank: 1, user: 'Yola', hours7d: 9, total: '600 days', profilePic: '/Images/temp-profiles/profile1.png' },
  { rank: 2, user: 'Nia', hours7d: 7, total: '373 days', profilePic: '' },
  { rank: 3, user: 'Koa', hours7d: 6, total: '400 days', profilePic: '' },
  { rank: 4, user: 'Lia', hours7d: 4, total: '512 days', profilePic: '' },
  { rank: 5, user: 'Mica', hours7d: 3, total: '341 days', profilePic: '' },
  { rank: 6, user: 'Hilo', hours7d: 2, total: '299 days', profilePic: '' },
  { rank: 7, user: 'Exa', hours7d: 2, total: '299 days', profilePic: '' },
  { rank: 8, user: 'Ita', hours7d: 1, total: '125 days', profilePic: '' },
  { rank: 9, user: 'Miko', hours7d: 0, total: '30 days', profilePic: '' },
];

export default function LeaderboardPage() {
  return (
    <NextLayout>
      <div className="min-h-screen py-10 px-2">
        <div className="max-w-3xl mx-auto rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Leaderboard</h1>
          <p className="text-center text-gray-500 mb-6">Top students by hours studied</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-600 text-center text-sm">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Hours studied in the last 7 days</th>
                  <th className="px-4 py-2">Total hours studied</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((row) => (
                  <tr key={row.rank} className="hover:bg-thanodi-peach/20 rounded-lg text-slate-400">
                    <td className="px-4 py-2 font-semibold text-center rounded-l-[8px]">{row.rank}</td>
                    <td className="px-4 py-2 font-medium text-center flex justify-items-start gap-2 ml-[2rem]">
                      {row.profilePic ? (
                        <img src={row.profilePic} alt={row.user} className="w-8 h-8 mr-[10px] rounded-[8px] object-cover" />
                      ) : (
                        <span className="w-8 h-8 mr-[10px] flex items-center justify-center bg-white rounded-[8px]">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        </span>
                      )}
                      <span>{row.user}</span>
                    </td>
                    <td className="px-4 py-2 text-center">{row.hours7d}</td>
                    <td className="px-4 py-2 text-center rounded-r-[8px]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </NextLayout>
  );
}
