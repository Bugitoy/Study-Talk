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
import { Users, LayoutList, CheckCircle, Circle, SquarePlus, Handshake, MessageSquareText, Hourglass } from 'lucide-react';

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
  const isPersonalRoom = !!searchParams.get('personal');
  const groupName = searchParams.get('name') || 'Study Group';
  const router = useRouter();
  const call = useCall();
  const { startTracking, endTracking, isTracking, dailyHours } = useStreamStudyTimeTracker(call?.id);
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const roomSettings = useRoomSettingByCallId(call?.id);

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  // Mock completed goals for now
  const [completedGoals, setCompletedGoals] = useState<string[]>(['join']);

  // Start tracking when call is joined
  useEffect(() => {
    if (callingState === CallingState.JOINED && call?.id) {
      startTracking();
    }
  }, [callingState, call?.id]);

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
    const hostId = call.state.createdBy?.id;
    if (!hostId) return;
    const handler = async (e: any) => {
      const leftId = e.participant?.userId || e.participant?.user?.id;
      if (leftId === hostId) {
        try {
          // End tracking before call cleanup
          await endTracking();
          await call.endCall();
          await call.delete();
          try {
            await fetch(`/api/study-groups/${call.id}`, { method: 'PUT' });
          } catch (err) {
            console.error('Failed to mark study group ended', err);
          }
        } catch (err) {
          console.error('Failed to end call when host left', err);
        }
      }
    };
    const unsub = call.on('participantLeft', handler);
    return () => {
      unsub?.();
    };
  }, [call]);
  
  if (callingState !== CallingState.JOINED) return <Loader />;

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

  return (
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
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
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
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
