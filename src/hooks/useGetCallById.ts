import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

// In-memory cache for call data (in production, use Redis)
const callCache = new Map<string, { call: Call; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client) return;
    
    const loadCall = async () => {
      try {
        // Check cache first
        const cacheKey = Array.isArray(id) ? id[0] : id;
        const cached = callCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setCall(cached.call);
          setIsCallLoading(false);
          return;
        }

        // Fetch from API if not cached or expired
        const { calls } = await client.queryCalls({ filter_conditions: { id } });

        if (calls.length > 0) {
          const callData = calls[0];
          setCall(callData);
          
          // Cache the result
          callCache.set(cacheKey, { call: callData, timestamp: Date.now() });
        }

        setIsCallLoading(false);
      } catch (error) {
        console.error('Error loading call:', error);
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [client, id]);

  // Clean up old cache entries periodically
  useEffect(() => {
    const cleanupCache = () => {
      const now = Date.now();
      for (const [key, value] of Array.from(callCache.entries())) {
        if (now - value.timestamp > CACHE_DURATION) {
          callCache.delete(key);
        }
      }
    };

    // Clean up every 5 minutes
    const interval = setInterval(cleanupCache, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return { call, isCallLoading };
};
