'use client';
import React, { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
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

import { useQuizRoom } from '@/hooks/useQuizRoom';
import { useQuizResults } from '@/hooks/useQuizResults';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';


const CallRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const { id } = useParams();
  
  const { data: quizRoom } = useQuizRoom(id as string);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const { data: results } = useQuizResults(quizEnded ? (id as string) : '');
  const { user } = useKindeBrowserClient();

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  useEffect(() => {
    if (quizRoom && callingState === CallingState.JOINED) {
      setTimeLeft(quizRoom.timePerQuestion === null ? Infinity : quizRoom.timePerQuestion);
    }
  }, [quizRoom, callingState]);

  useEffect(() => {
    if (!quizRoom || quizEnded || callingState !== CallingState.JOINED) return;
    if (timeLeft <= 0 && timeLeft !== Infinity) {
      if (currentIdx < quizRoom.questions.length - 1) {
        setCurrentIdx((i) => i + 1);
        setTimeLeft(quizRoom.timePerQuestion === null ? Infinity : quizRoom.timePerQuestion);
      } else {
        setQuizEnded(true);
      }
    }
    if (timeLeft !== Infinity) {
      const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [currentIdx, quizRoom, timeLeft, quizEnded, callingState]);

  const currentQuestion = quizRoom?.questions[currentIdx];
  
  const sendAnswer = async (answer: string) => {
    if (!quizRoom || !currentQuestion || !user) return;
    await fetch(`/api/quiz-room/${quizRoom.id}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        questionId: currentQuestion.id,
        answer,
      }),
    });
  };

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
            Room Name: {quizRoom?.name}
          </h1>
        </div>
      </div>
        
      {/* video layout */}
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex flex-row items-center gap-5">
          {!quizEnded && (
            <>
            {/* Question sheet */}
            <div className="relative w-[35rem] h-[40rem] mx-auto mr-[28rem]">
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
                          {currentQuestion?.question}
                        </p>
                        {timeLeft === Infinity ? (
                          <p className="mt-4 text-gray-500">Time: unlimited</p>
                        ) : (
                          <p className="mt-4 text-gray-500">Time left: {timeLeft}s</p>
                        )}
                  </div>
              </div>
            </div>

            {/* Answer sheet */}
            <div className=" flex flex-col items-center justify-center w-[35rem] h-[40rem] mx-auto gap-5">
        
              <button onClick={() => sendAnswer('A')} className="bg-thanodi-lightPeach border border-gray-300 rounded-[30px] shadow-md flex items-center 
                              justify-center text-xl font-bold text-gray-600 p-5"> 
                  <h1 className="text-3xl font-bold text-gray-600 mr-5">A</h1>
                  <p className="text-gray-600 font-light text-center w-[30rem]">
                      {currentQuestion?.optionA}
                  </p>
              </button>

              <button onClick={() => sendAnswer('B')} className="bg-thanodi-blue border border-gray-300 rounded-[30px] shadow-md flex items-center 
                              justify-center text-xl font-bold text-gray-600 p-5"> 
                  <h1 className="text-3xl font-bold text-gray-600 mr-5">B</h1>
                  <p className="text-gray-600 font-light text-center w-[30rem]">
                      {currentQuestion?.optionB}
                  </p>
              </button>
        
              <button onClick={() => sendAnswer('C')} className="bg-thanodi-lightBlue border border-gray-300 rounded-[30px] shadow-md flex items-center 
                              justify-center text-xl font-bold text-gray-600 p-5"> 
                  <h1 className="text-3xl font-bold text-gray-600 mr-5">C</h1>
                  <p className="text-gray-600 font-light text-center w-[30rem]">
                      {currentQuestion?.optionC}
                  </p>
              </button>

              <button onClick={() => sendAnswer('D')} className="bg-thanodi-cream border border-gray-300 rounded-[30px] shadow-md flex items-center 
                              justify-center text-xl font-bold text-gray-600 p-5"> 
                  <h1 className="text-3xl font-bold text-gray-600 mr-5">D</h1>
                  <p className="text-gray-600 font-light text-center w-[30rem]">
                      {currentQuestion?.optionD}
                  </p>
              </button>
              
            </div>
            </>
            )}
            {quizEnded && (
            <div className="w-[50rem] h-[35rem] mx-auto mr-10 p-10 bg-white/50 rounded-[30px] shadow-md text-gray-700 flex flex-col">
               <h2 className="text-3xl font-bold mb-4 text-center">Results</h2>
               {results ? (
                 <ul className="space-y-2 flex-1 overflow-y-auto">
                   {Object.entries(results).sort((a,b) => b[1]-a[1]).map(([userId, score]) => (
                     <li key={userId} className="flex flex-col justify-between text-gray-600 gap-2">
                       <span className="text-gray-600">{userId}</span>
                       <span className="text-gray-600">{score}</span>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-center">Loading...</p>
               )}
            </div>
            )}
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
