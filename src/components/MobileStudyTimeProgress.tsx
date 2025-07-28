'use client';
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock } from 'lucide-react';

interface MobileStudyTimeProgressProps {
  dailyHours?: number;
  dailyGoal?: number;
  isTracking?: boolean;
  className?: string;
}

export function MobileStudyTimeProgress({ 
  dailyHours, 
  dailyGoal = 10, 
  isTracking = false, 
  className = '' 
}: MobileStudyTimeProgressProps) {
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
    <div className={`backdrop-blur-sm rounded-xl p-3 sm:p-5 md:p-6 shadow-md pointer-events-auto rounded-[8px] ${className}`}>
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-5">
            <h3 className="text-base sm:text-lg md:text-2xl font-semibold text-[#19232d]">Daily Progress</h3>
            {isTracking && (
            <div className="flex items-center gap-1 text-green-600">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm md:text-lg font-medium">Tracking</span>
            </div>
            )}
        </div>
        
        <div className="mb-3 sm:mb-5 md:mb-6">
            <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm md:text-lg text-[#19232d]">
                {safeDailyHours.toFixed(2)}h / {dailyGoal}h
            </span>
            <span className="text-xs sm:text-sm md:text-lg font-medium text-[#19232d]">
                {percent.toFixed(0)}%
            </span>
            </div>
            <Progress value={percent} className="h-2 sm:h-3 md:h-5" />
        </div>
    </div>
  );
} 