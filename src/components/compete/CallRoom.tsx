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
import { Users, LayoutList } from "lucide-react";

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
  const { useCallCallingState, useLocalParticipant, useCallEndedAt } = useCallStateHooks();
  const { id } = useParams();

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
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topics, setTopics] = useState<
  Array<{
    title: string;
    description: string;
    backgroundImage: string;
  }>
>([]);
const [searchQuery, setSearchQuery] = useState("");

useEffect(() => {
  if (!call) return;
  const hostId = call.state.createdBy?.id;
  if (!hostId) return;
  const handler = async (e: any) => {
    const leftId = e.participant?.userId || e.participant?.user?.id;
    if (leftId === hostId) {
      try {
        await call.endCall();
        await call.delete();
      } catch (err) {
        console.error("Failed to end call when host left", err);
      }
    }
  };
  const unsub = call.on("participantLeft", handler);
  return () => {
    unsub?.();
  };
}, [call]);

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
        <CallControls onLeave={() => router.push(`/meetups/compete`)} />
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
    </section>
  );
};

export default CallRoom;