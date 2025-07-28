import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useStreamStudyTimeTracker } from '@/hooks/useStreamStudyTimeTracker';
import { useRoomSettingByCallId } from '@/hooks/useRoomSettings';
import { useCallStateHooks, useCall, CallingState } from '@stream-io/video-react-sdk';

export const useMeetingRoom = (callId?: string) => {
  const router = useRouter();
  const { toast } = useToast();
  const call = useCall();
  const { startTracking, endTracking, isTracking, dailyHours } = useStreamStudyTimeTracker(call?.id);
  const { useCallCallingState } = useCallStateHooks();
  const roomSettings = useRoomSettingByCallId(call?.id);
  const callingState = useCallCallingState();

  // State
  const [layout, setLayout] = useState<'grid' | 'speaker-left' | 'speaker-right'>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showBanConfirmation, setShowBanConfirmation] = useState(false);
  const [banConfirmationData, setBanConfirmationData] = useState<any>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [completedGoals, setCompletedGoals] = useState<string[]>(['join']);

  // Get current user and host id
  const hostId = call?.state.createdBy?.id;
  const localParticipant = call?.state.localParticipant;
  const currentUserId = localParticipant?.userId;
  const isHost = currentUserId && hostId && currentUserId === hostId;

  // Access is already checked before joining the call, so we can skip this check
  useEffect(() => {
    if (currentUserId && call?.id) {
      setIsCheckingAccess(false);
    }
  }, [currentUserId, call?.id]);

  // Start tracking when call is joined
  useEffect(() => {
    if (callingState === CallingState.JOINED && call?.id) {
      startTracking();
      
      // Update streak when user joins a meeting room
      if (currentUserId) {
        fetch('/api/user/streak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUserId }),
        }).catch(error => {
          console.error('Failed to update streak:', error);
        });
      }
    }
  }, [callingState, call?.id, startTracking, currentUserId]);

  // End tracking when component unmounts or call ends
  useEffect(() => {
    return () => {
      if (isTracking) {
        endTracking();
      }
    };
  }, [isTracking, endTracking]);

  // Handle host leaving
  useEffect(() => {
    if (!call) return;
    const handler = async (e: any) => {
      const leftId = e.participant?.userId || e.participant?.user?.id;
      if (leftId === hostId) {
        try {
          await endTracking();
        } catch (err) {
          console.error('Failed to handle host leaving', err);
        }
      }
    };
    const unsub = call.on('participantLeft', handler);
    return () => {
      unsub?.();
    };
  }, [call, hostId, endTracking]);

  // Handle call events
  useEffect(() => {
    if (!call) return;

    const handleCallEnded = (event: any) => {
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.'
      });
      router.push('/meetups/study-groups');
    };

    const handleRemoved = (event: any) => {
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.'
      });
      router.push('/meetups/study-groups');
    };

    const handleCallStateChanged = (event: any) => {
      if (event.state === 'ended' || event.state === 'disconnected') {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room by the host.',
        });
        router.push('/meetups/study-groups');
      }
    };

    const handleParticipantLeft = (event: any) => {
      const leftUserId = event.participant?.userId || event.participant?.user?.id;
      
      if (leftUserId === currentUserId) {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room by the host.',
        });
        router.push('/meetups/study-groups');
      } else {
        if (isHost) {
          toast({
            title: 'Participant left',
            description: `A participant has left the call.`,
          });
        }
      }
    };

    const handleCallCustomChanged = (custom: any) => {
      if (custom.forceUserDisconnect && custom.forceUserDisconnect === currentUserId) {
        toast({
          title: 'Banned from call',
          description: 'You have been banned from this room by the host.',
          variant: 'destructive',
        });
        call.leave();
        router.push('/meetups/study-groups');
      }
    };

    call.on('callEnded', handleCallEnded);
    call.on('participantLeft', handleParticipantLeft);
    
    const customSubscription = call.state.custom$.subscribe(handleCallCustomChanged);

    return () => {
      call.off('callEnded', handleCallEnded);
      call.off('participantLeft', handleParticipantLeft);
      customSubscription?.unsubscribe();
    };
  }, [call, router, toast, currentUserId, isHost]);

  // Keep event listeners for when user is removed during the call
  useEffect(() => {
    if (!call || !currentUserId) return;

    const checkUserInCall = async () => {
      const participants = call.state.participants || [];
      const userStillInCall = participants.some((p: any) => 
        (p.userId || p.user?.id) === currentUserId
      );

      if (!userStillInCall) {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room.',
          variant: 'destructive',
        });
        router.push('/meetups/study-groups');
      }
    };

    const interval = setInterval(checkUserInCall, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [call, currentUserId, router, toast]);

  const handleBanSubmit = (data: any) => {
    if (!call) return;

    // Force a refresh of call participants to update the UI
    try {
      call.update({
        custom: { 
          ...call.state.custom, 
          bannedUser: data.selectedBanUserId,
          banTimestamp: Date.now()
        }
      });
      
      const participants = call.state.participants || [];
      const targetParticipant = participants.find((p: any) => 
        (p.userId || p.user?.id) === data.selectedBanUserId
      );
      
      if (targetParticipant) {
        setTimeout(() => {
          call.update({ 
            custom: { 
              ...call.state.custom, 
              forceRefresh: Date.now(),
              bannedUser: data.selectedBanUserId
            } 
          });
        }, 500);
      }
      
      // Set up continuous monitoring to ensure user is removed
      const monitorInterval = setInterval(async () => {
        try {
          const participants = call.state.participants || [];
          const bannedUserStillInCall = participants.some((p: any) => 
            (p.userId || p.user?.id) === data.selectedBanUserId
          );
          
          if (bannedUserStillInCall) {
            const forceRemoveRes = await fetch('/api/room/force-remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: data.selectedBanUserId, callId: call.id }),
            });
            
            if (forceRemoveRes.ok) {
              const forceRemoveData = await forceRemoveRes.json();
            }
          } else {
            clearInterval(monitorInterval);
          }
        } catch (monitorError) {
          console.error('Failed to monitor user removal:', monitorError);
        }
      }, 5000);
      
      setTimeout(() => {
        clearInterval(monitorInterval);
      }, 30000);
      
      setTimeout(async () => {
        try {
          const participants = call.state.participants || [];
          const bannedUserStillInCall = participants.some((p: any) => 
            (p.userId || p.user?.id) === data.selectedBanUserId
          );
          
          if (bannedUserStillInCall) {
            const forceRemoveRes = await fetch('/api/room/force-remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: data.selectedBanUserId, callId: call.id }),
            });
            
            if (forceRemoveRes.ok) {
              const forceRemoveData = await forceRemoveRes.json();
            }
            
            try {
              await call.update({
                custom: { 
                  ...call.state.custom, 
                  forceUserLeave: data.selectedBanUserId,
                  forceLeaveTimestamp: Date.now()
                }
              });
            } catch (updateError) {
              console.error('Failed to force call update:', updateError);
            }
          }
        } catch (checkError) {
          console.error('Failed to check if banned user is still in call:', checkError);
        }
      }, 3000);
      
    } catch (updateError) {
      console.error('Failed to update call after ban:', updateError);
    }
  };

  return {
    // State
    layout,
    setLayout,
    showParticipants,
    setShowParticipants,
    showReportDialog,
    setShowReportDialog,
    showBanDialog,
    setShowBanDialog,
    showBanConfirmation,
    setShowBanConfirmation,
    banConfirmationData,
    setBanConfirmationData,
    isCheckingAccess,
    completedGoals,
    
    // Call data
    call,
    callingState,
    currentUserId,
    isHost,
    hostId,
    participants: call?.state.participants || [],
    
    // Room settings
    roomSettings,
    
    // Study tracking
    dailyHours,
    isTracking,
    
    // Actions
    handleBanSubmit,
    endTracking,
  };
}; 