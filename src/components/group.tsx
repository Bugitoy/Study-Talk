import React from 'react';

interface GroupCardProps {
  title: string;
  peopleCount: number;
  profilePics: string[];
  onJoin: () => void;
  color?: string; // Tailwind class for background color
}

const GroupCard: React.FC<GroupCardProps> = ({ title, peopleCount, profilePics, onJoin, color }) => {
  // Show up to 5 profile pics, rest as +N
  const maxAvatars = 5;
  const extraCount = profilePics.length > maxAvatars ? profilePics.length - maxAvatars : 0;
  const avatarsToShow = profilePics.slice(0, maxAvatars);

  return (
    <div
      className={`${color || 'bg-thanodi-lightPeach'} rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-xs mx-auto border border-gray-100 transition-all duration-300 hover:shadow-xl`}
    >
      <h3 className="text-xl font-bold mb-2 text-center text-gray-800">{title}</h3>
      <p className="text-gray-500 mb-3 text-center text-base">{peopleCount} people</p>
      <div className="flex items-center justify-center mb-4">
        {avatarsToShow.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt="profile"
            className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0 shadow"
            style={{ zIndex: 10 - idx }}
          />
        ))}
        {extraCount > 0 && (
          <span className="ml-2 text-xs bg-gray-200 rounded-full px-2 py-1 text-gray-700 font-semibold">
            +{extraCount}
          </span>
        )}
      </div>
      <button
        onClick={onJoin}
        className="w-full bg-fuchsia-100 hover:bg-fuchsia-200 text-gray-800 font-semibold py-2 rounded-lg transition-colors shadow"
      >
        Join
      </button>
    </div>
  );
};

export default GroupCard;
