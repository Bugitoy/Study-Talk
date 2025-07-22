"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TopicCard from "@/components/compete/TopicCard";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
type QuizQuestion = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string;
};
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import NextLayout from "@/components/NextLayout";
import { ObjectId } from 'bson';
import { useRoomSetting } from '@/hooks/useRoomSettings';

const initialValues = {
    dateTime: new Date(),
    description: '',
    link: '/meetups/compete/room/',
};

const pastelColors = [
    'bg-thanodi-cream',
    'bg-thanodi-blue',
    'bg-thanodi-peach',
    'bg-thanodi-yellow',
    'bg-thanodi-lightPeach',
    'bg-thanodi-lightBlue',
  ];

export default function ChooseTopic({ setIsSetupComplete }: { setIsSetupComplete: (isSetupComplete: boolean) => void 
}) {
  const router = useRouter();
  const client = useStreamVideoClient();
  const { user } = useKindeBrowserClient();
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const [selectedTopic, setSelectedTopic] = useState<
        { title: string, description: string; backgroundImage: string } | null>(null);
  const [selectedUserQuiz, setSelectedUserQuiz] = useState<any>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const settingsId = searchParams.get('settings') || undefined;
  const selectedQuizId = searchParams.get('selectedQuiz');
  
  const roomSettings = useRoomSetting(settingsId);

  const saveTopicName = async (topicName: string) => {
    if (!settingsId) return;
    await fetch(`/api/room-settings/${settingsId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicName }),
    });
  };

  const createMeeting = async () => {
    // Check if a topic or user quiz is selected
    if (!selectedTopic && !selectedUserQuiz) {
      toast({
        title: 'Topic Required',
        description: 'Please select a topic or your own quiz before proceeding.',
        variant: 'destructive',
      });
      return;
    }

    // If user quiz is selected but still loading, show loading message
    if (selectedQuizId && !selectedUserQuiz && isLoadingQuiz) {
      toast({
        title: 'Loading Quiz',
        description: 'Please wait while your quiz is being loaded...',
      });
      return;
    }

    if (!client || !user) {
      toast({
        title: 'Error',
        description: 'Unable to create meeting. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreatingMeeting(true);
    
    try {
      
      const id = new ObjectId().toString(); // Generate a valid ObjectID
      
      const call = client.call('default', id);
      
      if (!call) {
        throw new Error('Failed to create meeting');
      }
      
      
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      const availability = roomSettings?.availability || 'public';
      const roomName = roomSettings?.roomName || 'Unnamed Room';
      
      
      // Add retry mechanism for network issues
      let retryCount = 0;
      const maxRetries = 3;
      let lastError;
      
      while (retryCount < maxRetries) {
        try {
          await call.getOrCreate({
            data: {
              starts_at: startsAt,
              custom: {
                description,
                availability,
                roomName,
                quizStarted: false,
              },
            },
          });
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
      
      // If all retries failed, throw the last error
      if (retryCount === maxRetries && lastError) {
        throw lastError;
      }
      
      
      setCallDetail(call);
      let sampleQuestions: QuizQuestion[] = [];
      if (selectedTopic) {
        const res = await fetch(`/api/questions?topic=${encodeURIComponent(selectedTopic.title)}`);
        if (res.ok) {
          const data = await res.json();
          sampleQuestions = data.map((q: any) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correct: q.correct,
          }));
        }
      } else if (selectedUserQuiz) {
        
        // Use the selected user quiz questions and randomize them
        const userQuizQuestions = selectedUserQuiz.questions.map((q: any) => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correct: q.correct,
        }));
        
        // Randomize the user quiz questions using Fisher-Yates shuffle
        for (let i = userQuizQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [userQuizQuestions[i], userQuizQuestions[j]] = [userQuizQuestions[j], userQuizQuestions[i]];
        }
        
        sampleQuestions = userQuizQuestions;
      }
      
      
      if (roomSettings) {
        
        const timePerQuestion = roomSettings.timePerQuestion ?? null;
        const numQuestions = roomSettings.numQuestions || sampleQuestions.length;
        sampleQuestions = sampleQuestions.slice(0, numQuestions);

        await fetch('/api/quiz-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: call.id,
            name: roomSettings.roomName || 'Quiz',
            timePerQuestion,
            questions: sampleQuestions,
          }),
        });
      
        
        if (settingsId) {
          
          const updateResponse = await fetch(`/api/room-settings/${settingsId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId: call.id }),
          });
          
          
          if (updateResponse.ok) {
          } else {
            console.error('Failed to update room settings with callId:', updateResponse.status);
          }
        } else {
        }
        
        // Create compete room in database
        await fetch('/api/compete-rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: call.id,
            roomName: roomSettings.roomName || 'Quiz',
            hostId: user.id,
          }),
        });
      }
      if (!values.description) {
        router.push(`/meetups/compete/room/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to create meeting. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('ERR_NETWORK_CHANGED')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Failed to create meeting')) {
          errorMessage = 'Unable to create meeting. Please try again.';
        }
      }
      
      toast({ 
        title: 'Failed to create Meeting',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const [topicsData, setTopicsData] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setTopicsLoading(true);
      try {
        const res = await fetch('/api/topics');
        if (res.ok) {
          const data = await res.json();
          setTopicsData(data);
          
          // Preload images for better performance
          data.forEach((topic: Topic) => {
            if (topic.backgroundImage) {
              const img = new Image();
              img.src = topic.backgroundImage;
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch topics', err);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // Load selected user quiz if quizId is provided
  useEffect(() => {
    const loadSelectedQuiz = async () => {
      if (selectedQuizId && user?.id) {
        setIsLoadingQuiz(true);
        try {
          const res = await fetch(`/api/user-quizzes/${selectedQuizId}?userId=${user.id}`);
          
          if (res.ok) {
            const quizData = await res.json();
            setSelectedUserQuiz(quizData);
          } else {
            console.error('Failed to load quiz, status:', res.status);
            toast({
              title: 'Error',
              description: 'Failed to load quiz data',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error loading quiz:', error);
          toast({
            title: 'Error',
            description: 'Failed to load quiz data',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingQuiz(false);
        }
      }
    };

    loadSelectedQuiz();
  }, [selectedQuizId, user?.id, toast]);
  
  const handleNext = () => {
    handleQuizLibraryClick();
  };

  type Topic = {
    title: string;
    description: string;
    backgroundImage: string;
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedUserQuiz(null);
    saveTopicName(topic.title);
  };

  const handleQuizLibraryClick = () => {
    // Preserve the settings parameter when navigating to quiz library
    const settingsParam = settingsId ? `?settings=${settingsId}` : '';
    router.push(`/meetups/compete/quiz-library${settingsParam}`);
  };

  // Show loading state when quiz is being loaded
  if (selectedQuizId && isLoadingQuiz) {
    return (
      <NextLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-20">
            <div className="flex-grow border-t border-blue-200"></div>
            <h1 className="text-5xl font-bold mx-[5rem]">Loading Your Quiz</h1>
            <div className="flex-grow border-t border-blue-200"></div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your quiz data...</p>
          </div>
        </div>
      </NextLayout>
    );
  }

  return (
    <NextLayout>
    <div className="p-6 max-w-7xl mx-auto">

        <div className="flex items-center justify-center mb-10 sm:mb-16 md:mb-20">
          <div className="flex-grow border-t border-blue-200"></div>
             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mx-4 sm:mx-8 md:mx-[5rem] text-center">Choose a Topic</h1>
          <div className="flex-grow border-t border-blue-200"></div>
        </div>
        
        {!selectedTopic && !selectedUserQuiz ? (
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-100 border border-blue-300 rounded-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base text-blue-800 font-medium">Please select a topic or your own quiz to continue</span>
            </div>
          </div>
        ) : (
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-100 border border-green-300 rounded-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base text-green-800 font-medium">
                {selectedTopic ? `Topic selected: ${selectedTopic.title}` : `Quiz selected: ${selectedUserQuiz?.title}`}
              </span>
            </div>
          </div>
        )}
        
        {topicsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 mb-6 sm:mb-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-end w-full rounded-[14px] min-w-[250px] sm:min-w-[280px] xl:max-w-[280px] min-h-[280px] sm:min-h-[320px] md:min-h-[350px] bg-gray-200 animate-pulse"
              >
                <div className="relative bg-white/90 backdrop-blur-md flex flex-col rounded-[14px] gap-2 p-4 sm:p-5 md:p-7 h-[10rem] sm:h-[11rem] md:h-[13rem]">
                  <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 mb-6 sm:mb-8">
            {topicsData.map((topic, idx) => (
              <TopicCard
                key={idx}
                title={topic.title}
                description={topic.description}
                backgroundImage={topic.backgroundImage}
                className={`${pastelColors[idx % pastelColors.length]}`}
                handleClick={() => handleTopicClick(topic)}
                isSelected={selectedTopic?.title === topic.title}
              />
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-7">
            <div
              className={`button h-[45px] sm:h-[50px] rounded-lg select-none transition-all duration-150 border-b-[1px] shadow ${
                (selectedTopic || selectedUserQuiz) && !isCreatingMeeting
                  ? "bg-orange-300 cursor-pointer active:translate-y-2 active:[box-shadow:0_0px_0_0_#f5c782,0_0px_0_0_#f5c78241] active:border-b-[0px] [box-shadow:0_10px_0_0_#f5c782,0_15px_0_0_#f5c78241] border-orange-300" 
                  : "bg-gray-300 cursor-not-allowed border-gray-300"
              }`}
              tabIndex={0}
              role="button"
              onClick={() => {
                if (!isCreatingMeeting) {
                  createMeeting();
                }
              }}
            >
              <span className={`flex flex-col justify-center items-center h-full font-bold text-sm sm:text-base lg:text-lg ${
                (selectedTopic || selectedUserQuiz) && !isCreatingMeeting ? "text-gray-800" : "text-gray-500"
              }`}>
                {isCreatingMeeting ? "Creating..." : (selectedTopic || selectedUserQuiz) ? "Next" : "Select a topic first"}
              </span>
            </div>

            <div
              className="button h-[45px] sm:h-[50px] bg-pink-300 rounded-lg cursor-pointer select-none
                active:translate-y-2 active:[box-shadow:0_0px_0_0_#f582ed,0_0px_0_0_#f582ed41]
                active:border-b-[0px]
                transition-all duration-150 [box-shadow:0_10px_0_0_#f582ed,0_15px_0_0_#f582ed41]
                border-b-[1px] border-pink-300 shadow"
              tabIndex={0}
              role="button"
              onClick={handleNext}
            >
              <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-sm sm:text-base lg:text-lg">
                Create your own quiz
              </span>
            </div>
        </div>
        
    </div>
    </NextLayout>
  );
}
