'use client';

import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams, useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import NextLayout from '@/components/NextLayout';
import { useToast } from '@/hooks/use-toast';

const MeetingPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useKindeBrowserClient();
  const { call, isCallLoading } = useGetCallById(id as string);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isAccessChecking, setIsAccessChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is allowed to join (only if call exists)
  const notAllowed = call && call.type === 'invited' && (!user || !call.state.members.find((m) => m.user.id === user.id));

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
            router.push('/meetups/study-groups');
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
            router.push('/meetups/study-groups');
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

  return (
    <NextLayout>
      <main className="h-screen w-full">
        {(!isAuthenticated || isCallLoading || isAccessChecking) ? (
          <Loader />
        ) : !call ? (
          <p className="text-center text-3xl font-bold text-white">
            Call Not Found
          </p>
        ) : notAllowed ? (
          <Alert title="You are not allowed to join this meeting" />
        ) : !hasAccess ? (
          <Alert title="Access Denied" />
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
