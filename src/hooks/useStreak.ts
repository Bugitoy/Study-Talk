import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalStudyDays: number;
}

export const useStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalStudyDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useKindeBrowserClient();

  const fetchStreakData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/user/streak?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setStreakData(data);
      }
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/user/streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setStreakData(updatedData);
        return updatedData;
      }
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStreakData();
    }
  }, [user?.id]);

  return {
    streakData,
    loading,
    updateStreak,
    refetch: fetchStreakData,
  };
}; 