'use client';
import React, { useEffect, useState } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, SquarePlus, Handshake, MessageSquareText, Hourglass, Flag, Shield } from 'lucide-react';


import Loader from './Loader';
import EndCallButton from './StudyEndCallButton';
import { cn } from '@/lib/utils';
import { useRoomSettingByCallId } from '@/hooks/useRoomSettings';
import StudyCallControls from './StudyCallControls';
import { useStreamStudyTimeTracker } from '@/hooks/useStreamStudyTimeTracker';
import { StudyTimeProgress } from './StudyTimeProgress';
import { MobileStudyTimeProgress } from './MobileStudyTimeProgress';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const goals = [
  { key: 'join', label: 'Join', icon: SquarePlus },
  { key: 'befriend', label: 'Make a friend', icon: Handshake },
  { key: 'message', label: 'Write a message', icon: MessageSquareText },
  { key: 'stay', label: 'Stay 30 minutes', icon: Hourglass },
];

const MeetingGoalsBar = ({ completedGoals = [] }: { completedGoals: string[] }) => (
  <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
    <div className="flex items-center w-full justify-between">
      {goals.map((goal, idx) => {
        const Icon = goal.icon;
        return (
          <React.Fragment key={goal.key}>
            <div className="flex flex-col items-center w-16 sm:w-24">
              <div className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center z-10 bg-white rounded-[8px] border-2 ${completedGoals.includes(goal.key) ? 'border-yellow-400' : 'border-gray-300'}`}>
                <Icon className={`w-5 h-5 sm:w-8 sm:h-8 ${completedGoals.includes(goal.key) ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-[#19232d] font-medium text-center w-full">
                {goal.label}
              </span>
            </div>
            {idx < goals.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-300 mx-1" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  // Remove personal room logic
  // const isPersonalRoom = !!searchParams.get('personal');
  const groupName = searchParams.get('name') || 'Study Group';
  const router = useRouter();
  const call = useCall();
  const { startTracking, endTracking, isTracking, dailyHours } = useStreamStudyTimeTracker(call?.id);
  const { toast } = useToast();
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedReportedId, setSelectedReportedId] = useState('');
  const [otherReportedName, setOtherReportedName] = useState('');
  const { useCallCallingState } = useCallStateHooks();
  const roomSettings = useRoomSettingByCallId(call?.id);
  const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [selectedBanUserId, setSelectedBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

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

  // Mock completed goals for now
  const [completedGoals, setCompletedGoals] = useState<string[]>(['join']);

  // Start tracking when call is joined
  useEffect(() => {
    if (callingState === CallingState.JOINED && call?.id) {
      startTracking();
      
      // Access is already checked before joining, so we just start tracking
    }
  }, [callingState, call?.id, startTracking]);

  // End tracking when component unmounts or call ends
  useEffect(() => {
    return () => {
      if (isTracking) {
        endTracking();
      }
    };
  }, []);

  useEffect(() => {
    if (!call) return;
    const handler = async (e: any) => {
      const leftId = e.participant?.userId || e.participant?.user?.id;
      if (leftId === hostId) {
        try {
          // End tracking before call cleanup
          await endTracking();
          // Don't try to delete the call - let the webhook handle room cleanup
          // The webhook will end the room when all participants leave
        } catch (err) {
          console.error('Failed to handle host leaving', err);
        }
      }
    };
    const unsub = call.on('participantLeft', handler);
    return () => {
      unsub?.();
    };
  }, [call, hostId]);

  useEffect(() => {
    if (!call) return;

    // Handler for when the user is removed from the call
    const handleCallEnded = (event: any) => {
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.'
      });
      router.push('/meetups/study-groups');
    };

    // Handler for when the user is removed/kicked
    const handleRemoved = (event: any) => {
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.'
      });
      router.push('/meetups/study-groups');
    };

    // Handler for when the call state changes
    const handleCallStateChanged = (event: any) => {
      if (event.state === 'ended' || event.state === 'disconnected') {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room by the host.',
        });
        router.push('/meetups/study-groups');
      }
    };

    // Handler for when participants are removed
    const handleParticipantLeft = (event: any) => {
      const leftUserId = event.participant?.userId || event.participant?.user?.id;
      
      // Check if the current user was removed
      if (leftUserId === currentUserId) {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room by the host.',
        });
        router.push('/meetups/study-groups');
      } else {
        // Another participant left the call
        if (isHost) {
          toast({
            title: 'Participant left',
            description: `A participant has left the call.`,
          });
        }
      }
    };

    // Handler for when call custom state changes (for forced disconnection)
    const handleCallCustomChanged = (custom: any) => {
      if (custom.forceUserDisconnect && custom.forceUserDisconnect === currentUserId) {
        toast({
          title: 'Banned from call',
          description: 'You have been banned from this room by the host.',
          variant: 'destructive',
        });
        // Force the user to leave the call
        call.leave();
        router.push('/meetups/study-groups');
      }
    };

    // Listen for multiple events
    call.on('callEnded', handleCallEnded);
    call.on('participantLeft', handleParticipantLeft);
    
    // Listen for custom state changes
    const customSubscription = call.state.custom$.subscribe(handleCallCustomChanged);

    return () => {
      call.off('callEnded', handleCallEnded);
      call.off('participantLeft', handleParticipantLeft);
      customSubscription?.unsubscribe();
    };
  }, [call, router, toast, currentUserId]);

  // Keep event listeners for when user is removed during the call
  useEffect(() => {
    if (!call || !currentUserId) return;

    const checkUserInCall = async () => {
      // Only check if user is still in the call (for cases where they're removed during the call)
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

    // Check every 1 second for more responsive removal detection
    const interval = setInterval(checkUserInCall, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [call, currentUserId, router, toast]);

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const reportTypes = [
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <>
      {callingState !== CallingState.JOINED || isCheckingAccess ? (
        <Loader />
      ) : (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      {/* Overlay: Group name title and MeetingGoalsBar */}
      <div className="absolute top-0 left-0 w-full flex flex-col items-center z-20 p-3 sm:p-6 pointer-events-none">
        <div className="backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-md pointer-events-auto rounded-[8px]">
          <h1 className="text-2xl sm:text-4xl font-semibold text-[#19232d] mb-[1.5rem] sm:mb-[3rem] text-center">
            Group Name: {groupName}
          </h1>
          <MeetingGoalsBar completedGoals={completedGoals} />
        </div>
      </div>
      
      {/* Vertical Study Progress Widget - Right Side (Desktop Only) */}
      <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-30 pointer-events-none hidden 2xl:block">
        <StudyTimeProgress 
          dailyHours={dailyHours} 
          isTracking={isTracking}
          className="w-25"
        />
      </div>
      
      <div className="relative flex size-full items-center justify-center pb-60 sm:pb-56 md:pb-52">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        {/* Background overlay for small screens and tablets */}
        {showParticipants && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowParticipants(false)}
          />
        )}
        
        <div
          className={cn('h-[calc(100vh-86px)] hidden', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      
      {/* Mobile Study Progress Widget - Above Call Controls (Small Screens and Tablets) */}
      <div className="block 2xl:hidden absolute bottom-52 sm:bottom-48 md:bottom-44 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <MobileStudyTimeProgress 
          dailyHours={dailyHours} 
          isTracking={isTracking}
          className="w-80 sm:w-96 md:w-[90vw]"
        />
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 left-0 right-0 rounded-t-xl flex w-full items-center justify-center gap-5 flex-wrap p-4 bg-black/20 backdrop-blur-sm">
         <StudyCallControls
          onLeave={async () => {
            await endTracking();
            router.push(`/meetups/study-groups`);
          }}
          showMic={roomSettings?.mic === 'flexible'}
          showCamera={roomSettings?.camera === 'flexible'}
          roomSettings={roomSettings}
        />


        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {/* Report Button */}
        <button onClick={() => setShowReportDialog(true)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-red-600 ml-2">
            <Flag size={20} className="text-white" />
          </div>
        </button>
        
        {/* Ban User Button (only for host) */}
        {isHost && (
          <button onClick={() => setShowBanDialog(true)}>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-red-600 ml-2">
              <Shield size={20} className="text-white" />
            </div>
          </button>
        )}
       
        {isHost && <EndCallButton />}
      </div>
      {/* Report Dialog */}
      {showReportDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setShowReportDialog(false);
            setReportReason('');
            setSelectedReportedId('');
            setOtherReportedName('');
            setReportType('INAPPROPRIATE_BEHAVIOR');
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#19232d]">Report Participant</h2>
            <div className="mb-4">
              <label className="block mb-2 text-[#19232d] font-medium">Who are you reporting?</label>
              <Select value={selectedReportedId} onValueChange={setSelectedReportedId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a participant" />
                </SelectTrigger>
                <SelectContent>
                  {call?.state.participants?.map((p: any) => (
                    <SelectItem key={p.userId} value={p.userId}>
                      {p.name || p.user?.name || p.userId}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (not in list)</SelectItem>
                </SelectContent>
              </Select>
              {selectedReportedId === 'other' && (
                <input
                  className="w-full border border-gray-300 rounded p-2 mt-2 text-black"
                  placeholder="Enter name or details"
                  value={otherReportedName}
                  onChange={e => setOtherReportedName(e.target.value)}
                />
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-[#19232d] font-medium">Type of Report</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(rt => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4 text-black"
              rows={4}
              placeholder="Describe the issue..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                  setSelectedReportedId('');
                  setOtherReportedName('');
                  setReportType('INAPPROPRIATE_BEHAVIOR');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  const reporterId = call?.state.localParticipant?.userId;
                  const reportedId = selectedReportedId === 'other' ? otherReportedName : selectedReportedId;
                  const callId = call?.id;
                  if (!reporterId || !reportedId || !callId || !reportReason.trim()) {
                    toast({
                      title: "Error",
                      description: "Please fill all fields.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const res = await fetch('/api/report', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reporterId, reportedId, callId, reason: reportReason, reportType }),
                    });
                    if (res.ok) {
                      toast({
                        title: "Success",
                        description: "Report submitted successfully!",
                      });
                    } else {
                      toast({
                        title: "Error",
                        description: "Failed to submit report.",
                        variant: "destructive",
                      });
                    }
                  } catch (err) {
                    toast({
                      title: "Error",
                      description: "Failed to submit report.",
                      variant: "destructive",
                    });
                  }
                  setShowReportDialog(false);
                  setReportReason('');
                  setSelectedReportedId('');
                  setOtherReportedName('');
                  setReportType('INAPPROPRIATE_BEHAVIOR');
                }}
                disabled={(!selectedReportedId || (selectedReportedId === 'other' && !otherReportedName.trim()) || !reportReason.trim())}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Dialog */}
      {showBanDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setShowBanDialog(false);
            setSelectedBanUserId('');
            setBanReason('');
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#19232d]">Ban User from Room</h2>
            <div className="mb-4">
              <label className="block mb-2 text-[#19232d] font-medium">Who are you banning?</label>
              <Select value={selectedBanUserId} onValueChange={setSelectedBanUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a participant" />
                </SelectTrigger>
                <SelectContent>
                  {call?.state.participants?.map((p: any) => (
                    <SelectItem key={p.userId} value={p.userId}>
                      {p.name || p.user?.name || p.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-[#19232d] font-medium">Reason (optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 text-black"
                rows={3}
                placeholder="Why are you banning this user?"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-black"
                onClick={() => {
                  setShowBanDialog(false);
                  setSelectedBanUserId('');
                  setBanReason('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  if (!selectedBanUserId || !call?.id) {
                    toast({
                      title: "Error",
                      description: "Please select a user to ban.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const res = await fetch('/api/room/ban', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        userId: selectedBanUserId, 
                        callId: call.id,
                        hostId: currentUserId,
                        reason: banReason.trim() || 'Banned by host'
                      }),
                    });
                    if (res.ok) {
                      toast({
                        title: "Success",
                        description: "User banned and removed from room immediately!",
                      });
                      
                      // Also call the force remove endpoint as an additional measure
                      try {
                        const forceRemoveRes = await fetch('/api/room/force-remove', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: selectedBanUserId, callId: call.id }),
                        });
                        
                        if (forceRemoveRes.ok) {
                          const forceRemoveData = await forceRemoveRes.json();
                          // Don't show call ended toast as we're not ending the call anymore
                        }
                      } catch (forceRemoveError) {
                        console.error('Failed to call force remove:', forceRemoveError);
                      }
                      
                      // Force a refresh of call participants to update the UI
                      if (call) {
                        try {
                          // Try to force the user to leave by updating call state
                          await call.update({
                            custom: { 
                              ...call.state.custom, 
                              bannedUser: selectedBanUserId,
                              banTimestamp: Date.now()
                            }
                          });
                          
                          // Also try to remove the user directly from the call state
                          const participants = call.state.participants || [];
                          const targetParticipant = participants.find((p: any) => 
                            (p.userId || p.user?.id) === selectedBanUserId
                          );
                          
                          if (targetParticipant) {
                            // Try to force a participant list refresh
                            setTimeout(() => {
                              call.update({ 
                                custom: { 
                                  ...call.state.custom, 
                                  forceRefresh: Date.now(),
                                  bannedUser: selectedBanUserId
                                } 
                              });
                            }, 500);
                          }
                          
                          // Note: We don't end the call as it would remove all users
                          // Instead, we rely on the webhook to prevent banned users from rejoining
                          
                          // Set up continuous monitoring to ensure user is removed
                          const monitorInterval = setInterval(async () => {
                            try {
                              const participants = call.state.participants || [];
                              const bannedUserStillInCall = participants.some((p: any) => 
                                (p.userId || p.user?.id) === selectedBanUserId
                              );
                              
                              if (bannedUserStillInCall) {
                                // Call force remove endpoint
                                const forceRemoveRes = await fetch('/api/room/force-remove', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: selectedBanUserId, callId: call.id }),
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
                          }, 5000); // Check every 5 seconds
                          
                          // Stop monitoring after 30 seconds
                          setTimeout(() => {
                            clearInterval(monitorInterval);
                          }, 30000);
                          
                          // Check if the banned user is still in the call after 3 seconds
                          setTimeout(async () => {
                            try {
                              const participants = call.state.participants || [];
                              const bannedUserStillInCall = participants.some((p: any) => 
                                (p.userId || p.user?.id) === selectedBanUserId
                              );
                              
                              if (bannedUserStillInCall) {
                                // Call the force remove endpoint again
                                const forceRemoveRes = await fetch('/api/room/force-remove', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: selectedBanUserId, callId: call.id }),
                                });
                                
                                if (forceRemoveRes.ok) {
                                  const forceRemoveData = await forceRemoveRes.json();
                                }
                                
                                // Additional attempt: try to force the user to leave by updating call state
                                try {
                                  await call.update({
                                    custom: { 
                                      ...call.state.custom, 
                                      forceUserLeave: selectedBanUserId,
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
                      }
                    } else {
                      toast({
                        title: "Error",
                        description: "Failed to ban user from room.",
                        variant: "destructive",
                      });
                    }
                  } catch (err) {
                    toast({
                      title: "Error",
                      description: "Failed to ban user from room.",
                      variant: "destructive",
                    });
                  }
                  setShowBanDialog(false);
                  setSelectedBanUserId('');
                  setBanReason('');
                }}
                disabled={!selectedBanUserId}
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
      )}
    </>
  );
};

export default MeetingRoom;
