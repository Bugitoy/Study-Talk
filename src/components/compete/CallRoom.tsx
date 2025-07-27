"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition } from "react";
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { useRouter, useParams } from "next/navigation";
import { Users, Mic, MicOff, Video, VideoOff, PhoneOff, Flag, Shield } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Performance optimization: Debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Performance optimization: Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

const CallRoom = () => {
  const router = useRouter();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedReportedId, setSelectedReportedId] = useState('');
  const [otherReportedName, setOtherReportedName] = useState('');
  const [reportType, setReportType] = useState('INAPPROPRIATE_BEHAVIOR');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [selectedBanUserId, setSelectedBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  
  // Add refs to store intervals and timeouts for cleanup
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const banTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Performance optimization: Add state for topics and user quizzes
  const [topics, setTopics] = useState<any[]>([]);
  const [userQuizzes, setUserQuizzes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
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
  
  // Performance optimization: Memoize isHost calculation
  const isHost = useMemo(() => 
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id,
    [localParticipant, call?.state.createdBy]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  // Start with Infinity so the first question isn't skipped before the
  // initial timePerQuestion value is loaded from the quiz room settings.
  const [timeLeft, setTimeLeft] = useState(Infinity);
  const [quizEnded, setQuizEnded] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const callHasEnded = !!callEndedAt;
  
  // Performance optimization: Memoize results query
  const { data: results } = useQuizResults(
    quizEnded ? (id as string) : "",
    quizEnded ? (sessionId ?? undefined) : undefined,
  );
  const { user } = useKindeBrowserClient();
  const { startTracking, endTracking, isTracking } = useStreamStudyTimeTracker(call?.id);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Performance optimization: Memoize current question
  const currentQuestion = useMemo(() => 
    currentRoom?.questions?.[currentIdx] || null,
    [currentRoom?.questions, currentIdx]
  );

  // Performance optimization: Memoize filtered topics and quizzes with better search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase();
    return topics.filter((t) => t.title.toLowerCase().includes(query));
  }, [topics, searchQuery]);

  const filteredUserQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return userQuizzes;
    const query = searchQuery.toLowerCase();
    return userQuizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(query) ||
      quiz.description.toLowerCase().includes(query)
    );
  }, [userQuizzes, searchQuery]);

  // Add cleanup effect for intervals and timeouts
  useEffect(() => {
    return () => {
      // Clean up all intervals and timeouts when component unmounts
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
      }
      if (banTimeoutRef.current) {
        clearTimeout(banTimeoutRef.current);
      }
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  // Performance optimization: Debounced search query
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  // Performance optimization: Cached API fetch function
  const cachedFetch = useCallback(async (url: string, options?: RequestInit) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    } catch (error) {
      console.error('API fetch error:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    if (quizRoom) {
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

  // Performance optimization: Memoized participant left handler
  const handleParticipantLeft = useCallback(async (e: any) => {
      const leftId = e.participant?.userId || e.participant?.user?.id;
    const hostId = call?.state.createdBy?.id;
    
      if (leftId === hostId) {
        try {
          // End tracking before call cleanup
          await endTracking();
        await call?.endCall();
          // Don't call call.delete() - it causes 403 errors for non-host users
          // The webhook will handle room cleanup when the call ends
        } catch (err) {
          console.error("Failed to end call when host left", err);
        }
      } else {
        // Another participant was removed - could be due to ban
        // Show a toast to the host that the user was removed
        if (isHost) {
          toast({
            title: 'User removed',
            description: `User has been removed from the call.`,
          });
        }
      }
  }, [call, isHost, toast, endTracking]);

  useEffect(() => {
    if (!call) return;
    const hostId = call.state.createdBy?.id;
    if (!hostId) return;
    
    const unsub = call.on("participantLeft", handleParticipantLeft);
    return () => {
      unsub?.();
    };
  }, [call, handleParticipantLeft]);

  // Listen for forced disconnection due to ban
  useEffect(() => {
    if (!call) return;

    const handleCallCustomChanged = (custom: any) => {
      if (custom.forceUserDisconnect && custom.forceUserDisconnect === localParticipant?.userId) {
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

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/user-quizzes?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserQuizzes(data);
        }
      } catch (err) {
        console.error("Failed to fetch user quizzes", err);
      }
    };
    fetchUserQuizzes();
  }, [user?.id]);

  // Performance optimization: Memoize questions array
  const questions = useMemo(() => 
    roomSettings?.numQuestions
      ? currentRoom?.questions?.slice(0, roomSettings.numQuestions) || []
      : currentRoom?.questions || [],
    [currentRoom?.questions, roomSettings?.numQuestions]
  );

  // Performance optimization: Memoize time per question
  const timePerQuestion = useMemo(() => 
    roomSettings?.timePerQuestion ?? currentRoom?.timePerQuestion,
    [roomSettings?.timePerQuestion, currentRoom?.timePerQuestion]
  );

  // Performance optimization: Memoize quiz state
  const isQuizActive = useMemo(() => 
    quizStarted && !quizEnded && callingState === CallingState.JOINED,
    [quizStarted, quizEnded, callingState]
  );

  const canStartQuiz = useMemo(() => 
    isHost && !quizStarted && currentRoom && call,
    [isHost, quizStarted, currentRoom, call]
  );

  // Performance optimization: Memoize submit answer function
  const submitAnswer = useCallback(async (answerText: string) => {
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
  }, [currentRoom, currentQuestion, user, sessionId]);

  // Performance optimization: Memoized event handlers
  const handleStartQuiz = useCallback(async () => {
    if (!canStartQuiz) return;
    const res = await fetch(`/api/quiz-room/${currentRoom!.id}/session`, {
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      setSessionId(json.sessionId);
      setStartTimestamp(Date.now());
      await call!.update({
        custom: {
          quizStarted: true,
          sessionId: json.sessionId,
          currentIdx: 0,
          startTime: Date.now(),
          quizEnded: false,
        },
      });
    }
  }, [canStartQuiz, currentRoom, call]);

  const handleRestartQuiz = useCallback(async () => {
    if (!isHost || !currentRoom || !call) return;
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
      setTimeLeft(timePerQuestion === null || timePerQuestion === undefined ? Infinity : timePerQuestion);
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
  }, [isHost, currentRoom, call, timePerQuestion]);

  const handleSelectTopic = useCallback(async (topic: string) => {
    if (!currentRoom) return;
    try {
      const questions = await cachedFetch(`/api/questions?topic=${encodeURIComponent(topic)}`);
      if (questions) {
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
  }, [currentRoom, call, cachedFetch]);

  const handleSelectUserQuiz = useCallback(async (quizId: string) => {
    if (!currentRoom) return;
    try {
      const quizData = await cachedFetch(`/api/user-quizzes/${quizId}`);
      if (quizData) {
        const updateRes = await fetch(
          `/api/quiz-room/${currentRoom.id}/questions`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions: quizData.questions }),
          },
        );
        if (updateRes.ok) {
          const roomRes = await fetch(`/api/quiz-room/${currentRoom.id}`);
          if (roomRes.ok) {
            const updatedRoom = await roomRes.json();
            setCurrentRoom(updatedRoom);
          } else {
            setCurrentRoom({ ...currentRoom, questions: quizData.questions });
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
      console.error("Failed to load user quiz", error);
    }
    setShowTopicModal(false);
  }, [currentRoom, call, cachedFetch]);

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

  // Performance optimization: Optimized timer logic
  useEffect(() => {
    if (!isQuizActive || !currentRoom) {
      return;
    }
    
    // Handle unlimited timer case - advance when answer is selected
    if (timeLeft === Infinity && selectedAnswer && isHost && call) {
      const timer = setTimeout(() => {
        if (currentIdx < questions.length - 1) {
          const now = Date.now();
          setCurrentIdx((i) => i + 1);
          call.update({
            custom: {
              ...call.state.custom,
              currentIdx: currentIdx + 1,
              startTime: now,
            },
          });
          setStartTimestamp(now);
          setSelectedAnswer(null);
        } else {
          call.update({ custom: { ...call.state.custom, quizEnded: true } });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Handle timed questions
    if (timeLeft <= 0 && timeLeft !== Infinity) {
      if (!selectedAnswer) {
        submitAnswer("blank");
      }
      if (isHost && currentIdx < questions.length - 1 && call) {
        const now = Date.now();
        setCurrentIdx((i) => i + 1);
        call.update({
          custom: {
            ...call.state.custom,
            currentIdx: currentIdx + 1,
            startTime: now,
          },
        });
        setTimeLeft(timePerQuestion === null || timePerQuestion === undefined ? Infinity : timePerQuestion);
        setStartTimestamp(now);
      } else if (isHost && call) {
        call.update({ custom: { ...call.state.custom, quizEnded: true } });
      }
    }

    // Timer countdown
    if (timeLeft !== Infinity) {
      const timer = setTimeout(() => {
        if (startTimestamp) {
          const left = timePerQuestion === null || timePerQuestion === undefined
            ? Infinity
            : timePerQuestion - Math.floor((Date.now() - startTimestamp) / 1000);
          setTimeLeft(left);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    isQuizActive,
    currentRoom,
    timeLeft,
    selectedAnswer,
    isHost,
    call,
    currentIdx,
    questions.length,
    startTimestamp,
    timePerQuestion,
    submitAnswer,
  ]);

  // Performance optimization: Memoized answer selection
  const sendAnswer = useCallback(async (answerKey: "A" | "B" | "C" | "D") => {
    if (!currentRoom || !currentQuestion || !user || !sessionId) return;
    
    // Batch state updates
    startTransition(() => {
      setSelectedAnswer(answerKey);
    });

    const answerText =
      answerKey === "A"
        ? currentQuestion.optionA
        : answerKey === "B"
          ? currentQuestion.optionB
          : answerKey === "C"
            ? currentQuestion.optionC
            : currentQuestion.optionD;

    await submitAnswer(answerText);
  }, [currentRoom, currentQuestion, user, sessionId, submitAnswer]);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentIdx, currentRoom]);

  if (callHasEnded) return <Alert title="The call has been ended by the host" />;

  if (callingState !== CallingState.JOINED) return <Loader />;

  const LayoutComponent = PaginatedGridLayout;

  return (
    <section className="relative h-screen w-full pt-0 text-white">
      <div className="absolute top-0 lg:top-[-28px] xl:top-0 left-0 lg:left-[15px] xl:left-0 w-full flex flex-col items-center z-20 pt-0 sm:pt-3 px-3 sm:px-6 pb-3 sm:pb-6 lg:p-2 xl:pb-3 pointer-events-none">
        <div className="backdrop-blur-sm rounded-xl p-3 lg:p-2 xl:p-6 shadow-md pointer-events-auto rounded-[8px]">
          <h1 className="text-2xl sm:text-4xl lg:text-2xl xl:text-4xl font-semibold text-[#19232d] text-center">
            Room Name: {currentRoom?.name}
          </h1>
        </div>
      </div>

      {/* video layout */}
      <div className="relative flex size-full items-center justify-center pb-32 sm:pb-40 md:pb-48 pt-12 sm:pt-24 lg:pt-0">
        <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row items-center gap-0 sm:gap-2 -space-y-2 sm:space-y-0">
          {!quizEnded && (
            <>
              {!quizStarted ? (
                <div className="relative w-full max-w-[25rem] sm:max-w-[30rem] md:max-w-[20rem] lg:max-w-[35rem] xl:max-w-[25rem] 2xl:max-w-[50rem] 3xl:max-w-[60rem] h-[15rem] sm:h-[20rem] md:h-[15rem] lg:h-[40rem] xl:h-[20rem] 2xl:h-[25rem] 3xl:h-[30rem] mx-auto md:mr-[1rem] lg:mr-[2rem] xl:mr-[1rem] flex items-center justify-center p-4">
                  <p className="text-gray-700 font-semibold text-center text-sm sm:text-base">
                    {isHost
                      ? "Start the quiz using the controls below."
                      : "Waiting for host to start..."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Question sheet */}
                  <div className="relative w-full max-w-[25rem] sm:max-w-[30rem] md:max-w-[20rem] lg:max-w-[35rem] xl:max-w-[25rem] 2xl:max-w-[50rem] 3xl:max-w-[60rem] h-[15rem] sm:h-[20rem] md:h-[13rem] lg:h-[25rem] xl:h-[20rem] 2xl:h-[25rem] 3xl:h-[30rem] mx-auto sm:right-0 md:right-0 lg:right-0 xl:right-0 md:mr-[1rem] lg:mr-[2rem] xl:mr-[1rem]">
                    {/* Bottom Card */}
                    <div
                      className="absolute w-[80%] h-full inset-0 translate-y-[-35px] ml-[10px] md:ml-0 lg:ml-[10px] xl:ml-[10px]
                              translate-x-[28px] bg-rose-200 border border-white rounded-[30px] shadow-md
                              flex items-center justify-center text-xl font-bold text-gray-600"
                    ></div>

                    {/* Middle Card */}
                    <div
                      className="absolute w-[93%] md:w-[90%] lg:w-[90%] xl:w-[90%] h-full inset-0 translate-y-[-18px] translate-x-[14px] lg:ml-[4px]
                              bg-red-200 border border-white rounded-[30px] shadow-md flex items-center justify-center
                              text-xl font-bold text-gray-600"
                    ></div>

                    {/* Top Card */}
                    <div
                      className="bg-red-100 absolute w-full h-full inset-0 border border-white rounded-[30px]
                              shadow-md flex items-center justify-center text-xl font-bold text-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center p-4">
                        <h1 className="text-xl sm:text-3xl md:text-xl lg:text-3xl xl:text-2xl 2xl:text-4xl 3xl:text-5xl font-bold text-gray-600 mb-4 sm:mb-7">
                          Question {currentIdx + 1}/{roomSettings?.numQuestions || currentRoom?.questions?.length || 0}:
                        </h1>
                        <p className="text-gray-600 font-light text-center text-sm sm:text-base md:text-sm lg:text-base xl:text-sm 2xl:text-lg 3xl:text-xl max-w-[90%]">
                          {currentQuestion?.question}
                        </p>
                        {timeLeft === Infinity ? (
                          <p className="mt-4 text-gray-500 text-sm sm:text-base md:text-sm lg:text-base xl:text-sm 2xl:text-lg 3xl:text-xl">
                            Click an answer to continue
                          </p>
                        ) : (
                          <p className="mt-4 text-gray-500 text-sm sm:text-base md:text-sm lg:text-base xl:text-sm 2xl:text-lg 3xl:text-xl">
                            Time left: {timeLeft}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answer sheet */}
                  <div className="flex flex-col items-center justify-center w-full max-w-[25rem] sm:max-w-[30rem] md:max-w-[20rem] lg:max-w-[35rem] xl:max-w-[25rem] 2xl:max-w-[50rem] 3xl:max-w-[60rem] h-[15rem] sm:h-[20rem] md:h-[15rem] lg:h-[24rem] xl:h-[20rem] 2xl:h-[25rem] 3xl:h-[30rem] mx-auto gap-2 sm:gap-5 md:gap-2 lg:gap-2 xl:gap-5">
                    <button
                      onClick={() => sendAnswer("A")}
                      disabled={timeLeft === Infinity && selectedAnswer !== null}
                      className={cn(
                        "bg-thanodi-lightPeach border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xs sm:text-xl md:text-sm lg:text-xl xl:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-gray-600 p-2 sm:p-5 md:p-1 lg:p-3 xl:p-4 2xl:p-6 3xl:p-8 w-full",
                        selectedAnswer === "A" && (timeLeft === Infinity ? "bg-green-400" : "bg-gray-400"),
                        timeLeft === Infinity && selectedAnswer !== null && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <h1 className="text-lg sm:text-3xl md:text-lg lg:text-3xl xl:text-2xl 2xl:text-4xl 3xl:text-5xl font-bold text-gray-600 ml-2 mr-1 sm:mr-5">
                        A
                      </h1>
                      <p className="text-gray-600 font-light text-center text-xs sm:text-base md:text-xs lg:text-base xl:text-sm 2xl:text-lg 3xl:text-xl flex-1">
                        {currentQuestion?.optionA}
                      </p>
                    </button>

                    <button
                      onClick={() => sendAnswer("B")}
                      disabled={timeLeft === Infinity && selectedAnswer !== null}
                      className={cn(
                        "bg-thanodi-blue border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xs sm:text-xl md:text-sm lg:text-xl xl:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-gray-600 p-2 sm:p-5 md:p-3 lg:p-5 xl:p-4 2xl:p-6 3xl:p-8 w-full",
                        selectedAnswer === "B" && (timeLeft === Infinity ? "bg-green-400" : "bg-gray-400"),
                        timeLeft === Infinity && selectedAnswer !== null && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <h1 className="text-lg sm:text-3xl md:text-lg lg:text-3xl xl:text-2xl 2xl:text-4xl 3xl:text-5xl font-bold text-gray-600 ml-2 mr-1 sm:mr-5">
                        B
                      </h1>
                      <p className="text-gray-600 font-light text-center text-xs sm:text-base md:text-xs lg:text-base xl:text-sm 2xl:text-lg 3xl:text-xl flex-1">
                        {currentQuestion?.optionB}
                      </p>
                    </button>

                    <button
                      onClick={() => sendAnswer("C")}
                      disabled={timeLeft === Infinity && selectedAnswer !== null}
                      className={cn(
                        "bg-thanodi-lightBlue border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xs sm:text-xl md:text-sm lg:text-xl xl:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-gray-600 p-2 sm:p-5 md:p-3 lg:p-5 xl:p-4 2xl:p-6 3xl:p-8 w-full",
                        selectedAnswer === "C" && (timeLeft === Infinity ? "bg-green-400" : "bg-gray-400"),
                        timeLeft === Infinity && selectedAnswer !== null && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <h1 className="text-lg sm:text-3xl md:text-lg lg:text-3xl xl:text-2xl 2xl:text-4xl 3xl:text-5xl font-bold text-gray-600 ml-2 mr-1 sm:mr-5">
                        C
                      </h1>
                      <p className="text-gray-600 font-light text-center text-xs sm:text-base md:text-xs lg:text-base xl:text-sm 2xl:text-lg 3xl:text-xl flex-1">
                        {currentQuestion?.optionC}
                      </p>
                    </button>

                    <button
                      onClick={() => sendAnswer("D")}
                      disabled={timeLeft === Infinity && selectedAnswer !== null}
                      className={cn(
                        "bg-thanodi-cream border border-gray-300 rounded-[30px] shadow-md flex items-center justify-center text-xs sm:text-xl md:text-sm lg:text-xl xl:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-gray-600 p-2 sm:p-5 md:p-3 lg:p-5 xl:p-4 2xl:p-6 3xl:p-8 w-full",
                        selectedAnswer === "D" && (timeLeft === Infinity ? "bg-green-400" : "bg-gray-400"),
                        timeLeft === Infinity && selectedAnswer !== null && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <h1 className="text-lg sm:text-3xl md:text-lg lg:text-3xl xl:text-2xl 2xl:text-4xl 3xl:text-5xl font-bold text-gray-600 ml-2 mr-1 sm:mr-5">
                        D
                      </h1>
                      <p className="text-gray-600 font-light text-center text-xs sm:text-base md:text-xs lg:text-base xl:text-sm 2xl:text-lg 3xl:text-xl flex-1">
                        {currentQuestion?.optionD}
                      </p>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {quizEnded && (
            <div className="w-full max-w-[50rem] sm:max-w-[60rem] lg:max-w-[70rem] h-[27rem] sm:h-[25rem] lg:h-[40rem] mx-auto lg:mr-10 p-4 sm:p-10 bg-white/50 rounded-[30px] shadow-md text-gray-700 flex flex-col mb-6 sm:mb-0">
              <h2 className="text-lg sm:text-3xl font-bold mb-4 text-center">Results</h2>
              {results ? (
                <div className="space-y-2 overflow-y-auto flex-1">
                  {results.users
                    .sort((a, b) => b.score - a.score)
                    .map((u) => (
                      <div
                        key={u.userId}
                        className="border-t border-gray-300 py-3 sm:py-5"
                      >
                        <p className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                          {u.username} - Score: {u.score}
                        </p>
                        <div className="flex gap-2 sm:gap-4 ml-2 sm:ml-4 mb-2 sm:mb-4">
                          <p className="font-medium text-green-700 text-xs sm:text-base">
                            Correct:{" "}
                            {u.answers.filter((a) => a.isCorrect).length}
                          </p>
                          <p className="font-medium text-red-700 text-xs sm:text-base">
                            Wrong:{" "}
                            {u.answers.filter((a) => !a.isCorrect).length}
                          </p>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4 text-gray-700 text-xs sm:text-base">
                          {u.answers.map((a) => (
                            <li key={a.questionId}>
                              <span className="font-medium text-xs sm:text-base">{a.question}</span>
                              <div
                                className={cn(
                                  a.isCorrect
                                    ? "text-green-700 ml-2 sm:ml-5 text-xs sm:text-base"
                                    : "text-red-700 ml-2 sm:ml-5 text-xs sm:text-base",
                                )}
                              >
                                {a.answer === "blank" ? "blank" : a.answer}
                              </div>
                              {!a.isCorrect && (
                                <div className="text-green-700 ml-2 sm:ml-5 text-xs sm:text-base">
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
          <div className="relative w-full max-w-[50rem] mb-8">
            <LayoutComponent />
          </div>
        </div>
        {/* Background overlay for small screens and tablets */}
        {showParticipants && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowParticipants(false)}
          />
        )}
        
        <div
          className={cn("h-[calc(100vh-86px)] hidden", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* call controls */}
      <div className="fixed bottom-0 left-0 right-0 rounded-t-xl flex w-full items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-nowrap p-2 sm:p-4 bg-black/20 backdrop-blur-sm overflow-x-auto">
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
              className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b] flex items-center justify-center"
            >
              {call.microphone.state.status === 'enabled' ? (
                <Mic size={16} className="sm:w-5 text-white" />
              ) : (
                <MicOff size={16} className="sm:w-5 text-white" />
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
              className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b] flex items-center justify-center"
            >
              {call.camera.state.status === 'enabled' ? (
                <Video size={16} className="sm:w-5 text-white" />
              ) : (
                <VideoOff size={16} className="sm:w-5 text-white" />
              )}
            </button>
          )}
          <button
            onClick={() => router.push(`/meetups/compete`)}
            className="cursor-pointer rounded-2xl bg-red-500 px-2 sm:px-4 py-2 hover:bg-red-600 flex items-center justify-center"
          >
            <PhoneOff size={16} className="sm:w-5 text-white" />
          </button>
        </div>
        {isHost && <EndCallButton />}
        <div className="hidden sm:block md:hidden lg:hidden xl:block">
          <CallStatsButton />
        </div>
        {isHost && !quizStarted && (
          <button
            onClick={handleStartQuiz}
            className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b] rounded-2xl shadow-md flex items-center justify-center text-xs sm:text-sm text-white"
          >
            <span className="hidden sm:inline md:hidden lg:inline xl:hidden">Start Quiz</span>
            <span className="sm:hidden md:inline lg:hidden xl:inline">Start</span>
          </button>
        )}

        {isHost && (
          <button
            onClick={handleRestartQuiz}
            className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b] rounded-2xl shadow-md flex items-center justify-center text-xs sm:text-sm text-white"
          >
            Restart
          </button>
        )}
          {isHost && (
          <button
            className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b] rounded-2xl shadow-md flex items-center justify-center text-xs sm:text-sm text-white"
            onClick={() => setShowTopicModal(true)}
          >
            <span className="hidden sm:inline md:hidden lg:inline xl:hidden">Choose a topic</span>
            <span className="sm:hidden md:inline lg:hidden xl:inline">Topic</span>
          </button>
        )}

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-[#4c535b] ">
            <Users size={16} className="sm:w-5 text-white" />
          </div>
        </button>
        
        {/* Report Button */}
        <button onClick={() => setShowReportDialog(true)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-red-600 ml-2">
            <Flag size={16} className="sm:w-5 text-white" />
          </div>
        </button>
        
        {/* Ban User Button (only for host) */}
        {isHost && (
          <button onClick={() => setShowBanDialog(true)}>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-2 sm:px-4 py-2 hover:bg-red-600 ml-2">
              <Shield size={16} className="sm:w-5 text-white" />
            </div>
          </button>
        )}

      </div>

      <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
        <DialogPortal>
          <DialogOverlay className="bg-black/50 backdrop-blur-md" />
          <DialogContent className="bg-white max-w-6xl max-h-[80vh] overflow-y-auto rounded-2xl sm:rounded-none">
            <DialogHeader>
              <DialogTitle>Choose a Topic or Quiz</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search topics and quizzes..."
              value={searchQuery}
              onChange={(e) => debouncedSetSearchQuery(e.target.value)}
              className="my-4"
            />
            
            {/* User Quizzes Section */}
            {userQuizzes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Your Quizzes</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredUserQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        onClick={() => handleSelectUserQuiz(quiz.id)}
                        className="cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all"
                      >
                        <h4 className="font-semibold text-sm text-gray-800">{quiz.title}</h4>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Topics Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Topics</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {filteredTopics.map((topic) => (
                    <TopicItem
                      key={topic.title}
                      title={topic.title}
                      description={topic.description}
                      handleClick={() => handleSelectTopic(topic.title)}
                    />
                  ))}
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

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
                          // Don't show call ended toast as we're not ending the call anymore
                        }
                      } catch (forceRemoveError) {
                        console.error('Failed to call force remove:', forceRemoveError);
                      }
                      
                      // Force a refresh of call participants to update the UI
                      if (call) {
                        try {
                          // Try to force the user to leave by updating call state
                          
                          // Update call with a custom property that might trigger removal
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
                          monitorIntervalRef.current = setInterval(async () => {
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
                                  if (monitorIntervalRef.current) {
                                    clearInterval(monitorIntervalRef.current);
                                  }
                              }
                            } catch (monitorError) {
                              console.error('Failed to monitor user removal:', monitorError);
                            }
                          }, 5000); // Check every 5 seconds
                          
                          // Stop monitoring after 30 seconds
                                                     banTimeoutRef.current = setTimeout(() => {
                             if (monitorIntervalRef.current) {
                               clearInterval(monitorIntervalRef.current);
                             }
                          }, 30000);
                          
                          // Check if the banned user is still in the call after 3 seconds
                          checkTimeoutRef.current = setTimeout(async () => {
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
  );
};

export default CallRoom;