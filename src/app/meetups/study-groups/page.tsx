'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from '@/hooks/use-toast';
import { Call } from '@stream-io/video-react-sdk';
import { Input } from '@/components/ui/input';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

import NextLayout from '@/components/NextLayout';
import GroupCard from '@/components/group';
import MeetingModal from '@/components/MeetingModal';
import { useStudyGroups } from '@/hooks/useStudyGroups';

const pastelColors = [
  'bg-thanodi-lightPeach',
  'bg-thanodi-blue',
  'bg-thanodi-peach',
  'bg-thanodi-yellow',
  'bg-thanodi-lightPeach',
  'bg-thanodi-blue',
];

const hoursStudied = 7; // Example value
const hoursGoal = 10; // Example goal
const percent = Math.min((hoursStudied / hoursGoal) * 100, 100);

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '/meetups/study-groups/meeting/',
  };

const StudyGroups = () => {
  const [search, setSearch] = useState('');

   // Create meeting and join meeting functionality

  const router = useRouter();
  const [meetingState, setMeetingState] = useState< 'isJoiningMeeting' | 'isInstantMeeting' | undefined >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const groups = useStudyGroups();
  const filteredGroups = groups.filter(g => g.roomName.toLowerCase().includes(search.toLowerCase()));

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
            availability: 'public',
            roomName: description,
          },
        },
      });
      await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: call.id, roomName: description, hostId: user.id }),
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meetups/study-groups/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };


  return (
    <NextLayout>
      <div className="flex flex-col gap-12">
        <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 mb-2">
          <h1 className="text-4xl font-extrabold text-lightBlue-100 lg:text-7xl text-center lg:text-left">
            Join a study group
          </h1>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a study group..."
            className="w-full max-w-xs px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-lg shadow-sm transition-colors"
          />
        </div>
        {/* Custom Progress Bar and Leaderboard Button */}
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            <div
              className="button w-40 h-[50px] bg-yellow-300 rounded-lg cursor-pointer select-none
                active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941]
                active:border-b-[0px]
                transition-all duration-150 [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941]
                border-b-[1px] border-yellow-400 shadow"
              tabIndex={0}
              role="button"
              onClick={() => router.push('/meetups/study-groups/leaderboard')}
            >
              <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-lg">
                Leaderboard
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div
              className="button w-40 h-[50px] bg-yellow-300 rounded-lg cursor-pointer select-none
                active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941]
                active:border-b-[0px]
                transition-all duration-150 [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941]
                border-b-[1px] border-yellow-400 shadow"
              tabIndex={0}
              role="button"
              onClick={() => setMeetingState('isJoiningMeeting')}
            >
              <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-lg">
                Join a room
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div
              className="button w-40 h-[50px] bg-yellow-300 rounded-lg cursor-pointer select-none
                active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941]
                active:border-b-[0px]
                transition-all duration-150 [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941]
                border-b-[1px] border-yellow-400 shadow"
              tabIndex={0}
              role="button"
              onClick={() => setMeetingState('isInstantMeeting')}
            >
              <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-lg">
                Create a room
              </span>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="relative w-full max-w-3xl h-[50px] bg-white rounded-[8px] overflow-hidden flex items-center">
              <div
                className="absolute left-0 top-0 h-full bg-thanodi-blue transition-all duration-500 rounded-[8px]"
                style={{ width: `${percent}%` }}
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700 font-semibold text-lg select-none pointer-events-none">
                Hours studied
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredGroups.length === 0 && (
            <p className="text-center text-gray-500 col-span-full">No rooms available</p>
          )}
          {filteredGroups.map((group, i) => (
            <GroupCard
              key={group.callId}
              title={group.roomName}
              peopleCount={group.members.length}
              profilePics={group.members}
              onJoin={() => router.push(`/meetups/study-groups/meeting/${group.callId}`)}
              color={pastelColors[i % pastelColors.length]}
            />
          ))}
        </div>

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting code"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px] text-center"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Create a study room"
        className="text-center"
        buttonText="Start Room"
        handleClick={createMeeting}
      />
      </div>
    </NextLayout>
  );
};

export default StudyGroups;
