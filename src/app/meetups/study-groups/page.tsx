'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import NextLayout from '@/components/NextLayout';
import GroupCard from '@/components/group';
import MeetingModal from '@/components/MeetingModal';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { useStreamStudyTimeTracker } from '@/hooks/useStreamStudyTimeTracker';
import { useStreak } from '@/hooks/useStreak';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Search, X } from 'lucide-react';

const pastelColors = [
  'bg-thanodi-lightPeach',
  'bg-thanodi-blue',
  'bg-thanodi-peach',
  'bg-thanodi-yellow',
  'bg-thanodi-lightPeach',
  'bg-thanodi-blue',
];

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '',
  };

// Validation constants
const SEARCH_CONFIG = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  MAX_ATTEMPTS: 20,
  ATTEMPT_RESET_TIME: 30000, // 30 seconds
};

// Meeting link validation constants
const MEETING_LINK_CONFIG = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 500,
  ALLOWED_PROTOCOLS: ['http:', 'https:'],
  ALLOWED_DOMAINS: ['localhost:8080', 'study-talk.com', 'www.study-talk.com'],
  REQUIRED_PATH_SEGMENTS: ['meetups', 'study-groups', 'meeting'],
  UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  MAX_PARAM_LENGTH: 100,
  MAX_ATTEMPTS: 5,
  ATTEMPT_RESET_TIME: 60000, // 1 minute
};

