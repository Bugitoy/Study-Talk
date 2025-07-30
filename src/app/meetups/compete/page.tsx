"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

import NextLayout from "@/components/NextLayout";
import GroupCard from "@/components/group";
import MeetingModal from "@/components/MeetingModal";
import { useCompeteRooms } from "@/hooks/useCompeteRooms";
import { useStreamStudyTimeTracker } from '@/hooks/useStreamStudyTimeTracker';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';

// Simple debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const pastelColors = [
  "bg-thanodi-lightPeach",
  "bg-thanodi-blue",
  "bg-thanodi-peach",
  "bg-thanodi-yellow",
  "bg-thanodi-lightPeach",
  "bg-thanodi-blue",
];

// Validation configuration for compete meeting links
const COMPETE_MEETING_LINK_CONFIG = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 500,
  ALLOWED_PROTOCOLS: ['http:', 'https:'],
  ALLOWED_DOMAINS: ['localhost:8080', 'study-talk.com', 'www.study-talk.com'],
  REQUIRED_PATH_SEGMENTS: ['meetups', 'compete', 'room'],
  CALL_ID_PATTERN: /^[0-9a-f]{24}$/i, // MongoDB ObjectId format (24 hex characters)
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  MAX_PARAM_LENGTH: 100,
  MAX_ATTEMPTS: 15,
  ATTEMPT_RESET_TIME: 30000, // 30 seconds
};

// Search validation configuration for compete page
const COMPETE_SEARCH_CONFIG = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  MAX_ATTEMPTS: 50,
  ATTEMPT_RESET_TIME: 15000, // 15 seconds
};

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

