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
import { Users, LayoutList, CheckCircle, Circle, SquarePlus, Handshake, MessageSquareText, Hourglass, Flag, Shield } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './StudyEndCallButton';
import { cn } from '@/lib/utils';
import { useRoomSettingByCallId } from '@/hooks/useRoomSettings';
import StudyCallControls from './StudyCallControls';
import { useStreamStudyTimeTracker } from '@/hooks/useStreamStudyTimeTracker';
import { StudyTimeProgress } from './StudyTimeProgress';
import { useToast } from '@/hooks/use-toast';

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
            <div className="flex flex-col items-center w-24">
              <div className={`w-12 h-12 flex items-center justify-center z-10 bg-white rounded-[8px] border-2 ${completedGoals.includes(goal.key) ? 'border-yellow-400' : 'border-gray-300'}`}>
                <Icon className={`w-8 h-8 ${completedGoals.includes(goal.key) ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-2 text-xs text-[#19232d] font-medium text-center w-full">
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
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
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

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  // Get current user and host id
  const hostId = call?.state.createdBy?.id;
  const localParticipant = call?.state.localParticipant;
  const currentUserId = localParticipant?.userId;
  const isHost = currentUserId && hostId && currentUserId === hostId;

  // Mock completed goals for now
  const [completedGoals, setCompletedGoals] = useState<string[]>(['join']);

  // Start tracking when call is joined
  useEffect(() => {
    if (callingState === CallingState.JOINED && call?.id) {
      startTracking();
      
      // Check if current user is banned from this room
      const checkBanStatus = async () => {
        try {
          const res = await fetch(`/api/room/ban/check?userId=${currentUserId}&callId=${call.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.isBanned) {
              toast({
                title: 'Access Denied',
                description: 'You have been banned from this room.',
                variant: 'destructive',
              });
              router.push('/meetups/study-groups');
            }
          }
        } catch (error) {
          console.error('Error checking ban status:', error);
        }
      };
      
      checkBanStatus();
    }
  }, [callingState, call?.id, currentUserId, router, toast]);

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
      console.log('Call ended event:', event);
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.',
        variant: 'destructive',
      });
      router.push('/meetups/study-groups');
    };

    // Handler for when the user is removed/kicked
    const handleRemoved = (event: any) => {
      console.log('User removed event:', event);
      toast({
        title: 'Removed from call',
        description: 'You have been removed from this room by the host.',
        variant: 'destructive',
      });
      router.push('/meetups/study-groups');
    };

    // Handler for when the call state changes
    const handleCallStateChanged = (event: any) => {
      console.log('Call state changed:', event);
      if (event.state === 'ended' || event.state === 'disconnected') {
        toast({
          title: 'Removed from call',
          description: 'You have been removed from this room by the host.',
          variant: 'destructive',
        });
        router.push('/meetups/study-groups');
      }
    };

    // Listen for multiple events
    call.on('callEnded', handleCallEnded);
    // Note: 'removed' and 'callStateChanged' might not be valid event types
    // We'll stick with the main events that are supported

    return () => {
      call.off('callEnded', handleCallEnded);
    };
  }, [call, router, toast]);

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
      {callingState !== CallingState.JOINED ? (
        <Loader />
      ) : (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      {/* Overlay: Group name title and MeetingGoalsBar */}
      <div className="absolute top-0 left-0 w-full flex flex-col items-center z-20 p-6 pointer-events-none">
        <div className="backdrop-blur-sm rounded-xl p-6 shadow-md pointer-events-auto rounded-[8px]">
          <h1 className="text-4xl font-semibold text-[#19232d] mb-[3rem] text-center">
            Group Name: {groupName}
          </h1>
          <MeetingGoalsBar completedGoals={completedGoals} />
        </div>
      </div>
      
      {/* Vertical Study Progress Widget - Right Side */}
      <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <StudyTimeProgress 
          dailyHours={dailyHours} 
          isTracking={isTracking}
          className="w-25"
        />
      </div>
      
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
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
        />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-thanodi-peach bg-thanodi-peach text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#19232d]">Report Participant</h2>
            <div className="mb-4">
              <label className="block mb-2 text-[#19232d] font-medium">Who are you reporting?</label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-black"
                value={selectedReportedId}
                onChange={e => setSelectedReportedId(e.target.value)}
              >
                <option value="">Select a participant</option>
                {call?.state.participants?.map((p: any) => (
                  <option key={p.userId} value={p.userId}>
                    {p.name || p.user?.name || p.userId}
                  </option>
                ))}
                <option value="other">Other (not in list)</option>
              </select>
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
              <select
                className="w-full border border-gray-300 rounded p-2 text-black"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
              >
                {reportTypes.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#19232d]">Ban User from Room</h2>
            <div className="mb-4">
              <label className="block mb-2 text-[#19232d] font-medium">Who are you banning?</label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-black"
                value={selectedBanUserId}
                onChange={e => setSelectedBanUserId(e.target.value)}
              >
                <option value="">Select a participant</option>
                {call?.state.participants?.map((p: any) => (
                  <option key={p.userId} value={p.userId}>
                    {p.name || p.user?.name || p.userId}
                  </option>
                ))}
              </select>
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
                        description: "User banned from room successfully!",
                      });
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
