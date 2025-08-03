'use client';
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock } from 'lucide-react';
import { formatStudyTime } from '@/lib/utils';

interface StudyTimeProgressProps {
  dailyHours?: number;
  dailyGoal?: number;
  isTracking?: boolean;
  className?: string;
}

export function StudyTimeProgress({ 
  dailyHours, 
  dailyGoal = 10, 
  isTracking = false, 
  className = '' 
}: StudyTimeProgressProps) {
  // Ensure dailyHours is always a number
  const safeDailyHours = dailyHours ?? 0;
  const percent = Math.min((safeDailyHours / dailyGoal) * 100, 100);
  
  const achievements = [
    { hours: 1, label: 'First Hour', icon: Clock, unlocked: safeDailyHours >= 1 },
    { hours: 3, label: 'Getting Started', icon: Target, unlocked: safeDailyHours >= 3 },
    { hours: 5, label: 'Study Warrior', icon: Trophy, unlocked: safeDailyHours >= 5 },
    { hours: 8, label: 'Dedication', icon: Trophy, unlocked: safeDailyHours >= 8 },
    { hours: 10, label: 'Daily Master', icon: Trophy, unlocked: safeDailyHours >= 10 },
  ];

  return (
    <div className={`backdrop-blur-sm rounded-xl p-4 shadow-md pointer-events-auto rounded-[8px] ${className}`}>
      <div className="flex flex-col items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#19232d]">Daily Progress</h3>
        {isTracking && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Tracking</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#19232d]">
            {formatStudyTime(safeDailyHours)} / {dailyGoal}h
          </span>
          <span className="text-sm font-medium text-[#19232d]">
            {percent.toFixed(0)}%
          </span>
        </div>
        <Progress value={percent} className="h-3" />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-[#19232d] mb-2">Today's Achievements</h4>
        <div className="flex flex-col gap-2">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.hours}
                className={`flex items-center gap-3 p-2 rounded-[8px] transition-all ${
                  achievement.unlocked
                    ? 'bg-white/80 text-yellow-700 border-2 border-yellow-400'
                    : 'bg-white/40 text-gray-400 border-2 border-gray-300'
                }`}
                title={`${achievement.label} - ${achievement.hours}h`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-[6px] ${
                  achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{achievement.label}</div>
                  <div className="text-xs opacity-75">{achievement.hours}h goal</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 