const Compete = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (isSetupComplete: boolean) => void;
}) => {
  const [search, setSearch] = useState("");
  const [meetingLinkError, setMeetingLinkError] = useState<string>("");
  const [isMeetingLinkValid, setIsMeetingLinkValid] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [verificationCache, setVerificationCache] = useState<Map<string, { valid: boolean; timestamp: number }>>(new Map());

  // Search validation state
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearchValid, setIsSearchValid] = useState(true);
  const [searchError, setSearchError] = useState("");

  const router = useRouter();
  const [meetingState, setMeetingState] = useState<"isJoiningMeeting" | undefined>(undefined);
  const [values, setValues] = useState(initialValues);
  const rooms = useCompeteRooms();
  const { user, isAuthenticated } = useKindeBrowserClient();
  const { dailyHours, isLoadingHours } = useStreamStudyTimeTracker();
  const { user: userInfo, loading: userLoading } = useCurrentUser();
  const { toast } = useToast();

  // Check if user has reached their daily study limit
  const isFreeUser = userInfo?.plan === 'free';
  const isPlusUser = userInfo?.plan === 'plus';
  const hasReachedFreeLimit = isFreeUser && (dailyHours ?? 0) >= 3;
  const hasReachedPlusLimit = isPlusUser && (dailyHours ?? 0) >= 15;
  const shouldDisableButtons = ((isFreeUser && hasReachedFreeLimit) || (isPlusUser && hasReachedPlusLimit)) && !userLoading;

  // Remove development logging - only log security events
  const logServerEvent = useCallback(async (event: string, details: any) => {
    const securityEvents = [
      'RATE_LIMIT_EXCEEDED',
      'INVALID_SUBMISSION_ATTEMPT',
      'FINAL_VALIDATION_FAILED',
      'NETWORK_ERROR_FALLBACK',
      'MEETING_NOT_FOUND',
      'MEETING_JOIN_ERROR'
    ];
    
    // Only log security events, not search events
    if (!securityEvents.includes(event)) {
      return;
    }

    try {
      await fetch('/api/logging/compete-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          details,
          timestamp: new Date().toISOString(),
          userId: user?.id || 'anonymous',
        }),
      });
    } catch (error) {
      // Silently fail - don't expose logging errors to client
    }
  }, [user?.id]);

  // Enhanced error handling with retry logic
  const retryOperation = useCallback(async (
    operation: () => Promise<any>, 
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
  }, []);

  // Performance monitoring
  const logSearchPerformance = useCallback((searchTerm: string, duration: number) => {
    if (duration > 1000) { // Log slow searches
      logServerEvent('SLOW_SEARCH_DETECTED', {
        searchLength: searchTerm.length,
        duration,
        timestamp: new Date().toISOString()
      });
    }
  }, [logServerEvent]);

  // Sanitize search input
  const sanitizeSearch = useCallback((value: string): string => {
    // Remove forbidden special characters
    let sanitized = value.replace(COMPETE_SEARCH_CONFIG.FORBIDDEN_CHARS, '');
    
    // Normalize spaces (replace multiple spaces with single space)
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Limit consecutive spaces
    while (sanitized.includes('  ')) {
      sanitized = sanitized.replace('  ', ' ');
    }
    
    // Trim whitespace
    return sanitized.trim();
  }, []);

  // Validate search input
  const validateSearch = useCallback((value: string): { isValid: boolean; error: string } => {
    if (value.length < COMPETE_SEARCH_CONFIG.MIN_LENGTH) {
      return { isValid: false, error: 'Search term is too short' };
    }
    
    if (value.length > COMPETE_SEARCH_CONFIG.MAX_LENGTH) {
      return { isValid: false, error: 'Search term is too long' };
    }
    
    // Check for excessive consecutive spaces
    if (value.includes('  ')) {
      return { isValid: false, error: 'Too many consecutive spaces' };
    }
    
    // Check for forbidden characters
    if (COMPETE_SEARCH_CONFIG.FORBIDDEN_CHARS.test(value)) {
      return { isValid: false, error: 'Search contains invalid characters' };
    }
    
    return { isValid: true, error: '' };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [search]);

  // Check if user is blocked
  useEffect(() => {
    if (user?.id) {
      const checkBlockStatus = async () => {
        try {
          const res = await fetch(`/api/user/check-block?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.isBlocked) {
              toast({
                title: 'Account Blocked',
                description: 'Your account has been blocked by an administrator. You cannot join or create compete rooms.',
                variant: 'destructive',
              });
              router.push('/');
            }
          }
        } catch (error) {
          console.error('Error checking block status:', error);
        }
      };
      
      checkBlockStatus();
    }
  }, [user?.id]);

  // Validate compete meeting link
  const validateCompeteMeetingLink = useCallback((link: string): { isValid: boolean; error: string; sanitizedLink?: string } => {
    // Check length
    if (link.length < COMPETE_MEETING_LINK_CONFIG.MIN_LENGTH) {
      return { isValid: false, error: 'Meeting link is too short' };
    }
    if (link.length > COMPETE_MEETING_LINK_CONFIG.MAX_LENGTH) {
      return { isValid: false, error: 'Meeting link is too long' };
    }

    // Check for forbidden characters
    if (COMPETE_MEETING_LINK_CONFIG.FORBIDDEN_CHARS.test(link)) {
      return { isValid: false, error: 'Meeting link contains invalid characters' };
    }

    // Try to parse as URL
    let url: URL;
    try {
      url = new URL(link);
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }

    // Check protocol
    if (!COMPETE_MEETING_LINK_CONFIG.ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Check domain
    const isValidDomain = COMPETE_MEETING_LINK_CONFIG.ALLOWED_DOMAINS.some(domain =>
      url.host === domain || url.host.endsWith(`.${domain}`)
    );
    if (!isValidDomain) {
      return { isValid: false, error: 'Invalid domain. Only study-talk.com links are allowed' };
    }

    // Check path segments
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    for (let i = 0; i < COMPETE_MEETING_LINK_CONFIG.REQUIRED_PATH_SEGMENTS.length; i++) {
      if (pathSegments[i] !== COMPETE_MEETING_LINK_CONFIG.REQUIRED_PATH_SEGMENTS[i]) {
        return { isValid: false, error: 'Invalid meeting link format' };
      }
    }

    // Check call ID format
    const callId = pathSegments[COMPETE_MEETING_LINK_CONFIG.REQUIRED_PATH_SEGMENTS.length];
    if (!callId || !COMPETE_MEETING_LINK_CONFIG.CALL_ID_PATTERN.test(callId)) {
      return { isValid: false, error: 'Invalid call ID format' };
    }

    // Check query parameters for potential security issues
    const searchParams = url.searchParams;
    for (const [key, value] of Array.from(searchParams.entries())) {
      if (value.length > COMPETE_MEETING_LINK_CONFIG.MAX_PARAM_LENGTH) {
        return { isValid: false, error: 'Query parameters are too long' };
      }
      const dangerousParams = ['script', 'javascript', 'data', 'vbscript'];
      if (dangerousParams.some(param => key.toLowerCase().includes(param) || value.toLowerCase().includes(param))) {
        return { isValid: false, error: 'Meeting link contains potentially unsafe parameters' };
      }
    }

    // Sanitize the link (remove extra spaces, normalize)
    const sanitizedLink = link.trim().replace(/\s+/g, ' ');
    
    return { isValid: true, error: '', sanitizedLink };
  }, []);

  // Verify compete meeting exists on server
  const verifyCompeteMeetingExists = useCallback(async (callId: string): Promise<{ exists: boolean; isNetworkError: boolean }> => {
    const cached = verificationCache.get(callId);
    if (cached && Date.now() - cached.timestamp < 300000) { // Cache for 5 minutes
      return { exists: cached.valid, isNetworkError: false };
    }

    try {
      const response = await fetch(`/api/compete-rooms/verify/${callId}`);
      const isValid = response.ok;
      
      // Cache the result
      setVerificationCache(prev => new Map(prev).set(callId, { 
        valid: isValid, 
        timestamp: Date.now() 
      }));
      
      return { exists: isValid, isNetworkError: false };
    } catch (error) {
      console.error('Error verifying compete meeting:', error);
      // Don't cache network errors
      return { exists: false, isNetworkError: true };
    }
  }, [verificationCache]);

  // Handle compete meeting link input change
  const handleCompeteMeetingLinkChange = useCallback((value: string) => {
    const validation = validateCompeteMeetingLink(value);
    
    setValues({ ...values, link: value });
    setIsMeetingLinkValid(validation.isValid);
    setMeetingLinkError(validation.error);
    
    // Log meeting link validation attempts
    if (value.length > 0) {
      logServerEvent('COMPETE_MEETING_LINK_VALIDATION', {
        linkLength: value.length,
        isValid: validation.isValid,
        error: validation.error,
        hasDomain: value.includes('study-talk.com') || value.includes('localhost')
      });
    }
    
    // Update with sanitized link if valid
    if (validation.isValid && validation.sanitizedLink) {
      setValues({ ...values, link: validation.sanitizedLink });
    }
  }, [values, validateCompeteMeetingLink, logServerEvent]);

  // Handle compete meeting link submission
  const handleCompeteMeetingLinkSubmit = useCallback(async () => {
    // Check rate limiting for meeting link input
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    if (timeSinceLastAttempt < COMPETE_MEETING_LINK_CONFIG.ATTEMPT_RESET_TIME) {
      if (attemptCount >= COMPETE_MEETING_LINK_CONFIG.MAX_ATTEMPTS) {
        const timeRemaining = Math.ceil((COMPETE_MEETING_LINK_CONFIG.ATTEMPT_RESET_TIME - timeSinceLastAttempt) / 1000);
        logServerEvent('COMPETE_RATE_LIMIT_EXCEEDED', {
          attemptCount,
          timeRemaining
        });
        toast({
          title: 'Too Many Attempts',
          description: `Please wait ${timeRemaining} seconds before trying again`,
          variant: 'destructive',
        });
        return;
      }
    } else {
      // Reset rate limiting if enough time has passed
      setAttemptCount(0);
      setIsRateLimited(false);
    }

    // Check if button should be disabled
    if (!isMeetingLinkValid || !values.link.trim() || isProcessingLink) {
      logServerEvent('COMPETE_INVALID_SUBMISSION_ATTEMPT', {
        isValid: isMeetingLinkValid,
        hasLink: !!values.link.trim(),
        isProcessing: isProcessingLink,
        error: meetingLinkError
      });
      
      if (!values.link.trim()) {
        toast({
          title: 'Meeting Link Required',
          description: 'Please enter a meeting link',
          variant: 'destructive',
        });
      } else if (!isMeetingLinkValid) {
        toast({
          title: 'Invalid Meeting Link',
          description: meetingLinkError || 'Please enter a valid meeting link',
          variant: 'destructive',
        });
      }
      return;
    }

    setIsProcessingLink(true);
    setAttemptCount(prev => prev + 1);
    setLastAttemptTime(now);
    
    logServerEvent('COMPETE_MEETING_LINK_SUBMISSION', {
      linkLength: values.link.length,
      attemptCount: attemptCount + 1
    });
    
    try {
      // Validate the link one more time before navigation
      const validation = validateCompeteMeetingLink(values.link);
      if (!validation.isValid) {
        logServerEvent('COMPETE_FINAL_VALIDATION_FAILED', {
          error: validation.error
        });
        toast({
          title: 'Invalid Meeting Link',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      // Extract call ID from URL
      const url = new URL(values.link);
      const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
      const callId = pathSegments[COMPETE_MEETING_LINK_CONFIG.REQUIRED_PATH_SEGMENTS.length];

      // Verify meeting exists on server
      const { exists, isNetworkError } = await verifyCompeteMeetingExists(callId);
      
      if (isNetworkError) {
        // Fallback: Allow navigation with warning for network errors
        logServerEvent('COMPETE_NETWORK_ERROR_FALLBACK', {
          callId,
          originalLink: values.link
        });
        toast({
          title: 'Network Issue',
          description: 'Unable to verify meeting. Proceeding with caution.',
          variant: 'destructive',
        });
        // Still navigate but with warning
        router.push(values.link);
        return;
      }
      
      if (!exists) {
        logServerEvent('COMPETE_MEETING_NOT_FOUND', {
          callId,
          originalLink: values.link
        });
        toast({
          title: 'Meeting Not Found',
          description: 'This meeting may no longer be available or you may not have permission to join',
          variant: 'destructive',
        });
        return;
      }

      // Log successful verification
      logServerEvent('COMPETE_MEETING_VERIFICATION_SUCCESS', {
        callId,
        originalLink: values.link
      });

      // Navigate to the meeting
      router.push(values.link);
    } catch (error) {
      console.error('Error joining compete meeting:', error);
      logServerEvent('COMPETE_MEETING_JOIN_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        originalLink: values.link
      });
      toast({
        title: 'Error Joining Meeting',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingLink(false);
    }
  }, [values.link, isMeetingLinkValid, meetingLinkError, validateCompeteMeetingLink, router, toast, lastAttemptTime, verifyCompeteMeetingExists, logServerEvent, attemptCount]);

  // Clear compete meeting link
  const clearCompeteMeetingLink = useCallback(() => {
    setValues({ ...values, link: initialValues.link });
    setIsMeetingLinkValid(false);
    setMeetingLinkError("");
  }, [values]);

  // Enhanced search change handler with performance monitoring
  const handleSearchChange = useCallback((value: string) => {
    const startTime = performance.now();
    
    // Check rate limit for search
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    if (timeSinceLastAttempt < COMPETE_SEARCH_CONFIG.ATTEMPT_RESET_TIME) {
      if (attemptCount >= COMPETE_SEARCH_CONFIG.MAX_ATTEMPTS) {
        const timeRemaining = Math.ceil((COMPETE_SEARCH_CONFIG.ATTEMPT_RESET_TIME - timeSinceLastAttempt) / 1000);
        setSearchError(`Too many search attempts. Please wait ${timeRemaining} seconds.`);
        return;
      }
    } else {
      // Reset rate limiting if enough time has passed
      setAttemptCount(0);
      setIsRateLimited(false);
    }

    try {
      // Increment attempt count for search
      setAttemptCount(prev => prev + 1);
      setLastAttemptTime(now);
      
      const sanitized = sanitizeSearch(value);
      const validation = validateSearch(sanitized);
      
      setSearch(value);
      setIsSearchValid(validation.isValid);
      setSearchError(validation.error);
      
      // Only update debounced search if valid or empty
      if (validation.isValid || sanitized.length === 0) {
        setDebouncedSearch(sanitized);
      }

      // Performance monitoring (non-blocking)
      const duration = performance.now() - startTime;
      if (duration > 1000) {
        logServerEvent('SLOW_SEARCH_DETECTED', {
          searchLength: value.length,
          duration,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search temporarily unavailable. Please try again.');
      
      // Retry the operation asynchronously
      retryOperation(async () => {
        const sanitized = sanitizeSearch(value);
        const validation = validateSearch(sanitized);
        setDebouncedSearch(sanitized);
        return validation;
      }).catch(retryError => {
        console.error('Search retry failed:', retryError);
        setSearchError('Search service unavailable. Please refresh the page.');
      });
    }
  }, [sanitizeSearch, validateSearch, logServerEvent, retryOperation]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setIsSearchValid(true);
    setSearchError("");
  }, []);

  const filteredRooms = rooms.filter((room) => {
    return room.roomName.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const joinRandomRoom = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to join a random room.',
        variant: 'destructive',
      });
      return;
    }

    if (shouldDisableButtons) {
      const limitMessage = isFreeUser 
        ? 'Free users can only study for 3 hours per day. Upgrade to Plus or Premium for more study time.'
        : 'Plus users can only study for 15 hours per day. Upgrade to Premium for unlimited study time.';
      toast({
        title: 'Daily Limit Reached',
        description: limitMessage,
        variant: 'destructive',
      });
      return;
    }
    
    if (filteredRooms.length === 0) return;
    const randomRoom = filteredRooms[Math.floor(Math.random() * filteredRooms.length)];
    router.push(`/meetups/compete/room/${randomRoom.callId}`);
  };

  const handleJoinRoom = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to join a room.',
        variant: 'destructive',
      });
      return;
    }

    if (shouldDisableButtons) {
      const limitMessage = isFreeUser 
        ? 'Free users can only study for 3 hours per day. Upgrade to Plus or Premium for more study time.'
        : 'Plus users can only study for 15 hours per day. Upgrade to Premium for unlimited study time.';
      toast({
        title: 'Daily Limit Reached',
        description: limitMessage,
        variant: 'destructive',
      });
      return;
    }
    setMeetingState("isJoiningMeeting");
  };

  const handleCreateRoom = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to create a room.',
        variant: 'destructive',
      });
      return;
    }

    if (shouldDisableButtons) {
      const limitMessage = isFreeUser 
        ? 'Free users can only study for 3 hours per day. Upgrade to Plus or Premium for more study time.'
        : 'Plus users can only study for 15 hours per day. Upgrade to Premium for unlimited study time.';
      toast({
        title: 'Daily Limit Reached',
        description: limitMessage,
        variant: 'destructive',
      });
      return;
    }
    router.push("/meetups/compete/create-room");
  };

  const handleRoomJoin = (callId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to join a room.',
        variant: 'destructive',
      });
      return;
    }

    if (shouldDisableButtons) {
      const limitMessage = isFreeUser 
        ? 'Free users can only study for 3 hours per day. Upgrade to Plus or Premium for more study time.'
        : 'Plus users can only study for 15 hours per day. Upgrade to Premium for unlimited study time.';
      toast({
        title: 'Daily Limit Reached',
        description: limitMessage,
        variant: 'destructive',
      });
      return;
    }
    router.push(`/meetups/compete/room/${callId}`);
  };

  return (
    <NextLayout>
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      <main id="main-content" className="flex flex-col gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8" role="main">
        {/* Header Section */}
        <section aria-labelledby="page-heading">
          <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 mb-2">
            <h1 
              id="page-heading"
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-7xl font-extrabold text-lightBlue-100 text-center lg:text-left"
            >
              Compete with people on various topics
            </h1>
            
            {/* Search Section */}
            <div className="relative w-full max-w-xs">
              <label htmlFor="room-search" className="sr-only">
                Search for compete rooms
              </label>
              <Input
                id="room-search"
                placeholder="Search for a study group..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base sm:text-lg shadow-sm transition-colors"
                maxLength={COMPETE_SEARCH_CONFIG.MAX_LENGTH}
                aria-label="Search compete rooms"
                aria-describedby={searchError ? "search-error" : "search-help"}
                role="searchbox"
                aria-invalid={!isSearchValid}
                aria-required="false"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    clearSearch();
                    e.currentTarget.blur();
                  }
                }}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              {/* Search character count */}
              {search && (
                <div className={`text-xs mt-1 ${
                  search.length > COMPETE_SEARCH_CONFIG.MAX_LENGTH * 0.8 
                    ? 'text-yellow-600' 
                    : 'text-gray-400'
                }`}>
                  {search.length}/{COMPETE_SEARCH_CONFIG.MAX_LENGTH} characters
                </div>
              )}
              {/* Accessibility help text */}
              <div id="search-help" className="sr-only">
                Search for compete rooms. Use up to {COMPETE_SEARCH_CONFIG.MAX_LENGTH} characters.
              </div>
              {/* Error message for screen readers */}
              {searchError && (
                <div id="search-error" className="sr-only" role="alert" aria-live="polite">
                  {searchError}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Action Buttons Section */}
        <section aria-labelledby="action-buttons-heading">
          <h2 id="action-buttons-heading" className="sr-only">Room Actions</h2>
          <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center mb-4 gap-3 sm:gap-4">
            <div className="flex flex-row w-full gap-2 sm:gap-4 lg:gap-8" role="group" aria-label="Room action buttons">
              <button
                className={`flex-grow h-[60px] sm:h-[70px] lg:h-[80px] rounded-lg cursor-pointer select-none
                          transition-all duration-150 border-b-[1px] shadow ${
                            !isAuthenticated 
                              ? 'bg-gray-300 cursor-not-allowed border-gray-400'
                              : shouldDisableButtons
                              ? 'bg-gray-300 cursor-not-allowed border-gray-400'
                              : 'active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941] active:border-b-[0px] [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941] border-yellow-400 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                          }`}
                onClick={joinRandomRoom}
                disabled={!isAuthenticated || shouldDisableButtons}
                aria-label={isAuthenticated ? "Join a random compete room" : "Login required to join random room"}
                aria-describedby={!isAuthenticated ? "login-required" : undefined}
              >
                <span className={`flex flex-col justify-center items-center h-full font-bold text-xs sm:text-base lg:text-lg ${
                  isAuthenticated && !shouldDisableButtons ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  Random room
                </span>
              </button>

              <button
                className={`flex-grow h-[60px] sm:h-[70px] lg:h-[80px] rounded-lg cursor-pointer select-none
                    transition-all duration-150 border-b-[1px] shadow ${
                      !isAuthenticated 
                        ? 'bg-gray-300 cursor-not-allowed border-gray-400'
                        : shouldDisableButtons
                        ? 'bg-gray-300 cursor-not-allowed border-gray-400'
                        : 'active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941] active:border-b-[0px] [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941] border-yellow-400 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    }`}
                onClick={handleJoinRoom}
                disabled={!isAuthenticated || shouldDisableButtons}
                aria-label={isAuthenticated ? "Join a specific compete room" : "Login required to join room"}
                aria-describedby={!isAuthenticated ? "login-required" : undefined}
              >
                <span className={`flex flex-col justify-center items-center h-full font-bold text-xs sm:text-base lg:text-lg ${
                  isAuthenticated && !shouldDisableButtons ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  Join a room
                </span>
              </button>

              <button
                className={`flex-grow h-[60px] sm:h-[70px] lg:h-[80px] rounded-lg cursor-pointer select-none
                  transition-all duration-150 border-b-[1px] shadow ${
                    !isAuthenticated 
                      ? 'bg-gray-300 cursor-not-allowed border-gray-400'
                      : shouldDisableButtons
                      ? 'bg-gray-300 cursor-not-allowed border-gray-400'
                      : 'active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941] active:border-b-[0px] [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941] border-yellow-400 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                onClick={handleCreateRoom}
                disabled={!isAuthenticated || shouldDisableButtons}
                aria-label={isAuthenticated ? "Create a new compete room" : "Login required to create room"}
                aria-describedby={!isAuthenticated ? "login-required" : undefined}
              >
                <span className={`flex flex-col justify-center items-center h-full font-bold text-xs sm:text-base lg:text-lg ${
                  isAuthenticated && !shouldDisableButtons ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  Create a room
                </span>
              </button>
            </div>
          </div>
          
          {/* Daily limit warning for free and plus users */}
          {shouldDisableButtons && !userLoading && (
            <div className="w-full flex justify-center mt-2">
              <div className="bg-orange-100 border border-orange-300 text-orange-700 px-3 py-2 rounded-lg text-sm">
                ⚠️ You've reached your daily study limit ({isFreeUser ? '3 hours' : '15 hours'}). {isFreeUser ? 'Upgrade to Plus or Premium' : 'Upgrade to Premium'} for more study time.
              </div>
            </div>
          )}
          
          {/* Login required message for screen readers */}
          {!isAuthenticated && (
            <div id="login-required" className="sr-only">
              Login required to access this feature
            </div>
          )}
        </section>

        {/* Rooms Grid Section */}
        <section aria-labelledby="rooms-heading">
          <h2 id="rooms-heading" className="sr-only">Available Compete Rooms</h2>
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8" role="list" aria-label="Available compete rooms">
            {filteredRooms.length === 0 && (
              <div className="text-center text-gray-500 col-span-full" role="status" aria-live="polite">
                <p>No public rooms available</p>
              </div>
            )}
            {filteredRooms.map((room, i) => (
              <div key={room.callId} role="listitem">
                <GroupCard
                  title={room.roomName}
                  peopleCount={room.members.length}
                  profilePics={room.members}
                  onJoin={() => handleRoomJoin(room.callId)}
                  color={pastelColors[i % pastelColors.length]}
                  isAuthenticated={isAuthenticated ?? undefined}
                  aria-label={`Join ${room.roomName} room with ${room.members.length} members`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Meeting Modal */}
        <MeetingModal
          isOpen={meetingState === "isJoiningMeeting"}
          onClose={() => { setMeetingState(undefined); clearCompeteMeetingLink(); }}
          title="Type the link here"
          className="text-center"
          buttonText={isProcessingLink ? "Joining..." : isRateLimited ? "Rate Limited" : "Join Meeting"}
          handleClick={handleCompeteMeetingLinkSubmit}
        >
          <div className="space-y-3">
            <div className="relative">
              <label htmlFor="meeting-link" className="sr-only">
                Meeting Link
              </label>
              <Input
                id="meeting-link"
                placeholder="Meeting Link"
                onChange={(e) => handleCompeteMeetingLinkChange(e.target.value)}
                value={values.link}
                className={`border-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px] text-center text-xs text-gray-800 transition-colors ${
                  meetingLinkError
                    ? 'border-red-400 focus:border-red-500'
                    : isMeetingLinkValid && values.link.trim()
                      ? 'border-green-400 focus:border-green-500'
                      : 'border-gray-200 focus:border-blue-400'
                }`}
                disabled={isProcessingLink || isRateLimited}
                aria-label="Enter meeting link"
                aria-describedby={meetingLinkError ? "meeting-link-error" : isMeetingLinkValid && values.link.trim() ? "meeting-link-success" : "meeting-link-help"}
                aria-invalid={!!meetingLinkError}
              />
              {values.link && !isRateLimited && (
                <button
                  onClick={clearCompeteMeetingLink}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isProcessingLink}
                  aria-label="Clear meeting link"
                >
                  ✕
                </button>
              )}
            </div>
            {meetingLinkError && (
              <div id="meeting-link-error" className="text-red-500 text-sm text-center" role="alert" aria-live="polite">
                {meetingLinkError}
              </div>
            )}
            {isRateLimited && (
              <div className="text-orange-500 text-sm text-center" role="alert" aria-live="polite">
                Too many attempts. Please wait before trying again.
              </div>
            )}
            {values.link && !meetingLinkError && isMeetingLinkValid && !isRateLimited && (
              <div id="meeting-link-success" className="text-green-500 text-sm text-center" role="status" aria-live="polite">
                ✓ Valid meeting link
              </div>
            )}
            <div id="meeting-link-help" className="sr-only">
              Enter a valid study-talk.com meeting link
            </div>
          </div>
        </MeetingModal>
      </main>
    </NextLayout>
  );
};

export default Compete;
