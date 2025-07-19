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
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const settingsId = searchParams.get('settings') || undefined;
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
    // Check if a topic is selected
    if (!selectedTopic) {
      toast({
        title: 'Topic Required',
        description: 'Please select a topic before proceeding.',
        variant: 'destructive',
      });
      return;
    }

    if (!client || !user) return;
    try {
      const id = new ObjectId().toString(); // Generate a valid ObjectID
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      const availability = roomSettings?.availability || 'public';
      const roomName = roomSettings?.roomName || 'Unnamed Room';
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
          await fetch(`/api/room-settings/${settingsId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId: call.id }),
          });
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
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  const [topicsData, setTopicsData] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch('/api/topics');
        if (res.ok) {
          const data = await res.json();
          setTopicsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    fetchTopics();
  }, []);
  
  const handleNext = () => {
    router.push("/");
  };

  type Topic = {
    title: string;
    description: string;
    backgroundImage: string;
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    saveTopicName(topic.title);
  };

  return (
    <NextLayout>
    <div className="p-6 max-w-7xl mx-auto">

        <div className="flex items-center justify-center mb-20">
          <div className="flex-grow border-t border-blue-200"></div>
             <h1 className="text-5xl font-bold mx-[5rem]">Choose a Topic</h1>
          <div className="flex-grow border-t border-blue-200"></div>
        </div>
        
        {!selectedTopic ? (
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-800 font-medium">Please select a topic to continue</span>
            </div>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">Topic selected: {selectedTopic.title}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-10 mb-8">
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
        
        <div className="grid grid-cols-2 gap-7">
            <div
              className={`button h-[50px] rounded-lg select-none transition-all duration-150 border-b-[1px] shadow ${
                selectedTopic 
                  ? "bg-orange-300 cursor-pointer active:translate-y-2 active:[box-shadow:0_0px_0_0_#f5c782,0_0px_0_0_#f5c78241] active:border-b-[0px] [box-shadow:0_10px_0_0_#f5c782,0_15px_0_0_#f5c78241] border-orange-300" 
                  : "bg-gray-300 cursor-not-allowed border-gray-300"
              }`}
              tabIndex={0}
              role="button"
              onClick={createMeeting}
            >
              <span className={`flex flex-col justify-center items-center h-full font-bold text-lg ${
                selectedTopic ? "text-gray-800" : "text-gray-500"
              }`}>
                {selectedTopic ? "Next" : "Select a topic first"}
              </span>
            </div>

            <div
              className="button h-[50px] bg-pink-300 rounded-lg cursor-pointer select-none
                active:translate-y-2 active:[box-shadow:0_0px_0_0_#f582ed,0_0px_0_0_#f582ed41]
                active:border-b-[0px]
                transition-all duration-150 [box-shadow:0_10px_0_0_#f582ed,0_15px_0_0_#f582ed41]
                border-b-[1px] border-pink-300 shadow"
              tabIndex={0}
              role="button"
              onClick={handleNext}
            >
              <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-lg">
                Create your own quiz
              </span>
            </div>
        </div>
        
    </div>
    </NextLayout>
  );
}
