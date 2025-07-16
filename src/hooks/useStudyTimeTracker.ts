'use client';
import { useEffect, useState, useRef } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export function useStudyTimeTracker(callId?: string) {
  const { user } = useKindeBrowserClient();
  const [dailyHours, setDailyHours] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const sessionStartedRef = useRef(false);

  // Start tracking when joining a call
  const startTracking = async () => {
    if (!user?.id || !callId || sessionStartedRef.current) return;
    
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          callId,
          action: 'start',
        }),
      });
      
      if (response.ok) {
        setIsTracking(true);
        sessionStartedRef.current = true;
        console.log('Study session started');
      }
    } catch (error) {
      console.error('Failed to start study session:', error);
    }
  };

  // End tracking when leaving a call
  const endTracking = async () => {
    if (!user?.id || !callId || !sessionStartedRef.current) return;
    
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          callId,
          action: 'end',
        }),
      });
      
      if (response.ok) {
        setIsTracking(false);
        sessionStartedRef.current = false;
        console.log('Study session ended');
        // Refresh daily hours after ending session
        await fetchDailyHours();
      }
    } catch (error) {
      console.error('Failed to end study session:', error);
    }
  };

  // Fetch current daily study hours
  const fetchDailyHours = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/study-sessions?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setDailyHours(data.hours);
      }
    } catch (error) {
      console.error('Failed to fetch daily hours:', error);
    }
  };

  // Load daily hours on mount and user change
  useEffect(() => {
    if (user?.id) {
      fetchDailyHours();
    }
  }, [user?.id]);

  // Auto-refresh daily hours every 5 minutes while tracking
  useEffect(() => {
    if (!isTracking) return;
    
    const interval = setInterval(fetchDailyHours, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [isTracking, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionStartedRef.current) {
        endTracking();
      }
    };
  }, []);

  return {
    dailyHours,
    isTracking,
    startTracking,
    endTracking,
    refreshDailyHours: fetchDailyHours,
  };
} 