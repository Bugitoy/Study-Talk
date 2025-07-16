'use client';
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock } from 'lucide-react';

interface StudyTimeProgressProps {
  dailyMinutes: number; // Changed from dailyHours to dailyMinutes
  dailyGoal?: number;
  isTracking?: boolean;
  className?: string;
}

export function StudyTimeProgress({ 
  dailyMinutes, 
  dailyGoal = 60, // Changed from 10 hours to 60 minutes (1 hour)
  isTracking = false, 
  className = '' 
}: StudyTimeProgressProps) {
  const percent = Math.min((dailyMinutes / dailyGoal) * 100, 100);
  
  const achievements = [
    { minutes: 0.5, label: 'Quick Start', icon: Clock, unlocked: dailyMinutes >= 0.5 }, // 30 seconds
    { minutes: 0.75, label: 'Getting Focused', icon: Target, unlocked: dailyMinutes >= 0.75 }, // 45 seconds
    { minutes: 1, label: 'First Minute', icon: Trophy, unlocked: dailyMinutes >= 1 }, // 1 minute
    { minutes: 2, label: 'Study Streak', icon: Trophy, unlocked: dailyMinutes >= 2 }, // 2 minutes
    { minutes: 5, label: 'Dedication', icon: Trophy, unlocked: dailyMinutes >= 5 }, // 5 minutes
  ];

  const formatTime = (minutes: number) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`;
    } else if (minutes < 60) {
      return `${minutes.toFixed(1)}m`;
    } else {
      const hours = minutes / 60;
      return `${hours.toFixed(1)}h`;
    }
  };

  return (
    <div className={`backdrop-blur-sm rounded-xl p-4 shadow-md pointer-events-auto rounded-[8px] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#19232d]">Daily Progress</h3>
        {isTracking && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Tracking</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#19232d]">
            {formatTime(dailyMinutes)} / {formatTime(dailyGoal)}
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
                key={achievement.minutes}
                className={`flex items-center gap-3 p-2 rounded-[8px] transition-all ${
                  achievement.unlocked
                    ? 'bg-white/80 text-yellow-700 border-2 border-yellow-400'
                    : 'bg-white/40 text-gray-400 border-2 border-gray-300'
                }`}
                title={`${achievement.label} - ${formatTime(achievement.minutes)}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-[6px] ${
                  achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{achievement.label}</div>
                  <div className="text-xs opacity-75">{formatTime(achievement.minutes)} goal</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 