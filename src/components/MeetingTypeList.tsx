'use client';
import { useRouter } from 'next/navigation';
import HomeCard from '@/components/HomeCard';
import { Users, BookOpen, Trophy, MessageCircle } from 'lucide-react';

const MeetingTypeList = () => {
  const router = useRouter();

  return (
    <section 
      className="w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-8"
      role="region"
      aria-label="Meeting type options"
    >
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-6"
        role="list"
        aria-label="Available meeting types"
      >
        <div role="listitem">
          <HomeCard
            img="/icons/add-meeting.svg"
            title="Study Groups"
            description="Join online study sessions."
            className="bg-thanodi-lightPeach"
            handleClick={() => router.push('/meetups/study-groups')}
            icon={<Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden="true" />}
            backgroundImage="/Images/meetups/study.png"
            aria-label="Navigate to Study Groups - Join online study sessions"
          />
        </div>
        <div role="listitem">
          <HomeCard
            img="/icons/join-meeting.svg"
            title="Read Confessions"
            description="Read posts from students"
            className="bg-thanodi-blue"
            handleClick={() => router.push('/meetups/confessions')}
            icon={<BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden="true" />}
            backgroundImage="/Images/meetups/confessions.png"
            aria-label="Navigate to Read Confessions - Read posts from students"
          />
        </div>
        <div role="listitem">
          <HomeCard
            img="/icons/schedule.svg"
            title="Compete"
            description="Compete on random topics"
            className="bg-thanodi-peach"
            handleClick={() => router.push('/meetups/compete')}
            icon={<Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden="true" />}
            backgroundImage="/Images/meetups/compete.png"
            aria-label="Navigate to Compete - Compete on random topics"
          />
        </div>
        <div role="listitem">
          <HomeCard
            img="/icons/recordings.svg"
            title="Talk"
            description="Talk to students online"
            className="bg-thanodi-yellow"
            handleClick={() => router.push('/meetups/talk')}
            icon={<MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden="true" />}
            backgroundImage="/Images/meetups/talk.png"
            aria-label="Navigate to Talk - Talk to students online"
          />
        </div>
      </div>
    </section>
  );
};

export default MeetingTypeList;
