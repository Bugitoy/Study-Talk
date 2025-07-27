'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TopicCardProps {
  className?: string;
  title: string;
  description: string;
  handleClick?: () => void;
  backgroundImage?: string;
  isSelected?: boolean;
}

import React from 'react';

const TopicCard = React.memo(({ className, title, description, handleClick, backgroundImage, isSelected }: TopicCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  return (
    <button
      className={
        'relative flex flex-col justify-end w-full rounded-[14px] min-w-[250px] sm:min-w-[280px] xl:max-w-[280px] min-h-[280px] sm:min-h-[320px] md:min-h-[350px] cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.1)] transform transition-all duration-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:scale-[1.01] overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick?.();
        }
      }}
      aria-pressed={isSelected}
      aria-describedby={`topic-${title.replace(/\s+/g, '-').toLowerCase()}-description`}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 z-0 w-full h-40 bg-gray-200 animate-pulse" />
      )}

      {/* Background image with lazy loading */}
      {backgroundImage && !imageError ? (
        <div 
          className={`absolute inset-0 z-0 w-full h-40 bg-cover bg-center bg-no-repeat transition-all duration-300 ${
            imageLoaded ? 'opacity-60 group-hover:opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div 
          className="absolute inset-0 z-0 w-full h-40 bg-cover bg-center bg-no-repeat opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundImage: `url('/Images/placeholder.png')` }}
        />
      )}

      {/* Dark overlay when selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-black opacity-40 z-10 pointer-events-none rounded-[14px]" />
      )}

      <div className={cn("relative bg-white/90 backdrop-blur-md flex flex-col rounded-[14px] gap-2 p-4 sm:p-5 md:p-7 h-[10rem] sm:h-[11rem] md:h-[13rem] z-20", className)}>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600">{title}</h1>
        <p className="text-sm sm:text-base md:text-lg font-normal text-gray-600" id={`topic-${title.replace(/\s+/g, '-').toLowerCase()}-description`}>{description}</p>
      </div>
      <div className="sr-only">
        {isSelected ? `Selected topic: ${title}` : `Topic: ${title}`}
      </div>
    </button>
  );
});

TopicCard.displayName = 'TopicCard';

export default TopicCard;
