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
  const [roomSettings, setRoomSettings] = useState<any>(null);
  const [roomFull, setRoomFull] = useState(false);
  const [quizAlreadyStarted, setQuizAlreadyStarted] = useState(
    call?.state.custom?.quizStarted,
  );

  if (!call) {
    throw new Error(
      "useStreamCall must be used within a StreamCall component.",
    );
  }

  // https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    const sub = call.state.custom$.subscribe((custom: any) => {
      if (custom.quizStarted) setQuizAlreadyStarted(true);
    });
    return () => sub.unsubscribe();
  }, [call]);

  useEffect(() => {
    const stored = localStorage.getItem("roomSettings");
    if (stored) {
      const settings = JSON.parse(stored);
      setRoomSettings(settings);
      if (settings.mic === "off" && settings.camera === "off") {
        setIsMicCamToggled(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

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

  if (quizAlreadyStarted) return <Alert title="The quiz has already started" />;

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
        <label className="flex items-center justify-center gap-2 text-xl text-blue-400">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <Button
        className="rounded-md bg-blue-300 hover:bg-blue-400 px-12 py-7 text-xl"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join
      </Button>
    </div>
  );
};
export default CallSetup;