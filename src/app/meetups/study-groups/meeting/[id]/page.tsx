'use client';

import { useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import NextLayout from '@/components/NextLayout';

const MeetingPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useKindeBrowserClient();
  const { call, isCallLoading } = useGetCallById(id as string);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Check if user is allowed to join (only if call exists)
  const notAllowed = call && call.type === 'invited' && (!user || !call.state.members.find((m) => m.user.id === user.id));

  return (
    <NextLayout>
      <main className="h-screen w-full">
        {(!isAuthenticated || isCallLoading) ? (
          <Loader />
        ) : !call ? (
          <p className="text-center text-3xl font-bold text-white">
            Call Not Found
          </p>
        ) : notAllowed ? (
          <Alert title="You are not allowed to join this meeting" />
        ) : (
          <StreamCall call={call}>
            <StreamTheme>
              {!isSetupComplete ? (
                <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
              ) : (
                <MeetingRoom />
              )}
            </StreamTheme>
          </StreamCall>
        )}
      </main>
    </NextLayout>
  );
};

export default MeetingPage;
