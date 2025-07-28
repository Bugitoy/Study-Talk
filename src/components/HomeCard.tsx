'use client';

import Image from 'next/image';
import { ReactNode, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
  icon?: ReactNode;
  backgroundImage?: string;
  'aria-label'?: string;
}

const HomeCard = ({ 
  className, 
  img, 
  title, 
  description, 
  handleClick, 
  icon, 
  backgroundImage,
  'aria-label': ariaLabel 
}: HomeCardProps) => {
  
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick?.();
    }
  };

  const defaultAriaLabel = ariaLabel || `Navigate to ${title} - ${description}`;

  return (
    <div
      className={cn(
        'px-3 sm:px-4 py-4 sm:py-6 flex flex-col justify-between w-full min-h-[200px] sm:min-h-[240px] lg:min-h-[260px] rounded-[12px] sm:rounded-[14px] cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={defaultAriaLabel}
      aria-describedby={`${title.toLowerCase().replace(/\s+/g, '-')}-description`}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute top-0 left-0 right-0 h-24 sm:h-28 lg:h-32 bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        />
      )}
      
      {/* Background Color Overlay */}
      <div className="absolute inset-0 group-hover:bg-transparent transition-colors duration-300" aria-hidden="true" />
      
      {/* Icon Container */}
      <div 
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-[8px] sm:rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] bg-white/20 backdrop-blur-sm relative z-10"
        aria-hidden="true"
      >
        {icon ? (
          icon
        ) : (
          <Image 
            src={img} 
            alt={`${title} icon`} 
            width={24} 
            height={24} 
            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" 
          />
        )}
      </div>
      
      {/* Content */}
      <div className="flex flex-col gap-1 sm:gap-2 relative z-10">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">{title}</h3>
        <p 
          id={`${title.toLowerCase().replace(/\s+/g, '-')}-description`}
          className="text-sm sm:text-base lg:text-lg font-normal"
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default HomeCard;
