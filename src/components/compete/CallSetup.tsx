"use client";
import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import Alert from "@/components/Alert";
import { Button } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRoomSettingByCallId } from "@/hooks/useRoomSettings";

const CallSetup = ({
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
  const roomSettings = useRoomSettingByCallId(call?.id);
  const [roomFull, setRoomFull] = useState(false);
  const [quizAlreadyStarted, setQuizAlreadyStarted] = useState(
    call?.state.custom?.quizStarted,
  );

  if (!call) {
    throw new Error(
      "useStreamCall must be used within a StreamCall component.",
    );
  }

  const { user: authUser } = useKindeBrowserClient();

  // https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
  const [isMicOff, setIsMicOff] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Check if controls should be shown based on room settings
  const showMicButton = roomSettings?.mic === 'flexible';
  const showCameraButton = roomSettings?.camera === 'flexible';

  useEffect(() => {
    if (roomSettings) {
      if (roomSettings.mic === 'off') {
        setIsMicOff(true);
      } else if (roomSettings.mic === 'on') {
        setIsMicOff(false);
      }
      if (roomSettings.camera === 'off') {
        setIsCameraOff(true);
      } else if (roomSettings.camera === 'on') {
        setIsCameraOff(false);
      }
    }
  }, [roomSettings]);

  useEffect(() => {
    const sub = call.state.custom$.subscribe((custom: any) => {
      if (custom.quizStarted) setQuizAlreadyStarted(true);
    });
    return () => sub.unsubscribe();
  }, [call]);

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

  useEffect(() => {
    if (!roomSettings) return;
    if (roomSettings.mic === "off") {
      call.microphone.disable();
    }
    if (roomSettings.camera === "off") {
      call.camera.disable();
    }
    const max = roomSettings.participants;
    if (max && call.state.members.length >= max) {
      setRoomFull(true);
    }
  }, [roomSettings, call]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (quizAlreadyStarted) return <Alert title="Host has started quiz" />;

  if (callHasEnded)
    return <Alert title="The call has been ended by the host" />;

  if (roomFull)
    return <Alert title="This room has reached the participant limit" />;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-center text-6xl font-bold mb-10 text-blue-400">
        Setup
      </h1>
      <VideoPreview />
      <div className="flex h-16 items-center justify-center gap-3">
        {showMicButton && (
          <Button
            className={`px-4 py-2 rounded-md ${
              isMicOff 
                ? 'bg-[#19232d] hover:bg-[#4c535b] text-white' 
                : 'bg-blue-400 hover:bg-blue-500 text-white'
            }`}
            onClick={() => setIsMicOff(!isMicOff)}
          >
            {isMicOff ? 'Mic Off' : 'Mic On'}
          </Button>
        )}
        {showCameraButton && (
          <Button
            className={`px-4 py-2 rounded-md ${
              isCameraOff 
                ? 'bg-[#19232d] hover:bg-[#4c535b] text-white' 
                : 'bg-blue-400 hover:bg-blue-500 text-white'
            }`}
            onClick={() => setIsCameraOff(!isCameraOff)}
          >
            {isCameraOff ? 'Camera Off' : 'Camera On'}
          </Button>
        )}
        <DeviceSettings />
      </div>
      <Button
        className="rounded-md bg-blue-300 hover:bg-blue-400 px-12 py-7 text-xl"
        onClick={async () => {
          await call.join();
          // Only the call creator can update call properties
          const isCallCreator = call.state.createdBy?.id === authUser?.id;
          if (isCallCreator) {
            // Ensure the current user becomes a call member so their avatar is queryable
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
              console.error("Failed to add user as call member", err);
            }
            try {
              await call.update({
                custom: {
                  ...call.state.custom,
                  hostJoined: true,
                  availability: roomSettings?.availability || call.state.custom?.availability,
                  roomName: roomSettings?.roomName || call.state.custom?.roomName,
                },
              });
            } catch (e) {
              console.error('Failed to update call', e);
            }
          }
          setIsSetupComplete(true);
        }}
      >
        Join
      </Button>
    </div>
  );
};
export default CallSetup;