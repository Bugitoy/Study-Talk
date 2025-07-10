'use client';
import React, { useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Loader from '@/components/Loader';
import EndCallButton from '@/components/EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';


const CallRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const topicName = searchParams.get('name') || 'Unnamed topic';
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

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
    <section className="relative h-screen w-full pt-4 text-white">
  
      <div className="absolute top-0 left-0 w-full flex flex-col items-center z-20 p-6 pointer-events-none">
        <div className="backdrop-blur-sm rounded-xl p-6 shadow-md mb-2 pointer-events-auto rounded-[8px]">
          <h1 className="text-4xl font-semibold text-[#19232d] text-center">
            Topic: {topicName}
          </h1>
        </div>
      </div>
        
      {/* video layout */}
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex flex-row items-center gap-5">
            {/* Question sheet */}
            <div className="relative w-[35rem] h-[40rem] mx-auto mr-10">
                {/* Bottom Card */}
                <div className="absolute w-[32rem] h-[40rem] inset-0 translate-y-[-35px] ml-[10px]
                                translate-x-[28px] bg-rose-200 border border-white rounded-[30px] shadow-md 
                                flex items-center justify-center text-xl font-bold text-gray-600">
                </div>

                {/* Middle Card */}
                <div className="absolute w-[35rem] h-[40rem] inset-0 translate-y-[-18px] translate-x-[14px] 
                                bg-red-200 border border-white rounded-[30px] shadow-md flex items-center justify-center 
                                text-xl font-bold text-gray-600">
                </div>

                {/* Top Card */}
                <div className="bg-red-100 absolute w-[37rem] h-[40rem] inset-0 border border-white rounded-[30px] 
                                shadow-md flex items-center justify-center text-xl font-bold text-gray-600">
                    <div className="flex flex-col items-center justify-center"> 
                        <h1 className="text-3xl font-bold text-gray-600 mb-7">Question:</h1>
                        <p className="text-gray-600 font-light text-center w-[30rem]">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor 
                            sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae 
                            voluptatem quas iusto, quidem aperiam sequi harum debitis tenetur corporis eos tempore libero! 
                            Eligendi? Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor 
                            sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae 
                            voluptatem quas iusto, quidem aperiam sequi harum debitis tenetur corporis eos tempore libero! 
                            Eligendi? Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor 
                            sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae 
                            voluptatem quas iusto, quidem aperiam sequi harum debitis tenetur corporis eos tempore libero! 
                            Eligendi?
                        </p>
                    </div>
                </div>
            </div>

            {/* Answer sheet */}
            <div className=" flex flex-col items-center justify-center w-[35rem] h-[40rem] mx-auto gap-5">
        
                    <div className="bg-thanodi-lightPeach border border-gray-300 rounded-[30px] shadow-md flex items-center 
                                    justify-center text-xl font-bold text-gray-600 p-5"> 
                        <h1 className="text-3xl font-bold text-gray-600 mr-5">A</h1>
                        <p className="text-gray-600 font-light text-center w-[30rem]">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor 
                            sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae 
                            voluptatem quas iusto.
                        </p>
                    </div>
      
                    <div className="bg-thanodi-blue border border-gray-300 rounded-[30px] shadow-md flex items-center 
                                    justify-center text-xl font-bold text-gray-600 p-5"> 
                        <h1 className="text-3xl font-bold text-gray-600 mr-5">B</h1>
                        <p className="text-gray-600 font-light text-center w-[30rem]">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor 
                            sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae 
                            voluptatem quas iusto.
                        </p>
                    </div>
             
                    <div className="bg-thanodi-lightBlue border border-gray-300 rounded-[30px] shadow-md flex items-center 
                                    justify-center text-xl font-bold text-gray-600 p-5"> 
                        <h1 className="text-3xl font-bold text-gray-600 mr-5">C</h1>
                        <p className="text-gray-600 font-light text-center w-[30rem]">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor 
                            sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae 
                            voluptatem quas iusto.
                        </p>
                    </div>

                    <div className="bg-thanodi-cream border border-gray-300 rounded-[30px] shadow-md flex items-center 
                                    justify-center text-xl font-bold text-gray-600 p-5"> 
                        <h1 className="text-3xl font-bold text-gray-600 mr-5">D</h1>
                        <p className="text-gray-600 font-light text-center w-[30rem]">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor 
                            sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae 
                            voluptatem quas iusto.
                        </p>
                    </div>
              
            </div>

            {/* Call video */}
            <div className="relative w-full max-w-2xl mx-auto mb-8">
                <CallLayout />
            </div>

            
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* call controls */}
        <div className="fixed bottom-0 left-0 right-0 rounded-t-xl flex w-full items-center justify-center gap-5 flex-wrap p-4 bg-black/20 backdrop-blur-sm">
            <CallControls onLeave={() => router.push(`/meetups/compete`)} />
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

export default CallRoom;
