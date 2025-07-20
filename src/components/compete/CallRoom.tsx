"use client";
import React, { useState, useEffect } from "react";
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { useRouter, useParams } from "next/navigation";
import { Users, LayoutList, Mic, MicOff, Video, VideoOff, PhoneOff, Flag, Shield } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import { cn } from "@/lib/utils";

import { useQuizRoom, QuizRoom } from "@/hooks/useQuizRoom";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import TopicItem from "./TopicItem";
import { Input } from "../ui/input";
import { useRoomSettingByCallId } from "@/hooks/useRoomSettings";
import EndCallButton from "../EndCallButton";
import { useStreamStudyTimeTracker } from "@/hooks/useStreamStudyTimeTracker";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "../ui/dialog";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const CallRoom = () => {
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedReportedId, setSelectedReportedId] = useState('');
  const [otherReportedName, setOtherReportedName] = useState('');
  const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [selectedBanUserId, setSelectedBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const { useCallCallingState, useLocalParticipant, useCallEndedAt } = useCallStateHooks();
  const { id } = useParams();
  const { toast } = useToast();

  const { data: quizRoom } = useQuizRoom(id as string);
  const [currentRoom, setCurrentRoom] = useState<QuizRoom | null>(null);

  const roomSettings = useRoomSettingByCallId(id as string);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const call = useCall();
  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();
  const callEndedAt = useCallEndedAt();
  const localParticipant = useLocalParticipant();
  const isHost =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  const [currentIdx, setCurrentIdx] = useState(0);
  // Start with Infinity so the first question isn't skipped before the
  // initial timePerQuestion value is loaded from the quiz room settings.
  const [timeLeft, setTimeLeft] = useState(Infinity);
  const [quizEnded, setQuizEnded] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const callHasEnded = !!callEndedAt;
  const { data: results } = useQuizResults(
    quizEnded ? (id as string) : "",
    quizEnded ? (sessionId ?? undefined) : undefined,
  );
  const { user } = useKindeBrowserClient();
  const { startTracking, endTracking, isTracking } = useStreamStudyTimeTracker(call?.id);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Debug logging for quiz room data
  useEffect(() => {
    console.log('CallRoom Debug - Room ID:', id);
    console.log('CallRoom Debug - Quiz Room Data:', quizRoom);
    console.log('CallRoom Debug - Room Settings:', roomSettings);
  }, [id, quizRoom, roomSettings]);

  useEffect(() => {
    if (quizRoom) {
      console.log('CallRoom Debug - Setting current room:', quizRoom);
      setCurrentRoom(quizRoom);
    }
  }, [quizRoom]);

  const reportTypes = [
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'OTHER', label: 'Other' },
  ];
  const [topics, setTopics] = useState<
  Array<{
    title: string;
    description: string;
    backgroundImage: string;
  }>
