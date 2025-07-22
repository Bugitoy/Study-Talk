import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get or create user streak record
    let userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!userStreak) {
      // Create new streak record
      userStreak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: null,
          totalStudyDays: 0,
        },
      });
    }

    return NextResponse.json({
      currentStreak: userStreak.currentStreak,
      longestStreak: userStreak.longestStreak,
      lastStudyDate: userStreak.lastStudyDate,
      totalStudyDays: userStreak.totalStudyDays,
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return NextResponse.json({ error: 'Failed to fetch streak data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Get or create user streak record
    let userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!userStreak) {
      // Create new streak record
      userStreak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: today,
          totalStudyDays: 1,
        },
      });
    } else {
      // Check if user already studied today
      const lastStudyDate = userStreak.lastStudyDate;
      const lastStudyDay = lastStudyDate ? new Date(lastStudyDate) : null;
      
      if (lastStudyDay) {
        lastStudyDay.setHours(0, 0, 0, 0);
      }

      // If user hasn't studied today
      if (!lastStudyDay || lastStudyDay.getTime() !== today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newCurrentStreak = 1; // Start new streak
        let newTotalStudyDays = userStreak.totalStudyDays + 1;

        // If last study was yesterday, continue the streak
        if (lastStudyDay && lastStudyDay.getTime() === yesterday.getTime()) {
          newCurrentStreak = userStreak.currentStreak + 1;
        }

        const newLongestStreak = Math.max(newCurrentStreak, userStreak.longestStreak);

        userStreak = await prisma.userStreak.update({
          where: { userId },
          data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastStudyDate: today,
            totalStudyDays: newTotalStudyDays,
          },
        });
      }
      // If user already studied today, return existing data without updating
    }

    return NextResponse.json({
      currentStreak: userStreak.currentStreak,
      longestStreak: userStreak.longestStreak,
      lastStudyDate: userStreak.lastStudyDate,
      totalStudyDays: userStreak.totalStudyDays,
    });
  } catch (error) {
    console.error('Error updating streak data:', error);
    return NextResponse.json({ error: 'Failed to update streak data' }, { status: 500 });
  }
} 