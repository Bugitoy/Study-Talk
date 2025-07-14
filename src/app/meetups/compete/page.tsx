'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

import NextLayout from '@/components/NextLayout';
import GroupCard from '@/components/group';
import MeetingModal from '@/components/MeetingModal';

import { usePublicCalls } from '@/hooks/usePublicCalls';

const pastelColors = [
  'bg-thanodi-lightPeach',
  'bg-thanodi-blue',
  'bg-thanodi-peach',
  'bg-thanodi-yellow',
  'bg-thanodi-lightPeach',
  'bg-thanodi-blue',
];

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '/meetups/compete/room/',
  };

const Compete = ({setIsSetupComplete}: {setIsSetupComplete: (isSetupComplete: boolean) => void}) => {
  const [search, setSearch] = useState('');

  const router = useRouter();
  const [meetingState, setMeetingState] = useState< 'isJoiningMeeting' | undefined >(undefined);
  const [values, setValues] = useState(initialValues);
  const { calls } = usePublicCalls();

  return (
    <NextLayout>
      <div className="flex flex-col gap-12">

        <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 mb-2">
          <h1 className="text-4xl font-extrabold text-lightBlue-100 lg:text-7xl text-center lg:text-left">
            Compete with people on various topics
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
        <div className="max-w-4xl mx-auto w-full flex items-center mb-4">
            <div className="flex w-full gap-8">
                <div
                    className="flex-grow h-[80px] bg-yellow-300 rounded-lg cursor-pointer select-none
                        active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941]
                        active:border-b-[0px]
                        transition-all duration-150 [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941]
                        border-b-[1px] border-yellow-400 shadow"
                    tabIndex={0}
                    role="button"
                    onClick={() => router.push('')}
                >
                <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-lg">
                    Join a random room
                </span>
                </div>

                <div
                    className="flex-grow h-[80px] bg-yellow-300 rounded-lg cursor-pointer select-none
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

                <div
                    className="flex-grow h-[80px] bg-yellow-300 rounded-lg cursor-pointer select-none
                            active:translate-y-2 active:[box-shadow:0_0px_0_0_#F7D379,0_0px_0_0_#F7D37941]
                            active:border-b-[0px]
                            transition-all duration-150 [box-shadow:0_10px_0_0_#F7D379,0_15px_0_0_#F7D37941]
                            border-b-[1px] border-yellow-400 shadow"
                    tabIndex={0}
                    role="button"
                    onClick={() => router.push('/meetups/compete/create-room')}
                >
                <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-lg">
                    Create a room
                </span>
                </div>
            </div>
        </div>
        
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {calls.length === 0 && (
            <p className="text-center text-gray-500 col-span-full">No public rooms available</p>
          )}
          {calls.map((call, i) => {
            const pics = call.state.members.map((m) => m.user?.image || '/Images/temp-profiles/profile1.png');
            const name = (call.state.custom as any)?.roomName || 'Unnamed Room';
            return (
              <GroupCard
                key={call.id}
                title={name}
                peopleCount={call.state.members.length}
                profilePics={pics}
                onJoin={() => router.push(`/meetups/compete/room/${call.id}`)}
                color={pastelColors[i % pastelColors.length]}
              />
            );
          })}
        </div>

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => {
          router.push(values.link);
        }}
      >
        <Input
          placeholder="Meeting Link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px] text-center"
        />
      </MeetingModal>
      </div>
    </NextLayout>
  );
};

export default Compete;