const StudyGroups = () => {
  const { dailyHours, isLoadingHours } = useStreamStudyTimeTracker();
  const { streakData, loading: streakLoading } = useStreak();
  const hoursGoal = 10; // Daily goal in hours
  const percent = Math.min((dailyHours / hoursGoal) * 100, 100);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearchValid, setIsSearchValid] = useState(true);
  const router = useRouter();
  const [meetingState, setMeetingState] = useState< 'isJoiningMeeting' | undefined >(undefined);
  const [values, setValues] = useState(initialValues);
  const [meetingLinkError, setMeetingLinkError] = useState('');
  const [isMeetingLinkValid, setIsMeetingLinkValid] = useState(true);
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [verificationCache, setVerificationCache] = useState<Map<string, { valid: boolean; timestamp: number }>>(new Map());
  const { user, isAuthenticated } = useKindeBrowserClient();
  const { toast } = useToast();

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
      await fetch('/api/logging/study-groups-events', {
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

  const groups = useStudyGroups();
  const filteredGroups = groups.filter(g => g.roomName.toLowerCase().includes(debouncedSearch.toLowerCase()));

  // Show 0 for non-authenticated users, or loading state for authenticated users
  const displayHours = isAuthenticated ? (isLoadingHours ? 0 : dailyHours) : 0;
  const displayPercent = isAuthenticated ? (isLoadingHours ? 0 : percent) : 0;
  const displayStreakData = isAuthenticated ? streakData : {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalStudyDays: 0,
  };

  // Rate limiting check for search
  const checkSearchRateLimit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    if (timeSinceLastAttempt < SEARCH_CONFIG.ATTEMPT_RESET_TIME) {
      if (attemptCount >= SEARCH_CONFIG.MAX_ATTEMPTS) {
        setIsRateLimited(true);
        return true; // Rate limited
      }
    } else {
      setAttemptCount(0);
      setIsRateLimited(false);
    }
    
    setAttemptCount(prev => prev + 1);
    setLastAttemptTime(now);
    return false; // Not rate limited
  }, [lastAttemptTime, attemptCount]);

  // Rate limiting check for meeting link
  const checkMeetingLinkRateLimit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    if (timeSinceLastAttempt < MEETING_LINK_CONFIG.ATTEMPT_RESET_TIME) {
      if (attemptCount >= MEETING_LINK_CONFIG.MAX_ATTEMPTS) {
        setIsRateLimited(true);
        return true; // Rate limited
      }
    } else {
      setAttemptCount(0);
      setIsRateLimited(false);
    }
    
    setAttemptCount(prev => prev + 1);
    setLastAttemptTime(now);
    return false; // Not rate limited
  }, [lastAttemptTime, attemptCount]);

  // Validation function
  const validateSearch = useCallback((value: string): { isValid: boolean; error: string } => {
    // Check minimum length
    if (value.length < SEARCH_CONFIG.MIN_LENGTH && value.length > 0) {
      return { isValid: false, error: `Search must be at least ${SEARCH_CONFIG.MIN_LENGTH} character long` };
    }

    // Check maximum length
    if (value.length > SEARCH_CONFIG.MAX_LENGTH) {
      return { isValid: false, error: `Search cannot exceed ${SEARCH_CONFIG.MAX_LENGTH} characters` };
    }

    // Check for disallowed special characters
    const hasDisallowedChars = SEARCH_CONFIG.FORBIDDEN_CHARS.test(value);
    if (hasDisallowedChars) {
      return { isValid: false, error: 'Search contains invalid characters' };
    }

    // Check for excessive consecutive spaces
    const consecutiveSpaces = value.match(/\s{3,}/g);
    if (consecutiveSpaces) {
      return { isValid: false, error: 'Too many consecutive spaces' };
    }

    // Check for only whitespace
    if (value.trim().length === 0 && value.length > 0) {
      return { isValid: false, error: 'Search cannot contain only spaces' };
    }

    return { isValid: true, error: '' };
  }, []);

  // Sanitize search input
  const sanitizeSearch = useCallback((value: string): string => {
    // Remove disallowed special characters
    let sanitized = value.replace(SEARCH_CONFIG.FORBIDDEN_CHARS, '');
    
    // Replace multiple consecutive spaces with single space
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    return sanitized;
  }, []);

  // Enhanced search change handler with performance monitoring
  const handleSearchChange = useCallback((value: string) => {
    const startTime = performance.now();
    
    // Check rate limit first
    if (checkSearchRateLimit()) {
      setSearchError('Too many search attempts. Please wait a moment.');
      return;
    }

    try {
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
  }, [sanitizeSearch, validateSearch, checkSearchRateLimit, logServerEvent, retryOperation]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setSearchError('');
    setIsSearchValid(true);
  }, []);

  // Meeting link validation function
  const validateMeetingLink = useCallback((link: string): { isValid: boolean; error: string; sanitizedLink?: string } => {
    // Check minimum length
    if (link.length < MEETING_LINK_CONFIG.MIN_LENGTH && link.length > 0) {
      return { isValid: false, error: `Meeting link must be at least ${MEETING_LINK_CONFIG.MIN_LENGTH} characters long` };
    }

    // Check maximum length
    if (link.length > MEETING_LINK_CONFIG.MAX_LENGTH) {
      return { isValid: false, error: `Meeting link cannot exceed ${MEETING_LINK_CONFIG.MAX_LENGTH} characters` };
    }

    // Check for forbidden characters
    if (MEETING_LINK_CONFIG.FORBIDDEN_CHARS.test(link)) {
      return { isValid: false, error: 'Meeting link contains invalid characters' };
    }

    // Check if it's a valid URL
    let url: URL;
    try {
      url = new URL(link);
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    // Check protocol
    if (!MEETING_LINK_CONFIG.ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Check domain
    const isValidDomain = MEETING_LINK_CONFIG.ALLOWED_DOMAINS.some(domain => 
      url.host === domain || url.host.endsWith(`.${domain}`)
    );
    if (!isValidDomain) {
      return { isValid: false, error: 'Invalid domain. Only study-talk.com links are allowed' };
    }

    // Check path segments
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    const requiredSegments = MEETING_LINK_CONFIG.REQUIRED_PATH_SEGMENTS;
    
    if (pathSegments.length < requiredSegments.length) {
      return { isValid: false, error: 'Invalid meeting link format' };
    }

    // Check if required path segments are present in the correct order
    for (let i = 0; i < requiredSegments.length; i++) {
      if (pathSegments[i] !== requiredSegments[i]) {
        return { isValid: false, error: 'Invalid meeting link format' };
      }
    }

    // Check for UUID in the meeting ID position
    const meetingId = pathSegments[requiredSegments.length];
    if (!meetingId || !MEETING_LINK_CONFIG.UUID_PATTERN.test(meetingId)) {
      return { isValid: false, error: 'Invalid meeting ID format' };
    }

    // Check query parameters for potential security issues
    const searchParams = url.searchParams;
    for (const [key, value] of Array.from(searchParams.entries())) {
      if (value.length > MEETING_LINK_CONFIG.MAX_PARAM_LENGTH) {
        return { isValid: false, error: 'Query parameters are too long' };
      }
      
      // Check for potentially dangerous query parameters
      const dangerousParams = ['script', 'javascript', 'data', 'vbscript'];
      if (dangerousParams.some(param => key.toLowerCase().includes(param) || value.toLowerCase().includes(param))) {
        return { isValid: false, error: 'Meeting link contains potentially unsafe parameters' };
      }
    }

    // Sanitize the link
    const sanitizedLink = link.trim();
    
    return { isValid: true, error: '', sanitizedLink };
  }, []);

  // Handle meeting link input change
  const handleMeetingLinkChange = useCallback((value: string) => {
    const validation = validateMeetingLink(value);
    
    setValues({ ...values, link: value });
    setIsMeetingLinkValid(validation.isValid);
    setMeetingLinkError(validation.error);
    
    // Log meeting link validation attempts
    if (value.length > 0) {
      logServerEvent('MEETING_LINK_VALIDATION', {
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
  }, [values, validateMeetingLink, logServerEvent]);

  // Verify meeting exists on server
  const verifyMeetingExists = useCallback(async (meetingId: string): Promise<{ exists: boolean; isNetworkError: boolean }> => {
    const cached = verificationCache.get(meetingId);
    if (cached && Date.now() - cached.timestamp < 300000) { // Cache for 5 minutes
      return { exists: cached.valid, isNetworkError: false };
    }

    try {
      const response = await fetch(`/api/study-groups/verify/${meetingId}`);
      const isValid = response.ok;
      
      // Cache the result
      setVerificationCache(prev => new Map(prev).set(meetingId, { 
        valid: isValid, 
        timestamp: Date.now() 
      }));
      
      return { exists: isValid, isNetworkError: false };
    } catch (error) {
      console.error('Error verifying meeting:', error);
      // Don't cache network errors
      return { exists: false, isNetworkError: true };
    }
  }, [verificationCache]);

  // Handle meeting link submission
  const handleMeetingLinkSubmit = useCallback(async () => {
    // Check rate limiting
    if (checkMeetingLinkRateLimit()) {
      logServerEvent('RATE_LIMIT_EXCEEDED', {
        attemptCount,
        timeRemaining: Math.ceil((MEETING_LINK_CONFIG.ATTEMPT_RESET_TIME - (Date.now() - lastAttemptTime)) / 1000)
      });
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${Math.ceil((MEETING_LINK_CONFIG.ATTEMPT_RESET_TIME - (Date.now() - lastAttemptTime)) / 1000)} seconds before trying again`,
        variant: 'destructive',
      });
      return;
    }

    // Check if button should be disabled
    if (!isMeetingLinkValid || !values.link.trim() || isProcessingLink) {
      logServerEvent('INVALID_SUBMISSION_ATTEMPT', {
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
    setLastAttemptTime(Date.now());
    
    logServerEvent('MEETING_LINK_SUBMISSION', {
      linkLength: values.link.length,
      attemptCount: attemptCount + 1
    });
    
    try {
      // Validate the link one more time before navigation
      const validation = validateMeetingLink(values.link);
      if (!validation.isValid) {
        logServerEvent('FINAL_VALIDATION_FAILED', {
          error: validation.error
        });
        toast({
          title: 'Invalid Meeting Link',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      // Extract meeting ID from URL
      const url = new URL(values.link);
      const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
      const meetingId = pathSegments[MEETING_LINK_CONFIG.REQUIRED_PATH_SEGMENTS.length];

      // Verify meeting exists on server
      const { exists, isNetworkError } = await verifyMeetingExists(meetingId);
      
      if (isNetworkError) {
        // Fallback: Allow navigation with warning for network errors
        logServerEvent('NETWORK_ERROR_FALLBACK', {
          meetingId,
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
        logServerEvent('MEETING_NOT_FOUND', {
          meetingId,
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
      logServerEvent('MEETING_VERIFICATION_SUCCESS', {
        meetingId,
        originalLink: values.link
      });

      // Navigate to the meeting
      router.push(values.link);
    } catch (error) {
      console.error('Error joining meeting:', error);
      logServerEvent('MEETING_JOIN_ERROR', {
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
  }, [values.link, isMeetingLinkValid, meetingLinkError, validateMeetingLink, router, toast, checkMeetingLinkRateLimit, lastAttemptTime, verifyMeetingExists, logServerEvent, attemptCount]);

  // Clear meeting link
  const clearMeetingLink = useCallback(() => {
    setValues({ ...values, link: '' });
    setMeetingLinkError('');
    setIsMeetingLinkValid(true);
  }, [values]);

  // Debounce effect
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
                description: 'Your account has been blocked by an administrator. You cannot join or create study groups.',
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
  }, [user?.id, router, toast]);

  return (
    <NextLayout>
      <div className="flex flex-col gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-4 mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-7xl font-extrabold text-lightBlue-100 text-center md:text-left">
            Join a study group
          </h1>
          <div className="relative w-full max-w-xs">
            <Input
              placeholder="Search for a study group..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base sm:text-lg shadow-sm transition-colors"
              maxLength={SEARCH_CONFIG.MAX_LENGTH}
              aria-label="Search study groups"
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
                search.length > SEARCH_CONFIG.MAX_LENGTH * 0.8 
                  ? 'text-yellow-600' 
                  : 'text-gray-400'
              }`}>
                {search.length}/{SEARCH_CONFIG.MAX_LENGTH} characters
              </div>
            )}
            {/* Accessibility help text */}
            <div id="search-help" className="sr-only">
              Search for study groups. Use up to {SEARCH_CONFIG.MAX_LENGTH} characters.
            </div>
            {/* Error message for screen readers */}
            {searchError && (
              <div id="search-error" className="sr-only" role="alert" aria-live="polite">
                {searchError}
              </div>
            )}
          </div>
        </div>
        {/* Custom Progress Bar and Leaderboard Button */}
        <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-0">
          <div className="flex flex-row gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start mb-3 sm:mb-0">
            <div className="flex-shrink-0">
              <div
                className="button w-28 sm:w-36 lg:w-40 h-[40px] sm:h-[45px] lg:h-[50px] bg-yellow-300 rounded-lg cursor-pointer select-none
                  active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941]
                  active:border-b-[0px]
                  transition-all duration-150 [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941]
                  border-b-[1px] border-yellow-400 shadow"
                tabIndex={0}
                role="button"
                onClick={() => router.push('/meetups/study-groups/leaderboard')}
              >
                <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-xs sm:text-base lg:text-lg">
                  Leaderboard
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div
                className={`button w-28 sm:w-36 lg:w-40 h-[40px] sm:h-[45px] lg:h-[50px] rounded-lg select-none transition-all duration-150 border-b-[1px] shadow ${
                  isAuthenticated 
                    ? 'bg-yellow-300 cursor-pointer active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941] active:border-b-[0px] [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941] border-yellow-400' 
                    : 'bg-gray-300 cursor-not-allowed border-gray-400'
                }`}
                tabIndex={0}
                role="button"
                onClick={() => {
                  if (isAuthenticated) {
                    setMeetingState('isJoiningMeeting');
                  } else {
                    toast({
                      title: 'Login Required',
                      description: 'Please log in to join a study room.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-xs sm:text-base lg:text-lg">
                  Join a room
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div
                className={`button w-28 sm:w-36 lg:w-40 h-[40px] sm:h-[45px] lg:h-[50px] rounded-lg select-none transition-all duration-150 border-b-[1px] shadow ${
                  isAuthenticated 
                    ? 'bg-yellow-300 cursor-pointer active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941] active:border-b-[0px] [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941] border-yellow-400' 
                    : 'bg-gray-300 cursor-not-allowed border-gray-400'
                }`}
                tabIndex={0}
                role="button"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/meetups/study-groups/create-room');
                  } else {
                    toast({
                      title: 'Login Required',
                      description: 'Please log in to create a study room.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-xs sm:text-base lg:text-lg">
                  Create a room
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center sm:justify-end w-full sm:w-auto">
            <div className="relative w-full max-w-3xl h-[40px] sm:h-[45px] lg:h-[50px] bg-white rounded-[8px] overflow-hidden flex items-center">
              <div
                className="absolute left-0 top-0 h-full bg-thanodi-blue transition-all duration-500 rounded-[8px]"
                style={{ width: `${displayPercent}%` }}
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700 font-semibold text-xs sm:text-sm lg:text-lg select-none pointer-events-none px-2 whitespace-nowrap">
                {displayHours.toFixed(1)}h / {hoursGoal}h studied today
              </span>
            </div>
          </div>
        </div>
        
        {/* Streak Counter */}
        <div className="max-w-5xl mx-auto w-full flex justify-center mb-4">
          <div className="bg-gradient-to-r from-thanodi-blue to-thanodi-peach rounded-lg p-3 sm:p-4 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-[8px]">
                <span className="text-yellow-600 font-bold text-sm sm:text-lg">⚡</span>
              </div>
              <div className="text-center">
                {streakLoading && isAuthenticated ? (
                  <div className="text-white font-semibold text-sm sm:text-base">Loading streak...</div>
                ) : (
                  <>
                    <div className="text-white font-bold text-sm sm:text-base">
                      {displayStreakData.currentStreak} day{displayStreakData.currentStreak !== 1 ? 's' : ''} streak
                    </div>
                    <div className="text-white/80 text-xs sm:text-sm">
                      Best: {displayStreakData.longestStreak} days • Total: {displayStreakData.totalStudyDays} days
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {filteredGroups.length === 0 && (
            <p className="text-center text-gray-500 col-span-full">No rooms available</p>
          )}
          {filteredGroups.map((group, i) => (
            <GroupCard
              key={group.callId}
              title={group.roomName}
              peopleCount={group.members.length}
              profilePics={group.members}
              onJoin={() => {
                if (isAuthenticated) {
                  router.push(`/meetups/study-groups/meeting/${group.callId}`);
                } else {
                  toast({
                    title: 'Login Required',
                    description: 'Please log in to join this study room.',
                    variant: 'destructive',
                  });
                }
              }}
              color={pastelColors[i % pastelColors.length]}
              isAuthenticated={isAuthenticated ?? false}
            />
          ))}
        </div>

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => {
          setMeetingState(undefined);
          clearMeetingLink();
        }}
        title="Type the link here"
        className="text-center"
        buttonText={isProcessingLink ? "Joining..." : isRateLimited ? "Rate Limited" : "Join Meeting"}
        handleClick={handleMeetingLinkSubmit}
      >
        <div className="space-y-3">
          <div className="relative">
            <Input
              placeholder="Meeting Link"
              onChange={(e) => handleMeetingLinkChange(e.target.value)}
              value={values.link}
              className={`border-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px] text-center text-gray-800 text-xs transition-colors ${
                meetingLinkError 
                  ? 'border-red-400 focus:border-red-500' 
                  : isMeetingLinkValid && values.link.trim()
                    ? 'border-green-400 focus:border-green-500' 
                    : 'border-gray-200 focus:border-blue-400'
              }`}
              disabled={isProcessingLink || isRateLimited}
            />
            {values.link && !isRateLimited && (
              <button
                onClick={clearMeetingLink}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
                disabled={isProcessingLink}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Meeting link validation feedback */}
          {meetingLinkError && (
            <div className="flex items-center gap-1 text-red-500 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>{meetingLinkError}</span>
            </div>
          )}
          
          {/* Rate limiting feedback */}
          {isRateLimited && (
            <div className="flex items-center gap-1 text-orange-500 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>Too many attempts. Please wait before trying again.</span>
            </div>
          )}
          
          {/* Meeting link format hint */}
          {values.link && !meetingLinkError && isMeetingLinkValid && !isRateLimited && (
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <span>✓ Valid meeting link format</span>
            </div>
          )}
        </div>
      </MeetingModal>
      </div>
    </NextLayout>
  );
};

export default StudyGroups;
