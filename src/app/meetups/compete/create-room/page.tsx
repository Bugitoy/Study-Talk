"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import NextLayout from "@/components/NextLayout";
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Room name validation configuration for compete page
const COMPETE_ROOM_NAME_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  FORBIDDEN_CHARS: /[<>\"'&]/g,
  ALLOWED_CHARS: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  MAX_ATTEMPTS: 50,
  ATTEMPT_RESET_TIME: 10000, // 10 seconds
};

export default function CreateRoom() {
  const router = useRouter();
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const { user: userInfo, loading: userLoading } = useCurrentUser();
  
  const [roomSettings, setRoomSettings] = useState({
    roomName: "",
    numQuestions: 5,
    timePerQuestion: 5,
    mic: "on",
    camera: "on",
    participants: 5, // Default to minimum allowed by API
    availability: "public",
  });

  // Room name validation state
  const [roomNameError, setRoomNameError] = useState("");
  const [isRoomNameValid, setIsRoomNameValid] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Check user plan for restrictions
  const isFreeUser = userInfo?.plan === 'free';
  const isPlusUser = userInfo?.plan === 'plus';

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
                description: 'Your account has been blocked by an administrator. You cannot create compete rooms.',
                variant: 'destructive',
              });
              router.push('/meetups/compete');
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
    let sanitized = value.replace(COMPETE_ROOM_NAME_CONFIG.FORBIDDEN_CHARS, '');
    
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
    if (value.length < COMPETE_ROOM_NAME_CONFIG.MIN_LENGTH) {
      return { isValid: false, error: 'Room name must be at least 2 characters long' };
    }
    
    if (value.length > COMPETE_ROOM_NAME_CONFIG.MAX_LENGTH) {
      return { isValid: false, error: 'Room name must be 50 characters or less' };
    }
    
    // Check for excessive consecutive spaces
    if (value.includes('  ')) {
      return { isValid: false, error: 'Room name contains too many consecutive spaces' };
    }
    
    // Check for forbidden characters
    if (COMPETE_ROOM_NAME_CONFIG.FORBIDDEN_CHARS.test(value)) {
      return { isValid: false, error: 'Room name contains invalid characters' };
    }
    
    // Check if name contains only allowed characters
    if (!COMPETE_ROOM_NAME_CONFIG.ALLOWED_CHARS.test(value)) {
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
    
    if (timeSinceLastAttempt < COMPETE_ROOM_NAME_CONFIG.ATTEMPT_RESET_TIME) {
      if (attemptCount >= COMPETE_ROOM_NAME_CONFIG.MAX_ATTEMPTS) {
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
    // Prevent free users from selecting more than 5 participants
    if (key === 'participants' && isFreeUser) {
      if (value > 5) {
        toast({
          title: 'Upgrade Required',
          description: 'Free users can only create rooms with up to 5 participants. Upgrade to Plus or Premium for larger groups.',
        });
        return; // Don't update the value
      }
    }
    
    // Prevent Plus users from selecting unlimited
    if (key === 'participants' && isPlusUser && value === -1) {
      toast({
        title: 'Upgrade Required',
        description: 'Plus users cannot create unlimited participant rooms. Upgrade to Premium for unlimited participants.',
      });
      return; // Don't update the value
    }
    
    setRoomSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveToDatabase = async () => {
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

    try {
      // Convert unlimited (-1) to null for API
      const apiParticipants = roomSettings.participants === -1 ? null : roomSettings.participants;
      
      const payload = {
        ...roomSettings,
        participants: apiParticipants, // Use null for unlimited
      };

      const res = await fetch('/api/room-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        
        if (res.status === 429) {
          // Rate limit exceeded
          toast({ 
            title: 'Too Many Attempts',
            description: errorData.message || 'Please wait before creating another room.',
            variant: 'destructive'
          });
          return;
        }
        
        // Other server errors
        toast({ 
          title: 'Failed to Save Settings',
          description: 'Please try again later.',
          variant: 'destructive'
        });
        return;
      }
      
      const data = await res.json();
      router.push(`/meetups/compete/choose-topic?settings=${data.id}`);
    } catch (err) {
      console.error('Failed to save settings', err);
      toast({
        title: 'Failed to Save Settings',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  return (
    <NextLayout>
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Room</h1>

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
            maxLength={COMPETE_ROOM_NAME_CONFIG.MAX_LENGTH}
            disabled={isRateLimited}
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
          <div className="text-green-500 text-sm mt-1">
            ✓ Valid room name
          </div>
        )}
        
        {/* Rate limit message */}
        {isRateLimited && (
          <div className="text-orange-500 text-sm mt-1">
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
        <label className="block mb-2 font-medium">Number of Questions:</label>
        <div className="flex gap-2 flex-wrap" role="radiogroup" aria-labelledby="questions-label">
          {[5, 10, 15, 20, 25, 30].map((num) => (
            <button
              key={num}
              className={`px-4 py-2 rounded-[8px] ${
                roomSettings.numQuestions === num ? "bg-thanodi-peach text-white" : ""
              }`}
              onClick={() => setValue("numQuestions", num)}
              aria-label={`Set number of questions to ${num}`}
              aria-pressed={roomSettings.numQuestions === num}
              role="radio"
              aria-checked={roomSettings.numQuestions === num}
            >
              {num}
            </button>
          ))}
        </div>
        <div id="questions-label" className="sr-only">
          Choose the number of questions for your compete room
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Time per Question (sec):</label>
        <div className="flex gap-2 flex-wrap" role="radiogroup" aria-labelledby="time-label">
          {[5, 10, 15, 20, 25, 30, 'Unlimited'].map((num) => (
            <button
              key={num}
              className={`px-4 py-2 rounded-[8px] ${
                (num === 'Unlimited' && roomSettings.timePerQuestion === null) || roomSettings.timePerQuestion === num
                  ? "bg-thanodi-peach text-white"
                  : ""
              }`}
              onClick={() => setValue("timePerQuestion", num === 'Unlimited' ? null : num)}
              aria-label={`Set time per question to ${num === 'Unlimited' ? 'unlimited' : num + ' seconds'}`}
              aria-pressed={(num === 'Unlimited' && roomSettings.timePerQuestion === null) || roomSettings.timePerQuestion === num}
              role="radio"
              aria-checked={(num === 'Unlimited' && roomSettings.timePerQuestion === null) || roomSettings.timePerQuestion === num}
            >
              {num}
            </button>
          ))}
        </div>
        <div id="time-label" className="sr-only">
          Choose the time limit per question for your compete room
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
          Choose microphone setting for your compete room
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
          Choose camera setting for your compete room
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Number of People:</label>
        <select
          className="w-full p-2 rounded-[8px]"
          value={roomSettings.participants}
          onChange={(e) => setValue("participants", parseInt(e.target.value))}
          aria-label="Number of participants"
          aria-describedby="participants-help"
        >
          {[5, 10, 15, 20, 25, 30].map((n) => (
            <option 
              key={n} 
              value={n}
              disabled={isFreeUser && n > 5}
              className={isFreeUser && n > 5 ? 'text-gray-400' : ''}
            >
              {n}
            </option>
          ))}
          <option 
            value={-1}
            disabled={isFreeUser || isPlusUser}
            className={(isFreeUser || isPlusUser) ? 'text-gray-400' : ''}
          >
            Unlimited
          </option>
        </select>
        <div id="participants-help" className="sr-only">
          Choose the maximum number of participants for your compete room
        </div>
        {isFreeUser && (
          <div className="mt-2 text-xs text-gray-600">
            Free users can only create rooms with up to 5 participants. Upgrade to Plus or Premium for larger groups.
          </div>
        )}
        {isPlusUser && (
          <div className="mt-2 text-xs text-gray-600">
            Plus users can create rooms with up to 30 participants. Upgrade to Premium for unlimited participants.
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Availability:</label>
        <select
          className="w-full p-2 rounded-[8px]"
          value={roomSettings.availability}
          onChange={(e) => setValue("availability", e.target.value)}
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

      <button
        className="w-full bg-orange-300 text-white py-3 rounded-[8px] text-lg font-semibold hover:bg-orange-200 transition-colors"
        onClick={saveToDatabase}
        aria-label="Create compete room"
        aria-describedby="submit-help"
      >
        NEXT
      </button>
      <div id="submit-help" className="sr-only">
        Click to create your compete room with the current settings
      </div>
    </div>
    </NextLayout>
  );
}
