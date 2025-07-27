'use client';
import { useEffect, useState, useRef } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export function useStreamStudyTimeTracker(callId?: string) {
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const [dailyHours, setDailyHours] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const sessionStartedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 10; // Maximum 10 retries (10 seconds)
  const authStableRef = useRef(false);
  
  // Store current auth state in refs to avoid closure issues
  const currentUserRef = useRef(user || null);
  const currentIsAuthenticatedRef = useRef(isAuthenticated);
  const currentIsLoadingRef = useRef(isLoading);

  // Update refs when auth state changes
  useEffect(() => {
    currentUserRef.current = user;
    currentIsAuthenticatedRef.current = isAuthenticated;
    currentIsLoadingRef.current = isLoading;
  }, [user, isAuthenticated, isLoading]);

  // Mark auth as stable when we have a user and are not loading
  useEffect(() => {
    if (isAuthenticated && !isLoading && user?.id) {
      authStableRef.current = true;
    } else if (isLoading) {
      authStableRef.current = false;
    }
  }, [isAuthenticated, isLoading, user]);

  // Start tracking when joining a call
  const startTracking = async () => {
    // Get current auth state from refs
    const currentUser = currentUserRef.current;
    const currentIsAuthenticated = currentIsAuthenticatedRef.current;
    const currentIsLoading = currentIsLoadingRef.current;
    
    // Wait for authentication to be stable
    if (!authStableRef.current || !currentUser?.id || !callId || sessionStartedRef.current) {
      // If auth is not stable yet and we haven't exceeded max retries, retry after a short delay
      if (!authStableRef.current && callId && !sessionStartedRef.current && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          startTracking();
        }, 1000);
      } else if (retryCountRef.current >= maxRetries) {
        console.error('Max retries exceeded. Authentication failed to stabilize.');
      }
      return;
    }
    
    // Reset retry count on success
    retryCountRef.current = 0;
    
    try {
      const response = await fetch('/api/study-sessions/stream-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          callId,
          action: 'start',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsTracking(true);
        sessionStartedRef.current = true;
      } else {
        console.error('Failed to start study session:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to start study session with Stream duration:', error);
    }
  };

  // End tracking when leaving a call
  const endTracking = async () => {
    if (!user?.id || !callId || !sessionStartedRef.current) {
      return;
    }
    
    try {
      const response = await fetch('/api/study-sessions/stream-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          callId,
          action: 'end',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsTracking(false);
        sessionStartedRef.current = false;
        // Refresh daily hours after ending session
        await fetchDailyHours();
      } else {
        console.error('Failed to end study session:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to end study session with Stream duration:', error);
    }
  };

  // Fetch current daily study hours
  const fetchDailyHours = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingHours(true);
      const response = await fetch(`/api/study-sessions/stream-duration?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setDailyHours(data.hours);
      }
    } catch (error) {
      console.error('Failed to fetch daily hours:', error);
    } finally {
      setIsLoadingHours(false);
    }
  };

  // Load daily hours on mount and user change
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      fetchDailyHours();
    }
  }, [user?.id, isAuthenticated]);

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
      // Cleanup retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      // Reset retry count and auth refs
      retryCountRef.current = 0;
      authStableRef.current = false;
      currentUserRef.current = null;
      currentIsAuthenticatedRef.current = false;
      currentIsLoadingRef.current = true;
    };
  }, []);

  return {
    dailyHours,
    isTracking,
    isLoadingHours,
    startTracking,
    endTracking,
    refreshDailyHours: fetchDailyHours,
  };
} 