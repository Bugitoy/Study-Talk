'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export function useStudyTimeTracker(callId?: string) {
  const { user } = useKindeBrowserClient();
  const [dailyMinutes, setDailyMinutes] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const sessionStartedRef = useRef(false);
  const hasEndedRef = useRef(false);

  // Start tracking when joining a call
  const startTracking = useCallback(async () => {
    console.log('🟢 startTracking called with:', { 
      userId: user?.id, 
      callId, 
      sessionStarted: sessionStartedRef.current,
      hasEnded: hasEndedRef.current
    });
    
    if (!user?.id || !callId || sessionStartedRef.current) {
      console.log('🟡 Skipping startTracking - conditions not met:', { 
        hasUser: !!user?.id, 
        hasCallId: !!callId, 
        sessionStarted: sessionStartedRef.current 
      });
      return;
    }
    
    try {
      console.log('🟢 Starting study session for user:', user.id, 'call:', callId);
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
        const result = await response.json();
        console.log('🟢 Study session start response:', result);
        setIsTracking(true);
        sessionStartedRef.current = true;
        hasEndedRef.current = false;
        console.log('🟢 Study session started successfully');
      } else {
        console.error('🔴 Failed to start study session, response not ok:', response.status);
      }
    } catch (error) {
      console.error('🔴 Failed to start study session:', error);
    }
  }, [user?.id, callId]);

  // Fetch current daily study minutes
  const fetchDailyMinutes = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('📊 Fetching daily minutes for user:', user.id);
      const response = await fetch(`/api/study-sessions?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API response:', data);
        // The API returns { minutes: number }, so we use data.minutes directly
        const minutes = data.minutes || 0;
        console.log('📊 Received daily minutes:', minutes);
        setDailyMinutes(minutes);
      }
    } catch (error) {
      console.error('🔴 Failed to fetch daily minutes:', error);
    }
  }, [user?.id]);

  // End tracking when leaving a call
  const endTracking = useCallback(async () => {
    console.log('🔴 endTracking called with:', { 
      userId: user?.id, 
      callId, 
      sessionStarted: sessionStartedRef.current,
      hasEnded: hasEndedRef.current
    });
    
    if (!user?.id || !callId || !sessionStartedRef.current || hasEndedRef.current) {
      console.log('🟡 Skipping endTracking - conditions not met:', { 
        hasUser: !!user?.id, 
        hasCallId: !!callId, 
        sessionStarted: sessionStartedRef.current,
        hasEnded: hasEndedRef.current
      });
      return;
    }
    
    try {
      console.log('🔴 Ending study session for user:', user.id, 'call:', callId);
      hasEndedRef.current = true;
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
        const result = await response.json();
        console.log('🔴 Study session end response:', result);
        setIsTracking(false);
        sessionStartedRef.current = false;
        console.log('🔴 Study session ended successfully');
        // Refresh daily minutes after ending session
        await fetchDailyMinutes();
      } else {
        console.error('🔴 Failed to end study session, response not ok:', response.status);
        hasEndedRef.current = false; // Reset flag if failed
      }
    } catch (error) {
      console.error('🔴 Failed to end study session:', error);
      hasEndedRef.current = false; // Reset flag if failed
    }
  }, [user?.id, callId, fetchDailyMinutes]);

  // Load daily minutes on mount and user change
  useEffect(() => {
    if (user?.id) {
      console.log('useEffect - fetching daily minutes for user:', user.id);
      fetchDailyMinutes();
    }
  }, [user?.id, fetchDailyMinutes]);

  // Auto-refresh daily minutes every 5 minutes while tracking
  useEffect(() => {
    if (!isTracking) return;
    
    console.log('Setting up auto-refresh for daily minutes');
    const interval = setInterval(fetchDailyMinutes, 5 * 60 * 1000); // 5 minutes
    return () => {
      console.log('Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [isTracking, user?.id, fetchDailyMinutes]);

  return {
    dailyMinutes,
    isTracking,
    startTracking,
    endTracking,
    refreshDailyMinutes: fetchDailyMinutes,
  };
} 