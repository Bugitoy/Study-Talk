'use client';
import { useRouter } from 'next/navigation';
import HomeCard from '@/components/HomeCard';
import { Users, BookOpen, Trophy, MessageCircle } from 'lucide-react';


const MeetingTypeList = () => {
  const router = useRouter();

  return (
    <section className="flex justify-between gap-5 flex-wrap">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="Study Groups"
        description="Join online study sessions."
        className="bg-thanodi-lightPeach flex-1 min-w-[250px] max-w-[270px]"
        handleClick={() => router.push('/meetups/study-groups')}
        icon={<Users className="w-7 h-7 text-white" />}
        backgroundImage="/Images/meetups/study.png"
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Read Confessions"
        description="Read posts from students"
        className="bg-thanodi-blue flex-1 min-w-[250px] max-w-[270px]"
        handleClick={() => router.push('/meetups/confessions')}
        icon={<BookOpen className="w-7 h-7 text-white" />}
        backgroundImage="/Images/meetups/confessions.png"
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Compete"
        description="Compete on random topics"
        className="bg-thanodi-peach flex-1 min-w-[250px] max-w-[270px]"
        handleClick={() => router.push('/meetups/compete')}
        icon={<Trophy className="w-7 h-7 text-white" />}
        backgroundImage="/Images/meetups/compete.png"
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="Talk"
        description="Talk to students online"
        className="bg-thanodi-yellow flex-1 min-w-[250px] max-w-[270px]"
        handleClick={() => router.push('/meetups/talk')}
        icon={<MessageCircle className="w-7 h-7 text-white" />}
        backgroundImage="/Images/meetups/talk.png"
      />
    </section>
  );
};

export default MeetingTypeList;
