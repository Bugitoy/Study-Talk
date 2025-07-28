"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import NextLayout from "@/components/NextLayout";
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

// Room name validation configuration
const ROOM_NAME_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  ALLOWED_CHARS: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  MAX_ATTEMPTS: 50,
  ATTEMPT_RESET_TIME: 10000, // 10 seconds
};

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '',
  };

export default function CreateRoom() {
  const router = useRouter();
  const client = useStreamVideoClient();
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const [values, setValues] = useState(initialValues);
  
  const [roomSettings, setRoomSettings] = useState({
    roomName: "",
    mic: "on",
    camera: "on",
    availability: "public",
    participants: 8, // Default to maximum allowed by API
  });

  // Room name validation state
  const [roomNameError, setRoomNameError] = useState("");
  const [isRoomNameValid, setIsRoomNameValid] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Loading and creation state
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<'idle' | 'creating' | 'configuring' | 'finalizing'>('idle');
  const [creationError, setCreationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

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
                description: 'Your account has been blocked by an administrator. You cannot create study groups.',
                variant: 'destructive',
              });
              router.push('/meetups/study-groups');
            }
          }
        } catch (error) {
          console.error('Error checking block status:', error);
        }
      };
      
      checkBlockStatus();
    }
  }, [user?.id, router, toast]);

  // Sanitize room name input
  const sanitizeRoomName = useCallback((value: string): string => {
    // Remove forbidden special characters
    let sanitized = value.replace(ROOM_NAME_CONFIG.FORBIDDEN_CHARS, '');
    
    // Normalize spaces (replace multiple spaces with single space)
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Limit consecutive spaces
    while (sanitized.includes('  ')) {
      sanitized = sanitized.replace('  ', ' ');
    }
    
    // Trim whitespace
    return sanitized.trim();
  }, []);

  // Validate room name input
  const validateRoomName = useCallback((value: string): { isValid: boolean; error: string } => {
    if (value.length < ROOM_NAME_CONFIG.MIN_LENGTH) {
      return { isValid: false, error: 'Room name must be at least 2 characters long' };
    }
    
    if (value.length > ROOM_NAME_CONFIG.MAX_LENGTH) {
      return { isValid: false, error: 'Room name must be 50 characters or less' };
    }
    
    // Check for excessive consecutive spaces
    if (value.includes('  ')) {
      return { isValid: false, error: 'Room name contains too many consecutive spaces' };
    }
    
    // Check for forbidden characters
    if (ROOM_NAME_CONFIG.FORBIDDEN_CHARS.test(value)) {
      return { isValid: false, error: 'Room name contains invalid characters' };
    }
    
    // Check if name contains only allowed characters
    if (!ROOM_NAME_CONFIG.ALLOWED_CHARS.test(value)) {
      return { isValid: false, error: 'Room name contains unsupported characters' };
    }
    
    // Check for common inappropriate words (basic filter)
    const inappropriateWords = ['admin', 'moderator', 'system', 'test', 'temp', 'dummy'];
    const lowerValue = value.toLowerCase();
    if (inappropriateWords.some(word => lowerValue.includes(word))) {
      return { isValid: false, error: 'Room name contains inappropriate words' };
    }
    
    return { isValid: true, error: '' };
  }, []);

  // Rate limiting check
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    if (timeSinceLastAttempt < ROOM_NAME_CONFIG.ATTEMPT_RESET_TIME) {
      if (attemptCount >= ROOM_NAME_CONFIG.MAX_ATTEMPTS) {
        setIsRateLimited(true);
        return true; // Return true to indicate rate limited
      }
    } else {
      // Reset rate limiting if enough time has passed
      setAttemptCount(0);
      setIsRateLimited(false);
    }
    
    setAttemptCount(prev => prev + 1);
    setLastAttemptTime(now);
    return false; // Return false to indicate not rate limited
  }, [attemptCount, lastAttemptTime]);

  // Handle room name input change
  const handleRoomNameChange = useCallback((value: string) => {
    // Check rate limit first
    if (checkRateLimit()) {
      setRoomNameError('Too many attempts. Please wait a moment.');
      return;
    }

    try {
      const sanitized = sanitizeRoomName(value);
      const validation = validateRoomName(sanitized);
      
      setValue("roomName", sanitized);
      setIsRoomNameValid(validation.isValid);
      setRoomNameError(validation.error);
      
    } catch (error) {
      console.error('Room name validation error:', error);
      setRoomNameError('Room name validation temporarily unavailable.');
    }
  }, [sanitizeRoomName, validateRoomName, checkRateLimit]);

  const setValue = (key: string, value: any) => {
    setRoomSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    // Convert unlimited (-1) to null for API
    const apiParticipants = roomSettings.participants === -1 ? null : roomSettings.participants;
    
    // Additional validation to ensure we're sending a valid value
    if (apiParticipants !== null && ![2, 3, 4, 5, 6, 8].includes(apiParticipants)) {
      console.error('❌ Invalid participants value:', apiParticipants);
      throw new Error('Invalid participants value');
    }
    
    const payload = {
      roomName: roomSettings.roomName,
      numQuestions: 5, // Minimum valid value for API validation
      timePerQuestion: null, // Study groups don't have time limits
      mic: roomSettings.mic,
      camera: roomSettings.camera,
      participants: apiParticipants, // Use null for unlimited
      availability: roomSettings.availability,
    };

    const res = await fetch('/api/room-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('❌ Room settings API error:', res.status, errorData);
      throw new Error(`Failed to save settings: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await res.json();
    return result;
  };

  const createMeeting = async () => {
    if (!client || !user) return null;
    const id = crypto.randomUUID();
    const call = client.call('default', id);
    const startsAt = values.dateTime.toISOString() || new Date().toISOString();
    await call.getOrCreate({
      data: {
        starts_at: startsAt,
        custom: {
          roomName: roomSettings.roomName || 'Study Group',
          availability: roomSettings.availability,
          mic: roomSettings.mic,
          camera: roomSettings.camera,
        },
    },
});
    
    // Create room with server-side rate limiting
    const response = await fetch('/api/study-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId: call.id, roomName: roomSettings.roomName || 'Study Group', hostId: user.id }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 429) {
        // Rate limit exceeded
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      
      // Other server errors
      throw new Error('SERVER_ERROR');
    }
    
    return call;
  };

  const handleNext = async () => {
    // Validate room name before proceeding
    if (!roomSettings.roomName.trim()) {
      toast({
        title: 'Room Name Required',
        description: 'Please enter a room name',
      });
      return;
    }

    if (!isRoomNameValid) {
      toast({
        title: 'Invalid Room Name',
        description: roomNameError || 'Please enter a valid room name',
      });
      return;
    }

    // Check rate limiting
    if (isRateLimited) {
      toast({
        title: 'Too Many Attempts',
        description: 'Please wait before trying again',
        variant: 'destructive',
      });
      return;
    }

    // Reset error state
    setCreationError(null);
    setIsCreating(true);

         try {
       // Step 1: Create Stream.io call
       setCreationStep('creating');
       const call = await createMeeting();
       
       if (!call) {
         throw new Error('Failed to create meeting call');
       }
       
       // Step 2: Save room settings
       setCreationStep('configuring');
       const setting = await saveSettings();
       
       // Step 3: Update room settings with call ID
       setCreationStep('finalizing');
       await fetch(`/api/room-settings/${setting.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ callId: call.id }),
       });
       
       await call.update({
         custom: {
           ...call.state.custom,
           roomName: roomSettings.roomName || call.state.custom.roomName,
           availability: roomSettings.availability,
           mic: roomSettings.mic,
           camera: roomSettings.camera,
         },
       });

       // Success - navigate to room
       toast({ 
         title: 'Room Created Successfully!',
         description: 'Redirecting to your study room...',
       });
       
       router.push(`/meetups/study-groups/meeting/${call.id}?name=${encodeURIComponent(roomSettings.roomName)}`);
      
    } catch (err) {
      console.error('Failed to create room', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage === 'RATE_LIMIT_EXCEEDED') {
        setCreationError('Too many room creation attempts. Please wait a few minutes before trying again.');
        toast({ 
          title: 'Rate Limit Exceeded',
          description: 'Please wait before creating another room.',
          variant: 'destructive'
        });
      } else if (errorMessage === 'SERVER_ERROR') {
        setCreationError('Server error occurred. Please try again.');
        toast({ 
          title: 'Server Error',
          description: 'Failed to create room. Please try again.',
          variant: 'destructive'
        });
      } else {
        setCreationError('An unexpected error occurred. Please try again.');
        toast({ 
          title: 'Failed to Create Room',
          description: 'Please try again later.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsCreating(false);
      setCreationStep('idle');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setCreationError(null);
    handleNext();
  };

  const getStepMessage = () => {
    switch (creationStep) {
      case 'creating':
        return 'Creating your study room...';
      case 'configuring':
        return 'Configuring room settings...';
      case 'finalizing':
        return 'Finalizing room setup...';
      default:
        return 'Creating Room...';
    }
  };

  return (
    <NextLayout>
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a Study Group</h1>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Room Name:</label>
        <div className="relative">
          <input
            type="text"
            value={roomSettings.roomName}
            onChange={(e) => handleRoomNameChange(e.target.value)}
            className={`w-full p-2 rounded-[8px] border-2 transition-colors ${
              roomNameError
                ? 'border-red-400 focus:border-red-500'
                : isRoomNameValid && roomSettings.roomName.trim()
                  ? 'border-green-400 focus:border-green-500'
                  : 'border-gray-200 focus:border-blue-400'
            }`}
            placeholder="Enter room name"
            maxLength={ROOM_NAME_CONFIG.MAX_LENGTH}
            disabled={isRateLimited || isCreating}
            aria-label="Room name input"
            aria-describedby={roomNameError ? "room-name-error" : "room-name-help"}
            aria-invalid={!isRoomNameValid}
            aria-required="true"
          />

        </div>
        
        {/* Error message */}
        {roomNameError && (
          <div className="text-red-500 text-sm mt-1">
            {roomNameError}
          </div>
        )}
        
        {/* Success message */}
        {isRoomNameValid && roomSettings.roomName.trim() && !roomNameError && (
          <div className="text-green-500 text-sm mt-1 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Valid room name
          </div>
        )}
        
        {/* Rate limit message */}
        {isRateLimited && (
          <div className="text-orange-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Too many attempts. Please wait before trying again.
          </div>
        )}
        
        {/* Help text for screen readers */}
        <div id="room-name-help" className="sr-only">
          Room name must be between 2 and 50 characters. Use letters, numbers, spaces, and basic punctuation.
        </div>
        <div id="room-name-error" className="sr-only" role="alert" aria-live="polite">
          {roomNameError}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Mic:</label>
        <div className="flex gap-2" role="radiogroup" aria-labelledby="mic-label">
          {["on", "off", "flexible"].map((mic) => (
            <button
              key={mic}
              className={`px-4 py-2 rounded-[8px] capitalize ${
                roomSettings.mic === mic ? "bg-thanodi-peach text-white" : ""
              }`}
              onClick={() => setValue("mic", mic)}
              disabled={isCreating}
              aria-label={`Set microphone to ${mic}`}
              aria-pressed={roomSettings.mic === mic}
              role="radio"
              aria-checked={roomSettings.mic === mic}
            >
              {mic}
            </button>
          ))}
        </div>
        <div id="mic-label" className="sr-only">
          Choose microphone setting for your study group room
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Camera:</label>
        <div className="flex gap-2" role="radiogroup" aria-labelledby="camera-label">
          {["on", "off", "flexible"].map((cam) => (
            <button
              key={cam}
              className={`px-4 py-2 rounded-[8px] capitalize ${
                roomSettings.camera === cam ? "bg-thanodi-peach text-white" : ""
              }`}
              onClick={() => setValue("camera", cam)}
              disabled={isCreating}
              aria-label={`Set camera to ${cam}`}
              aria-pressed={roomSettings.camera === cam}
              role="radio"
              aria-checked={roomSettings.camera === cam}
            >
              {cam}
            </button>
          ))}
        </div>
        <div id="camera-label" className="sr-only">
          Choose camera setting for your study group room
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Availability:</label>
        <select
          className="w-full p-2 rounded-[8px]"
          value={roomSettings.availability}
          onChange={(e) => setValue("availability", e.target.value)}
          disabled={isCreating}
          aria-label="Room availability"
          aria-describedby="availability-help"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <div id="availability-help" className="sr-only">
          Choose whether your room is public (visible to everyone) or private (invitation only)
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Number of People:</label>
        <select
          className="w-full p-2 rounded-[8px]"
          value={roomSettings.participants}
          onChange={(e) => setValue("participants", parseInt(e.target.value))}
          disabled={isCreating}
          aria-label="Number of participants"
          aria-describedby="participants-help"
        >
          {[2, 3, 4, 5, 6, 8].map((n) => (
            <option key={n} value={n}>{`${n}`}</option>
          ))}
          <option value={-1}>Unlimited</option>
        </select>
        <div id="participants-help" className="sr-only">
          Choose the maximum number of participants for your study group room
        </div>
      </div>

      {/* Error Display */}
      {creationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">Room Creation Failed</p>
              <p className="text-red-600 text-sm mt-1">{creationError}</p>
              {retryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again ({maxRetries - retryCount} attempts left)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        className={`w-full py-3 rounded-[8px] text-lg text-white font-semibold transition-colors ${
          isCreating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-300 hover:bg-orange-200'
        }`}
        onClick={handleNext}
        disabled={isCreating || isRateLimited || !isRoomNameValid}
        aria-label="Create study group room"
        aria-describedby="submit-help"
      >
        {isCreating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {getStepMessage()}
          </div>
        ) : (
          'NEXT'
        )}
      </button>
      <div id="submit-help" className="sr-only">
        Click to create your study group room with the current settings
      </div>

    </div>
    </NextLayout>
  );
}
