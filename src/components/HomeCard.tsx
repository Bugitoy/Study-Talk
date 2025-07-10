'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
  icon?: ReactNode;
  backgroundImage?: string;
}

const HomeCard = ({ className, img, title, description, handleClick, icon, backgroundImage }: HomeCardProps) => {
  return (
    <section
      className={cn(
        'px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden group',
        className
      )}
      onClick={handleClick}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute top-0 left-0 right-0 h-32 bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Background Color Overlay */}
      <div className="absolute inset-0 group-hover:bg-transparent transition-colors duration-300" />
      
      {/* Icon Container */}
      <div className="flex items-center justify-center w-12 h-12 rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] bg-white/20 backdrop-blur-sm relative z-10">
        {icon ? (
          icon
        ) : (
        <Image src={img} alt="meeting" width={27} height={27} />
        )}
      </div>
      
      {/* Content */}
      <div className="flex flex-col gap-2 relative z-10">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg font-normal">{description}</p>
      </div>
    </section>
  );
};

export default HomeCard;