>([]);
const [searchQuery, setSearchQuery] = useState("");

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
          // Don't call call.delete() - it causes 403 errors for non-host users
          // The webhook will handle room cleanup when the call ends
        } catch (err) {
          console.error("Failed to end call when host left", err);
        }
      } else {
        // Another participant was removed - could be due to ban
        console.log('Another participant left:', leftId);
        // Show a toast to the host that the user was removed
        if (isHost) {
          toast({
            title: 'User removed',
            description: `User has been removed from the call.`,
          });
        }
      }
    };
    const unsub = call.on("participantLeft", handler);
    return () => {
      unsub?.();
    };
  }, [call, isHost, toast]);

  // Listen for forced disconnection due to ban
  useEffect(() => {
    if (!call) return;

    const handleCallCustomChanged = (custom: any) => {
      console.log('Call custom state changed:', custom);
      if (custom.forceUserDisconnect && custom.forceUserDisconnect === localParticipant?.userId) {
        console.log('Forced to disconnect from call due to ban');
        toast({
          title: 'Banned from call',
          description: 'You have been banned from this room by the host.',
          variant: 'destructive',
        });
        // Force the user to leave the call
        call.leave();
        router.push('/meetups/compete');
      }
    };

    // Listen for custom state changes
    const customSubscription = call.state.custom$.subscribe(handleCallCustomChanged);

    return () => {
      customSubscription?.unsubscribe();
    };
  }, [call, localParticipant?.userId, router, toast]);

  useEffect(() => {
    if (quizStarted && callingState !== CallingState.JOINED && !isHost) {
      router.push("/meetups/compete");
    }
  }, [quizStarted, callingState, isHost, router]);

  useEffect(() => {
    if (quizRoom) setCurrentRoom(quizRoom);
  }, [quizRoom]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
        }
      } catch (err) {
        console.error("Failed to fetch topics", err);
      }
    };
    fetchTopics();
  }, []);


  const handleStartQuiz = async () => {
    if (!isHost || !currentRoom) return;
    const res = await fetch(`/api/quiz-room/${currentRoom.id}/session`, {
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      setSessionId(json.sessionId);
      setStartTimestamp(Date.now());
      await call.update({
        custom: {
          quizStarted: true,
          sessionId: json.sessionId,
          currentIdx: 0,
          startTime: Date.now(),
          quizEnded: false,
        },
      });
    }
  };

  const handleRestartQuiz = async () => {
    if (!isHost || !currentRoom) return;
    const res = await fetch(`/api/quiz-room/${currentRoom.id}/session`, {
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      setSessionId(json.sessionId);
      setStartTimestamp(Date.now());
      setQuizEnded(false);
      setQuizStarted(true);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      const t = roomSettings?.timePerQuestion ?? currentRoom.timePerQuestion;
      setTimeLeft(t === null ? Infinity : t);
      await call.update({
        custom: {
          quizStarted: true,
          sessionId: json.sessionId,
          currentIdx: 0,
          startTime: Date.now(),
          quizEnded: false,
        },
      });
    }
  };

  const handleSelectTopic = async (topic: string) => {
    if (!currentRoom) return;
    try {
      const qRes = await fetch(
        `/api/questions?topic=${encodeURIComponent(topic)}`,
      );
      if (qRes.ok) {
        const questions = await qRes.json();
        const updateRes = await fetch(
          `/api/quiz-room/${currentRoom.id}/questions`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions }),
          },
        );
        if (updateRes.ok) {
          const roomRes = await fetch(`/api/quiz-room/${currentRoom.id}`);
          if (roomRes.ok) {
            const updatedRoom = await roomRes.json();
            setCurrentRoom(updatedRoom);
          } else {
            setCurrentRoom({ ...currentRoom, questions });
          }
        }
        setQuizStarted(false);
        setQuizEnded(false);
        setCurrentIdx(0);
        setSelectedAnswer(null);
        setSessionId(null);
        await call?.update({
          custom: { quizStarted: false, currentIdx: 0, quizEnded: false },
        });
      }
    } catch (error) {
      console.error("Failed to load topic", error);
    }
    setShowTopicModal(false);
  };

  useEffect(() => {
    if (!call) return;
    const sub = call.state.custom$.subscribe((custom: any) => {
      if (custom.quizStarted) setQuizStarted(true);
      if (custom.sessionId) setSessionId(custom.sessionId);
      if (typeof custom.currentIdx === "number")
        setCurrentIdx(custom.currentIdx);
      if (typeof custom.startTime === "number") {
        setStartTimestamp(custom.startTime);
        const t = roomSettings?.timePerQuestion ?? currentRoom?.timePerQuestion;
        if (t !== null && t !== undefined) {
          const elapsed = Math.floor((Date.now() - custom.startTime) / 1000);
          setTimeLeft(t === null ? Infinity : Math.max(0, t - elapsed));
        }
      }
      if (custom.quizEnded) setQuizEnded(true);
    });
    return () => sub.unsubscribe();
  }, [call, roomSettings, currentRoom]);

  useEffect(() => {
    if (quizStarted && currentRoom && callingState === CallingState.JOINED) {
      const t = roomSettings?.timePerQuestion ?? currentRoom.timePerQuestion;
      setTimeLeft(t === null ? Infinity : t);
      setStartTimestamp(Date.now());
    }
  }, [currentRoom, callingState, roomSettings, quizStarted]);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const submitAnswer = async (answerText: string) => {
    if (!currentRoom || !currentQuestion || !user || !sessionId) return;
    await fetch(`/api/quiz-room/${currentRoom.id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        questionId: currentQuestion.id,
        sessionId,
        answer: answerText,
      }),
    });
  };

  useEffect(() => {
    if (
      !quizStarted ||
      !currentRoom ||
      quizEnded ||
      callingState !== CallingState.JOINED
    )
      return;
    const questions = roomSettings?.numQuestions
    ? currentRoom.questions.slice(0, roomSettings.numQuestions)
      : currentRoom.questions;
    if (timeLeft <= 0 && timeLeft !== Infinity) {
      if (!selectedAnswer) {
        submitAnswer("blank");
      }
      if (isHost && currentIdx < questions.length - 1) {
        const now = Date.now();
        setCurrentIdx((i) => i + 1);
        call.update({
          custom: {
            ...call.state.custom,
            currentIdx: currentIdx + 1,
            startTime: now,
          },
        });
        const t = roomSettings?.timePerQuestion ?? currentRoom.timePerQuestion;
        setTimeLeft(t === null ? Infinity : t);
        setStartTimestamp(now);
      } else if (isHost) {
        call.update({ custom: { ...call.state.custom, quizEnded: true } });
      }
    }
    if (timeLeft !== Infinity) {
      const t = setTimeout(() => {
        if (startTimestamp) {
          const q = roomSettings?.timePerQuestion ?? currentRoom.timePerQuestion;
          const left =
            q === null
              ? Infinity
              : q - Math.floor((Date.now() - startTimestamp) / 1000);
          setTimeLeft(left);
        }
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [
    currentIdx,
    currentRoom,
    timeLeft,
    quizEnded,
    callingState,
    roomSettings,
    quizStarted,
    selectedAnswer,
    isHost,
    startTimestamp,
  ]);

  const questions = roomSettings?.numQuestions
  ? currentRoom?.questions?.slice(0, roomSettings.numQuestions) || []
  : currentRoom?.questions || [];

  const currentQuestion = questions[currentIdx];

  const sendAnswer = async (answerKey: "A" | "B" | "C" | "D") => {
    if (!currentRoom || !currentQuestion || !user || !sessionId) return;
    setSelectedAnswer(answerKey);

    const answerText =
      answerKey === "A"
        ? currentQuestion.optionA
        : answerKey === "B"
          ? currentQuestion.optionB
          : answerKey === "C"
            ? currentQuestion.optionC
            : currentQuestion.optionD;

    await submitAnswer(answerText);
  };

  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentIdx, currentRoom]);

  if (callHasEnded) return <Alert title="The call has been ended by the host" />;

  if (callingState !== CallingState.JOINED) return <Loader />;

  let LayoutComponent;
  let layoutProps = {};
  switch (layout) {
    case "grid":
      LayoutComponent = PaginatedGridLayout;
      break;
    case "speaker-right":
      LayoutComponent = SpeakerLayout;
      layoutProps = { participantsBarPosition: "left" };
      break;
    default:
      LayoutComponent = SpeakerLayout;
      layoutProps = { participantsBarPosition: "right" };
      break;
  }

  return (
    <section className="relative h-screen w-full pt-2 text-white">
      <div className="absolute top-0 left-0 w-full flex flex-col items-center z-20 p-6 pointer-events-none">
        <div className="backdrop-blur-sm rounded-xl p-6 shadow-md pointer-events-auto rounded-[8px]">
          <h1 className="text-4xl font-semibold text-[#19232d] text-center">
            Room Name: {currentRoom?.name}
          </h1>
        </div>
      </div>

      {/* video layout */}
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex flex-row items-center gap-5">
          {!quizEnded && (
            <>
              {!quizStarted ? (
                <div className="relative w-[35rem] h-[40rem] mx-auto mr-[2rem] flex items-center justify-center">
                  <p className="text-gray-700 font-semibold">
                    {isHost
                      ? "Start the quiz using the controls below."
                      : "Waiting for host to start..."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Question sheet */}
                  <div className="relative w-[35rem] h-[40rem] mx-auto mr-[2rem]">
                    {/* Bottom Card */}
                    <div
                      className="absolute w-[32rem] h-[40rem] inset-0 translate-y-[-35px] ml-[10px]
                              translate-x-[28px] bg-rose-200 border border-white rounded-[30px] shadow-md
                              flex items-center justify-center text-xl font-bold text-gray-600"
                    ></div>

                    {/* Middle Card */}
                    <div
                      className="absolute w-[35rem] h-[40rem] inset-0 translate-y-[-18px] translate-x-[14px]
                              bg-red-200 border border-white rounded-[30px] shadow-md flex items-center justify-center
                              text-xl font-bold text-gray-600"
                    ></div>

                    {/* Top Card */}
                    <div
                      className="bg-red-100 absolute w-[37rem] h-[40rem] inset-0 border border-white rounded-[30px]
                              shadow-md flex items-center justify-center text-xl font-bold text-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <h1 className="text-3xl font-bold text-gray-600 mb-7">
                          Question:
                        </h1>
                        <p className="text-gray-600 font-light text-center w-[30rem]">
                          {currentQuestion?.question}
                        </p>
                        {timeLeft === Infinity ? (
                          <p className="mt-4 text-gray-500">Time: unlimited</p>
                        ) : (
                          <p className="mt-4 text-gray-500">
                            Time left: {timeLeft}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answer sheet */}
                  <div className=" flex flex-col items-center justify-center w-[35rem] h-[40rem] mx-auto gap-5">
                    <button
                      onClick={() => sendAnswer("A")}
                      className={cn(
                        "bg-thanodi-lightPeach border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xl font-bold text-gray-600 p-5",
                        selectedAnswer === "A" && "bg-gray-400",
                      )}
                    >
                      <h1 className="text-3xl font-bold text-gray-600 mr-5">
                        A
                      </h1>
                      <p className="text-gray-600 font-light text-center w-[30rem]">
                        {currentQuestion?.optionA}
                      </p>
                    </button>

                    <button
                      onClick={() => sendAnswer("B")}
                      className={cn(
                        "bg-thanodi-blue border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xl font-bold text-gray-600 p-5",
                        selectedAnswer === "B" && "bg-gray-400",
                      )}
                    >
                      <h1 className="text-3xl font-bold text-gray-600 mr-5">
                        B
                      </h1>
                      <p className="text-gray-600 font-light text-center w-[30rem]">
                        {currentQuestion?.optionB}
                      </p>
                    </button>

                    <button
                      onClick={() => sendAnswer("C")}
                      className={cn(
                        "bg-thanodi-lightBlue border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xl font-bold text-gray-600 p-5",
                        selectedAnswer === "C" && "bg-gray-400",
                      )}
                    >
                      <h1 className="text-3xl font-bold text-gray-600 mr-5">
                        C
                      </h1>
                      <p className="text-gray-600 font-light text-center w-[30rem]">
                        {currentQuestion?.optionC}
                      </p>
                    </button>

                    <button
                      onClick={() => sendAnswer("D")}
                      className={cn(
                        "bg-thanodi-cream border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xl font-bold text-gray-600 p-5",
                        selectedAnswer === "D" && "bg-gray-400",
                      )}
                    >
                      <h1 className="text-3xl font-bold text-gray-600 mr-5">
                        D
                      </h1>
                      <p className="text-gray-600 font-light text-center w-[30rem]">
                        {currentQuestion?.optionD}
                      </p>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {quizEnded && (
            <div className="w-[70rem] h-[40rem] mx-auto mr-10 p-10 bg-white/50 rounded-[30px] shadow-md text-gray-700 flex flex-col">
              <h2 className="text-3xl font-bold mb-4 text-center">Results</h2>
              {results ? (
                <div className="space-y-2 overflow-y-auto flex-1">
                  {results.users
                    .sort((a, b) => b.score - a.score)
                    .map((u) => (
                      <div
                        key={u.userId}
                        className="border-t border-gray-300 py-5"
                      >
                        <p className="font-semibold text-gray-700 mb-2">
                          {u.username} - Score: {u.score}
                        </p>
                        <div className="flex gap-4 ml-4 mb-4">
                          <p className="font-medium text-green-700">
                            Correct:{" "}
                            {u.answers.filter((a) => a.isCorrect).length}
                          </p>
                          <p className="font-medium text-red-700">
                            Wrong:{" "}
                            {u.answers.filter((a) => !a.isCorrect).length}
                          </p>
                        </div>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                          {u.answers.map((a) => (
                            <li key={a.questionId}>
                              <span className="font-medium">{a.question}</span>
                              <div
                                className={cn(
                                  a.isCorrect
                                    ? "text-green-700 ml-5"
                                    : "text-red-700 ml-5",
                                )}
                              >
                                {a.answer === "blank" ? "blank" : a.answer}
                              </div>
                              {!a.isCorrect && (
                                <div className="text-green-700 ml-5">
                                  Correct answer: {a.correctAnswer}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center">Loading...</p>
              )}
            </div>
          )}
          {/* Call video */}
          <div className="relative w-[50rem] max-w-2xl mb-8">
            <LayoutComponent {...layoutProps} />
          </div>
        </div>
        <div
          className={cn("h-[calc(100vh-86px)] hidden ml-2", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* call controls */}
      <div className="fixed bottom-0 left-0 right-0 rounded-t-xl flex w-full items-center justify-center gap-5 flex-wrap p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Custom call controls based on room settings */}
          {roomSettings?.mic === 'flexible' && call && (
            <button
              onClick={() => {
                if (call.microphone.state.status === 'enabled') {
                  call.microphone.disable();
                } else {
                  call.microphone.enable();
                }
              }}
              className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] flex items-center justify-center"
            >
              {call.microphone.state.status === 'enabled' ? (
                <Mic size={20} className="text-white" />
              ) : (
                <MicOff size={20} className="text-white" />
              )}
            </button>
          )}
          {roomSettings?.camera === 'flexible' && call && (
            <button
              onClick={() => {
                if (call.camera.state.status === 'enabled') {
                  call.camera.disable();
                } else {
                  call.camera.enable();
                }
              }}
              className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] flex items-center justify-center"
            >
              {call.camera.state.status === 'enabled' ? (
                <Video size={20} className="text-white" />
              ) : (
                <VideoOff size={20} className="text-white" />
              )}
            </button>
          )}
          <button
            onClick={() => router.push(`/meetups/compete`)}
            className="cursor-pointer rounded-2xl bg-red-500 px-4 py-2 hover:bg-red-600 flex items-center justify-center"
          >
            <PhoneOff size={20} className="text-white" />
          </button>
        </div>
        {isHost && <EndCallButton />}
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent className="border-thanodi-peach bg-thanodi-peach text-white">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
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
        {isHost && !quizStarted && (
          <button
            onClick={handleStartQuiz}
            className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] rounded-2xl shadow-md flex items-center justify-center text-sm text-white"
          >
            Start Quiz
          </button>
        )}

        {isHost && (
          <button
            onClick={handleRestartQuiz}
            className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] rounded-2xl shadow-md flex items-center justify-center text-sm text-white"
          >
            Restart Quiz
          </button>
        )}
          {isHost && (
          <button
            className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] rounded-2xl shadow-md flex items-center justify-center text-sm text-white"
            onClick={() => setShowTopicModal(true)}
          >
            Choose a topic
          </button>
        )}

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] ">
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

      </div>

      <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
        <DialogPortal>
          <DialogOverlay className="bg-black/50 backdrop-blur-md" />
          <DialogContent className="bg-white max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose a Topic</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="my-4"
            />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {topics
                .filter((t) =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((topic) => (
                  <TopicItem
                    key={topic.title}
                    title={topic.title}
                    description={topic.description}
                    handleClick={() => handleSelectTopic(topic.title)}
                  />
                ))}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

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
                        hostId: localParticipant?.userId,
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
                          console.log('Force remove response:', forceRemoveData);
                          // Don't show call ended toast as we're not ending the call anymore
                        }
                      } catch (forceRemoveError) {
                        console.error('Failed to call force remove:', forceRemoveError);
                      }
                      
                      // Force a refresh of call participants to update the UI
                      if (call) {
                        try {
                          // Try to force the user to leave by updating call state
                          console.log('Attempting to force user removal via call state update');
                          
                          // Update call with a custom property that might trigger removal
                          await call.update({
                            custom: { 
                              ...call.state.custom, 
                              bannedUser: selectedBanUserId,
                              banTimestamp: Date.now()
                            }
                          });
                          
                          console.log('Forced call update after ban');
                          
                          // Also try to remove the user directly from the call state
                          const participants = call.state.participants || [];
                          const targetParticipant = participants.find((p: any) => 
                            (p.userId || p.user?.id) === selectedBanUserId
                          );
                          
                          if (targetParticipant) {
                            console.log('Found target participant, attempting direct removal');
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
                          console.log('User ban applied - webhook will prevent rejoining');
                          
                          // Set up continuous monitoring to ensure user is removed
                          const monitorInterval = setInterval(async () => {
                            try {
                              const participants = call.state.participants || [];
                              const bannedUserStillInCall = participants.some((p: any) => 
                                (p.userId || p.user?.id) === selectedBanUserId
                              );
                              
                              if (bannedUserStillInCall) {
                                console.log('Banned user still in call, continuing to force removal');
                                // Call force remove endpoint
                                const forceRemoveRes = await fetch('/api/room/force-remove', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: selectedBanUserId, callId: call.id }),
                                });
                                
                                if (forceRemoveRes.ok) {
                                  const forceRemoveData = await forceRemoveRes.json();
                                  console.log('Continuous force remove response:', forceRemoveData);
                                }
                              } else {
                                console.log('Banned user successfully removed, stopping monitoring');
                                clearInterval(monitorInterval);
                              }
                            } catch (monitorError) {
                              console.error('Failed to monitor user removal:', monitorError);
                            }
                          }, 5000); // Check every 5 seconds
                          
                          // Stop monitoring after 30 seconds
                          setTimeout(() => {
                            clearInterval(monitorInterval);
                            console.log('Stopped monitoring user removal after 30 seconds');
                          }, 30000);
                          
                          // Check if the banned user is still in the call after 3 seconds
                          setTimeout(async () => {
                            try {
                              const participants = call.state.participants || [];
                              const bannedUserStillInCall = participants.some((p: any) => 
                                (p.userId || p.user?.id) === selectedBanUserId
                              );
                              
                              if (bannedUserStillInCall) {
                                console.log('Banned user still in call after 3 seconds, forcing removal');
                                // Call the force remove endpoint again
                                const forceRemoveRes = await fetch('/api/room/force-remove', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: selectedBanUserId, callId: call.id }),
                                });
                                
                                if (forceRemoveRes.ok) {
                                  const forceRemoveData = await forceRemoveRes.json();
                                  console.log('Second force remove response:', forceRemoveData);
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
                                  console.log('Forced call update to remove user');
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
  );
};

export default CallRoom;