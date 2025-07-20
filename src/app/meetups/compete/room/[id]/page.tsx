'use client';

import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import NextLayout from '@/components/NextLayout';
import CallRoom from '@/components/compete/CallRoom';
import CallSetup from '@/components/compete/CallSetup';
import CallNextLayout from '@/components/CallNextLayout';
import { useToast } from '@/hooks/use-toast';

const CallPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useKindeBrowserClient();
  const { call, isCallLoading } = useGetCallById(id as string);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isAccessChecking, setIsAccessChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Check access before allowing user to join the call
  useEffect(() => {
    if (!isAuthenticated || isCallLoading || !call || !user?.id) {
      return;
    }

    const checkAccess = async () => {
      try {
        setIsAccessChecking(true);
        
        // Check if user is globally blocked
        const blockRes = await fetch(`/api/user/check-block?userId=${user.id}`);
        if (blockRes.ok) {
          const blockData = await blockRes.json();
          if (blockData.isBlocked) {
            toast({
              title: 'Access Denied',
              description: 'Your account has been blocked by an administrator.',
              variant: 'destructive',
            });
            router.push('/meetups/compete');
            return;
          }
        }

        // Check if user is banned from this specific room
        const banRes = await fetch(`/api/room/ban/check?userId=${user.id}&callId=${id}`);
        if (banRes.ok) {
          const banData = await banRes.json();
          if (banData.isBanned) {
            toast({
              title: 'Access Denied',
              description: 'You have been banned from this room.',
              variant: 'destructive',
            });
            router.push('/meetups/compete');
            return;
          }
        }

        // If we get here, user has access
        setHasAccess(true);
        setIsAccessChecking(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setIsAccessChecking(false);
        // On error, allow access but log the error
        setHasAccess(true);
      }
    };

    checkAccess();
  }, [isAuthenticated, isCallLoading, call, user?.id, id, router, toast]);

  if (!isAuthenticated || isCallLoading || isAccessChecking) return <Loader />;

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

  if (!hasAccess) return (
    <NextLayout>
      <Alert title="Access Denied" />
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
