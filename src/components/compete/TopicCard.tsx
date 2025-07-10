'use client';

import { cn } from '@/lib/utils';

interface TopicCardProps {
  className?: string;
  title: string;
  description: string;
  handleClick?: () => void;
  backgroundImage?: string;
}

const TopicCard = ({ className, title, description, handleClick, backgroundImage }: TopicCardProps) => {
  return (
    <section
      className={
        'relative flex flex-col justify-end w-full rounded-[14px] min-w-[280px] xl:max-w-[280px] min-h-[350px] cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden group'}
      onClick={handleClick}
    >
      {backgroundImage ? (
        <div 
          className="absolute inset-0 z-0 w-full h-40 bg-cover bg-center bg-no-repeat opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div 
          className="absolute inset-0 z-0 w-full h-40 bg-cover bg-center bg-no-repeat opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundImage: `url('/Images/placeholder.png')` }}
        />
      )}

      <div className={cn("relative bg-white/90 backdrop-blur-md flex flex-col rounded-[14px] gap-2 p-7 h-[13rem] z-10", className)}>
        <h1 className="text-2xl font-bold text-gray-600">{title}</h1>
        <p className="text-lg font-normal text-gray-600">{description}</p>
      </div>
    </section>
  );
};

export default TopicCard;
