import React from 'react';
import { SquarePlus, Handshake, MessageSquareText, Hourglass } from 'lucide-react';

const goals = [
  { key: 'join', label: 'Join', icon: SquarePlus },
  { key: 'befriend', label: 'Make a friend', icon: Handshake },
  { key: 'message', label: 'Write a message', icon: MessageSquareText },
  { key: 'stay', label: 'Stay 30 minutes', icon: Hourglass },
];

interface MeetingGoalsBarProps {
  completedGoals?: string[];
}

const MeetingGoalsBar = ({ completedGoals = [] }: MeetingGoalsBarProps) => (
  <div className="w-full max-w-3xl mx-auto flex flex-col items-center" role="progressbar" aria-label="Meeting goals progress" aria-valuenow={completedGoals.length} aria-valuemin={0} aria-valuemax={4}>
    <div className="flex items-center w-full justify-between">
      {goals.map((goal, idx) => {
        const Icon = goal.icon;
        const isCompleted = completedGoals.includes(goal.key);
        return (
          <React.Fragment key={goal.key}>
            <div className="flex flex-col items-center w-16 sm:w-24">
              <div 
                className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center z-10 bg-white rounded-[8px] border-2 ${isCompleted ? 'border-yellow-400' : 'border-gray-300'}`}
                aria-label={`${goal.label} goal ${isCompleted ? 'completed' : 'not completed'}`}
              >
                <Icon className={`w-5 h-5 sm:w-8 sm:h-8 ${isCompleted ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-[#19232d] font-medium text-center w-full">
                {goal.label}
              </span>
            </div>
            {idx < goals.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-300 mx-1" aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

export default MeetingGoalsBar; 