import { useState, useEffect } from 'react';

export interface UserReputation {
  reputationScore: number;
  activityScore: number;
  qualityScore: number;
  trustScore: number;
  botProbability: number;
  verificationLevel: string;
  isFlagged: boolean;
  reputationLevel: string;
  plan?: string;
}

export function useUserReputation(userId?: string) {
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReputation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/reputation/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reputation');
      }
      
      const data = await response.json();
      setReputation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reputation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReputation(userId);
    }
  }, [userId]);

  const getReputationColor = (level: string) => {
    switch (level) {
      case 'LEGENDARY':
        return 'text-purple-600 bg-purple-100';
      case 'EXPERT':
        return 'text-blue-600 bg-blue-100';
      case 'TRUSTED':
        return 'text-green-600 bg-green-100';
      case 'ACTIVE':
        return 'text-yellow-600 bg-yellow-100';
      case 'REGULAR':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'TRUSTED':
        return { text: '✓ Trusted', color: 'bg-green-100 text-green-800' };
      case 'VERIFIED':
        return { text: '✓ Verified', color: 'bg-blue-100 text-blue-800' };
      case 'USER':
        return { text: 'User', color: 'bg-gray-100 text-gray-800' };
      case 'SUSPICIOUS':
        return { text: '⚠ Suspicious', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'New User', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return {
    reputation,
    loading,
    error,
    refetch: () => userId && fetchReputation(userId),
    getReputationColor,
    getVerificationBadge,
  };
} 