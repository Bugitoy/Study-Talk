'use client';

import { useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import NextLayout from '@/components/NextLayout';
import CallRoom from '@/components/compete/CallRoom';
import CallSetup from '@/components/compete/CallSetup';
import CallNextLayout from '@/components/CallNextLayout';

const CallPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useKindeBrowserClient();
  const { call, isCallLoading } = useGetCallById(id as string);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isAuthenticated || isCallLoading) return <Loader />;

  if (!call) return (
    <NextLayout>
    <p className="text-center text-3xl font-bold text-white">
      Call Not Found
    </p>
    </NextLayout>
  );

  // get more info about custom call type:  https://getstream.io/video/docs/react/guides/configuring-call-types/
  const notAllowed = call.type === 'invited' && (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed) return (
    <NextLayout>
      <Alert title="You are not allowed to join this meeting" />
    </NextLayout>
  );

  return (
    <CallNextLayout>
        <main className="h-screen w-full">
            <StreamCall call={call}>
                <StreamTheme>
                {!isSetupComplete ? (
                    <CallSetup setIsSetupComplete={setIsSetupComplete} />
                ) : (
                    <CallRoom />
                )}
                </StreamTheme>
            </StreamCall>
        </main>
    </CallNextLayout>
  );
};

export default CallPage;
