'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import Alert from './Alert';
import { Button } from './ui/button';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useRoomSettingByCallId } from '@/hooks/useRoomSettings';
import NextLayout from './NextLayout';
import { useToast } from '@/hooks/use-toast';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();
  const { user: authUser } = useKindeBrowserClient();
  const roomSettings = useRoomSettingByCallId(call?.id);
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  // Custom mic/camera states based on room settings
  const [isMicOff, setIsMicOff] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    if (roomSettings) {
      if (roomSettings.mic === 'off') setIsMicOff(true);
      else if (roomSettings.mic === 'on') setIsMicOff(false);
      if (roomSettings.camera === 'off') setIsCameraOff(true);
      else if (roomSettings.camera === 'on') setIsCameraOff(false);
    }
  }, [roomSettings]);

  useEffect(() => {
    if (roomSettings?.mic === 'off' || isMicOff) {
      call.microphone.disable();
    } else {
      call.microphone.enable();
    }
  }, [isMicOff, call.microphone, roomSettings]);

  useEffect(() => {
    if (roomSettings?.camera === 'off' || isCameraOff) {
      call.camera.disable();
    } else {
      call.camera.enable();
    }
  }, [isCameraOff, call.camera, roomSettings]);

  const handleJoin = async () => {
    if (isJoining) return;
    
    setIsJoining(true);
    
    try {
      // Join the call
      await call.join();
      
      // Add as member so avatar is queryable later
      try {
        if (authUser) {
          await call.updateCallMembers({
            update_members: [
              {
                user_id: authUser.id,
              },
            ],
          } as any);
        }
      } catch (err) {
        console.error('Failed to add user as call member', err);
        // Don't fail the entire join process for this
      }

      setIsSetupComplete(true);
    } catch (error) {
      console.error('Failed to join call:', error);
      toast({
        title: 'Failed to Join',
        description: 'Unable to join the meeting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
      />
    );

  return (
    <NextLayout>
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">

        <h1 className="text-center text-6xl font-bold mb-10 text-blue-400">Setup</h1>
        <VideoPreview />
        
        <div className="flex h-16 items-center justify-center gap-3">
          {roomSettings?.mic === 'flexible' && (
              <Button
                className={`px-4 py-2 rounded-md ${
                  isMicOff ? 'bg-[#19232d] hover:bg-[#4c535b] text-white' : 'bg-blue-400 hover:bg-blue-500 text-white'
                }`}
                onClick={() => setIsMicOff(!isMicOff)}
                aria-label={`${isMicOff ? 'Enable' : 'Disable'} microphone`}
                aria-pressed={!isMicOff}
                disabled={isJoining}
              >
                {isMicOff ? 'Mic Off' : 'Mic On'}
              </Button>
            )}
            {roomSettings?.camera === 'flexible' && (
              <Button
                className={`px-4 py-2 rounded-md ${
                  isCameraOff ? 'bg-[#19232d] hover:bg-[#4c535b] text-white' : 'bg-blue-400 hover:bg-blue-500 text-white'
                }`}
                onClick={() => setIsCameraOff(!isCameraOff)}
                aria-label={`${isCameraOff ? 'Enable' : 'Disable'} camera`}
                aria-pressed={!isCameraOff}
                disabled={isJoining}
              >
                {isCameraOff ? 'Camera Off' : 'Camera On'}
              </Button>
            )}
            <DeviceSettings />
            <Button
            className="rounded-md bg-blue-300 hover:bg-blue-400 px-12 py-7 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleJoin}
            disabled={isJoining}
            aria-label="Join meeting"
            aria-describedby="join-help"
          >
            {isJoining ? 'Joining...' : 'Join'}
          </Button>
        </div>
        
        <div id="join-help" className="sr-only">
          Click to join the study group meeting with your current device settings
        </div>
      </div>
    </NextLayout>
  );
};

export default MeetingSetup;
