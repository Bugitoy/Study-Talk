'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    // Don't call call.delete() - it causes 403 errors for non-host users
    // The webhook will handle room cleanup when the call ends
    router.push('/meetups/compete');
  };

  return (
    <Button onClick={endCall} className="bg-red-500 h-6 sm:h-auto text-xs sm:text-base px-2 sm:px-4 py-1 sm:py-2">
      <span className="hidden sm:inline md:hidden lg:inline xl:hidden">End call for everyone</span>
      <span className="sm:hidden md:inline lg:hidden xl:inline">End</span>
    </Button>
  );
};

export default EndCallButton;
