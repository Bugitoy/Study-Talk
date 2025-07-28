import React from 'react';

interface GroupCardProps {
  title: string;
  peopleCount: number;
  profilePics: string[];
  onJoin: () => void;
  color?: string; // Tailwind class for background color
  isAuthenticated?: boolean;
  'aria-label'?: string;
}

const GroupCard: React.FC<GroupCardProps> = ({ 
  title, 
  peopleCount, 
  profilePics, 
  onJoin, 
  color, 
  isAuthenticated = true,
  'aria-label': ariaLabel 
}) => {
  // Show up to 5 profile pics, rest as +N
  const maxAvatars = 5;
  const extraCount = profilePics.length > maxAvatars ? profilePics.length - maxAvatars : 0;
  const avatarsToShow = profilePics.slice(0, maxAvatars);

  const defaultAriaLabel = ariaLabel || `Join ${title} room with ${peopleCount} people`;

  return (
    <article
      className={`${color || 'bg-thanodi-lightPeach'} rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center w-full max-w-xs mx-auto border border-gray-100 transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
      aria-labelledby={`room-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <h3 
        id={`room-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="text-lg sm:text-xl font-bold mb-2 text-center text-gray-800"
      >
        {title}
      </h3>
      
      <p className="text-gray-500 mb-3 text-center text-sm sm:text-base">
        {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
      </p>
      
      <div 
        className="flex items-center justify-center mb-4"
        aria-label={`${peopleCount} participants`}
      >
        {avatarsToShow.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Participant ${idx + 1}`}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white -ml-1 sm:-ml-2 first:ml-0 shadow"
            style={{ zIndex: 10 - idx }}
          />
        ))}
        {extraCount > 0 && (
          <span 
            className="ml-1 sm:ml-2 text-xs bg-gray-200 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-gray-700 font-semibold"
            aria-label={`${extraCount} more participants`}
          >
            +{extraCount}
          </span>
        )}
      </div>
      
      <button
        onClick={onJoin}
        disabled={!isAuthenticated}
        className={`w-full font-semibold py-1.5 sm:py-2 rounded-lg transition-colors shadow text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isAuthenticated 
            ? 'bg-fuchsia-100 hover:bg-fuchsia-200 text-gray-800 cursor-pointer' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        aria-label={defaultAriaLabel}
        aria-describedby={!isAuthenticated ? "login-required" : undefined}
      >
        Join
      </button>
    </article>
  );
};

export default GroupCard;
