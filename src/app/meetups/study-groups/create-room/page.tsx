"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import NextLayout from "@/components/NextLayout";
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from '@/hooks/use-toast';

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
  });

  // Room name validation state
  const [roomNameError, setRoomNameError] = useState("");
  const [isRoomNameValid, setIsRoomNameValid] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

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
    const payload = {
      ...roomSettings,
      // defaults required by RoomSetting schema
      numQuestions: 0,
      timePerQuestion: null,
      participants: 50,
    };

    const res = await fetch('/api/room-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
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
        toast({ 
          title: 'Too Many Attempts',
          description: errorData.message || 'Please wait before creating another room.',
          variant: 'destructive'
        });
        return null;
      }
      
      // Other server errors
      toast({ 
        title: 'Failed to Create Room',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      return null;
    }
    
    toast({ title: 'Meeting Created' });
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

  try {
    const call = await createMeeting();
    if (!call) return;
    const setting = await saveSettings();
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
    router.push(`/meetups/study-groups/meeting/${call.id}?name=${encodeURIComponent(roomSettings.roomName)}`);
  } catch (err) {
    console.error('Failed to create room', err);
    toast({ 
      title: 'Failed to create Meeting',
      variant: 'destructive'
    });
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
        onClick={handleNext}
        aria-label="Create study group room"
        aria-describedby="submit-help"
      >
        NEXT
      </button>
      <div id="submit-help" className="sr-only">
        Click to create your study group room with the current settings
      </div>

    </div>
    </NextLayout>
  );
}
