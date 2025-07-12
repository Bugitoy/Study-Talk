"use client";

import { useRouter } from "next/navigation";
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
  const [roomSettings, setRoomSettings] = useState<{ topicName?: string }>({});

  useEffect(() => {
    const storedSettings = localStorage.getItem('roomSettings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      setRoomSettings(settings);
    }
  }, []);

  const saveTopicToLocalStorage = (topicName: string) => {
    const storedSettings = localStorage.getItem('roomSettings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      settings.topicName = topicName;
      localStorage.setItem('roomSettings', JSON.stringify(settings));
    }
  };

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      const id = new ObjectId().toString(); // Generate a valid ObjectID
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
      const storedSettings = localStorage.getItem('roomSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        const roomName = settings.roomName || 'Unnamed Room';
        const timePerQuestion = settings.timePerQuestion || null;
        const numQuestions = settings.numQuestions || sampleQuestions.length;
        sampleQuestions = sampleQuestions.slice(0, numQuestions);

        await fetch('/api/quiz-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: call.id,
            name: roomName,
            timePerQuestion,
            questions: sampleQuestions,
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

  const topicsData = [
    {
      title: "American History",
      description: "This quiz contains questions about the Revolutionary War, the Civil War, and the Great Depression.",
      backgroundImage: "/Images/meetups/topics/american-history.png"
    },
    {
      title: "Minecraft",
      description: "This quiz will test your knowledge of Minecraft including the different mobs, blocks, and items.",
      backgroundImage: "/Images/meetups/topics/minecraft.png"
    },
    {
      title: "Rare Animals",
      description: "This quiz contains questions to test your knowledge on animals such as the platypus and the quokka.",
      backgroundImage: "/Images/meetups/topics/animals.png"
    },
    {
      title: "Calculus",
      description: "This quiz contains questions about the different types of integrals and the different types of derivatives.",
      backgroundImage: "/Images/meetups/topics/calculus.png"
    },
    {
      title: "K-12",
      description: "This quiz contains questions about the different subjects and the different levels of education.",
      backgroundImage: ""
    },
    {
      title: "MCAT",
      description: "This quiz contains questions about the different sections of the MCAT and the different types of questions.",
      backgroundImage: "/Images/meetups/topics/mcat.png"
    },
    {
        title: "Cars",
        description: "This quiz contains questions about the different types of cars and the different parts of a car.",
        backgroundImage: ""
    },
    {
        title: "Countries",
        description: "This quiz contains questions about the different countries and the different capitals.",
        backgroundImage: ""
    },
  ];

  
  const handleNext = () => {
    router.push("/room-lobby");
  };

  type Topic = {
    title: string;
    description: string;
    backgroundImage: string;
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    saveTopicToLocalStorage(topic.title);
  };

  return (
    <NextLayout>
    <div className="p-6 max-w-7xl mx-auto">

        <div className="flex items-center justify-center mb-20">
          <div className="flex-grow border-t border-blue-200"></div>
             <h1 className="text-5xl font-bold mx-[5rem]">Choose a Topic</h1>
          <div className="flex-grow border-t border-blue-200"></div>
        </div>
        
        <div className="grid grid-cols-4 gap-10 mb-8">
            {topicsData.map((topic, idx) => (
              <TopicCard
                key={idx}
                title={topic.title}
                description={topic.description}
                backgroundImage={topic.backgroundImage}
                className={`${pastelColors[idx % pastelColors.length]} ${selectedTopic?.title === topic.title ? 'opacity-50' : ''}`}
                handleClick={() => handleTopicClick(topic)}
              />
            ))}
        </div>
        
        <div className="grid grid-cols-2 gap-7">
            <div
              className="button h-[50px] bg-orange-300 rounded-lg cursor-pointer select-none
                active:translate-y-2 active:[box-shadow:0_0px_0_0_#f5c782,0_0px_0_0_#f5c78241]
                active:border-b-[0px]
                transition-all duration-150 [box-shadow:0_10px_0_0_#f5c782,0_15px_0_0_#f5c78241]
                border-b-[1px] border-orange-300 shadow"
              tabIndex={0}
              role="button"
              onClick={createMeeting}
            >
              <span className="flex flex-col justify-center items-center h-full text-gray-800 font-bold text-lg">
                Next
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
