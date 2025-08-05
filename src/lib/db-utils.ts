import prisma from "@/db/prisma";
import { botDetectionService, BotDetectionResult } from './bot-detection';

// Get user information with subscription details
export async function getUserInfo(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Subscription: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan,
      customerId: user.customerId,
      university: user.university,
      universityVerifiedAt: user.universityVerifiedAt,
      universityChangeCount: user.universityChangeCount,
      isAdmin: user.isAdmin,
  
      createdAt: user.createdAt,
      subscription: user.Subscription,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

export async function createQuizRoom(data: {
  id: string;
  name: string;
  timePerQuestion: number;
  questions: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correct: string;
  }[];
}) {
  try {
    const room = await prisma.quizRoom.create({
      data: {
        id: data.id,
        name: data.name,
        timePerQuestion: data.timePerQuestion,
        questions: {
          create: data.questions,
        },
      },
      include: { questions: true },
    });
    return room;
  } catch (error) {
    console.error("Error creating quiz room:", error);
    throw error;
  }
}

export async function getQuizRoom(id: string) {
  try {
    return await prisma.quizRoom.findUnique({
      where: { id },
      include: { questions: true },
    });
  } catch (error) {
    console.error("Error fetching quiz room:", error);
    return null;
  }
}

export async function createQuizSession(roomId: string) {
  try {
    const session = await prisma.quizSession.create({
      data: { roomId },
    });
    return session.id;
  } catch (error) {
    console.error("Error creating quiz session:", error);
    throw error;
  }
}

export async function saveQuizAnswer(data: {
  roomId: string;
  sessionId: string;
  questionId: string;
  userId: string;
  answer: string;
}) {
  try {
    await prisma.quizAnswer.upsert({
      where: {
        sessionId_questionId_userId: {
          sessionId: data.sessionId,
          questionId: data.questionId,
          userId: data.userId,
        },
      },
      update: { answer: data.answer },
      create: data,
    });
  } catch (error) {
    console.error("Error saving quiz answer:", error);
    throw error;
  }
}

export async function getQuizResults(roomId: string, sessionId?: string) {
  try {
    const questions = await prisma.quizQuestion.findMany({
      where: { roomId },
    });
    const answers = await prisma.quizAnswer.findMany({
      where: sessionId ? { roomId, sessionId } : { roomId },
    });
    const userIds = Array.from(new Set(answers.map((a) => a.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name || u.id]));
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const results: Record<
      string,
      {
        userId: string;
        username: string | null;
        score: number;
        answers: {
          questionId: string;
          question: string;
          answer: string;
          correctAnswer: string;
          isCorrect: boolean;
        }[];
      }
    > = {};
    answers.forEach((a) => {
      const q = questionMap.get(a.questionId);
      if (!q) return;
      if (!results[a.userId]) {
        results[a.userId] = {
          userId: a.userId,
          username: userMap.get(a.userId) || a.userId,
          score: 0,
          answers: [],
        };
      }
      const userRes = results[a.userId];
      const isCorrect = q.correct === a.answer;
      if (isCorrect) {
        userRes.score += 1;
      }
      userRes.answers.push({
        questionId: q.id,
        question: q.question,
        answer: a.answer,
        correctAnswer: q.correct,
        isCorrect,
      });
    });
    // sort answers according to the order questions were asked
    const questionOrder = questions.map((q) => q.id);
    Object.values(results).forEach((u) => {
      u.answers.sort(
        (a, b) =>
          questionOrder.indexOf(a.questionId) - questionOrder.indexOf(b.questionId)
      );
    });
    return {
      questions: questions.map((q) => ({ id: q.id, question: q.question })),
      users: Object.values(results),
    };
  } catch (error) {
    console.error("Error getting quiz results:", error);
    return { questions: [], users: [] };
  }
}

export async function getTopicQuestions(topic: string) {
  try {
    const questions = await prisma.topicQuestion.findMany({ where: { topic } });
    
    // Randomize the questions array using Fisher-Yates shuffle algorithm
    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
    
    return shuffledQuestions;
  } catch (error) {
    console.error("Error fetching topic questions:", error);
    return [];
  }
}

export async function getTopics() {
  try {
    return await prisma.topic.findMany();
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
}

export async function updateQuizRoomQuestions(
  roomId: string,
  questions: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correct: string;
  }[],
) {
  try {
    // 1. Delete all answers for this room first
    await prisma.quizAnswer.deleteMany({ where: { roomId } });
    // 2. Delete and recreate questions
    await prisma.quizRoom.update({
      where: { id: roomId },
      data: {
        questions: {
          deleteMany: {},
          create: questions,
        },
      },
    });
  } catch (error) {
    console.error("Error updating quiz room questions:", error);
    throw error;
  }
}

export async function createRoomSetting(data: {
  roomName: string;
  numQuestions: number;
  timePerQuestion: number | null;
  mic: string;
  camera: string;
  participants: number;
  availability: string;
}) {
  try {
    return await prisma.roomSetting.create({ data });
  } catch (error) {
    console.error("Error creating room setting:", error);
    throw error;
  }
}

export async function updateRoomSetting(id: string, data: {
  callId?: string;
  topicName?: string;
}) {
  try {
    const result = await prisma.roomSetting.update({ where: { id }, data });
    return result;
  } catch (error) {
    console.error("Error updating room setting:", error);
    throw error;
  }
}

export async function getRoomSetting(id: string) {
  try {
    return await prisma.roomSetting.findUnique({ where: { id } });
  } catch (error) {
    console.error("Error fetching room setting:", error);
    return null;
  }
}

export async function getRoomSettingByCallId(callId: string) {
  try {
    const roomSetting = await prisma.roomSetting.findFirst({
      where: { callId },
    });
    return roomSetting;
  } catch (error) {
    console.error('Error getting room setting by callId:', error);
    throw error;
  }
}
export async function createStudyGroupRoom(data: { callId: string; roomName: string; hostId: string }) {
  try {
    return await prisma.studyGroupRoom.create({ data });
  } catch (error) {
    console.error('Error creating study group room:', error);
    throw error;
  }
}

export async function listActiveStudyGroupRooms() {
  try {
    return await prisma.studyGroupRoom.findMany({ where: { ended: false } });
  } catch (error) {
    console.error('Error fetching study group rooms:', error);
    return [];
  }
}

// 🚀 OPTIMIZED Study Group Room Functions
export async function listActiveStudyGroupRoomsOptimized(options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  try {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;

    // Build where clause with database-level search
    const whereClause: any = { ended: false };
    if (search.trim()) {
      whereClause.roomName = {
        contains: search.trim(),
        mode: 'insensitive' as const
      };
    }

    // Get total count for pagination
    const total = await prisma.studyGroupRoom.count({ where: whereClause });

    // Get paginated results with optimized select
    const rooms = await prisma.studyGroupRoom.findMany({
      where: whereClause,
      select: {
        callId: true,
        roomName: true,
        hostId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return {
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error fetching optimized study group rooms:', error);
    return {
      rooms: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}

export async function getStudyGroupRoomByCallId(callId: string) {
  try {
    return await prisma.studyGroupRoom.findFirst({
      where: { callId },
      select: {
        callId: true,
        roomName: true,
        hostId: true,
        ended: true,
        createdAt: true
      }
    });
  } catch (error) {
    console.error('Error fetching study group room by callId:', error);
    return null;
  }
}

export async function endStudyGroupRoom(callId: string) {
  try {
    // Check if room exists and is not already ended
    const room = await prisma.studyGroupRoom.findFirst({
      where: { callId }
    });
    
    if (!room) {
      return;
    }
    
    if (room.ended) {
      return;
    }
    
    await prisma.studyGroupRoom.updateMany({ 
      where: { callId }, 
      data: { ended: true } 
    });
  } catch (error) {
    console.error('Error ending study group room:', error);
  }
}

// Compete Room functions
export async function createCompeteRoom(data: { callId: string; roomName: string; hostId: string }) {
  try {
    return await prisma.competeRoom.create({
      data: {
        callId: data.callId,
        roomName: data.roomName,
        hostId: data.hostId,
        ended: false,
      },
    });
  } catch (error) {
    console.error('Error creating compete room:', error);
    throw error;
  }
}

export async function listActiveCompeteRooms() {
  try {
    return await prisma.competeRoom.findMany({ where: { ended: false } });
  } catch (error) {
    console.error('Error fetching compete rooms:', error);
    return [];
  }
}

// 🚀 OPTIMIZED Compete Room Functions
export async function listActiveCompeteRoomsOptimized(options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  try {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;

    // Build where clause with database-level search
    const whereClause: any = { ended: false };
    if (search.trim()) {
      whereClause.roomName = {
        contains: search.trim(),
        mode: 'insensitive' as const
      };
    }

    // Get total count for pagination
    const total = await prisma.competeRoom.count({ where: whereClause });

    // Get paginated results with optimized select
    const rooms = await prisma.competeRoom.findMany({
      where: whereClause,
      select: {
        callId: true,
        roomName: true,
        hostId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return {
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error fetching optimized compete rooms:', error);
    return {
      rooms: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}

export async function getCompeteRoomByCallId(callId: string) {
  try {
    return await prisma.competeRoom.findFirst({
      where: { callId },
      select: {
        callId: true,
        roomName: true,
        hostId: true,
        ended: true,
        createdAt: true
      }
    });
  } catch (error) {
    console.error('Error fetching compete room by callId:', error);
    return null;
  }
}

export async function endCompeteRoom(callId: string) {
  try {
    console.log('endCompeteRoom called for callId:', callId);
    
    // Check if room exists and is not already ended
    const room = await prisma.competeRoom.findFirst({
      where: { callId }
    });
    
    if (!room) {
      console.log('No compete room found for callId:', callId);
      return;
    }
    
    if (room.ended) {
      console.log('Room already ended for callId:', callId);
      return;
    }
    
    console.log('Ending compete room:', room.roomName, 'for callId:', callId);
    
    const result = await prisma.competeRoom.updateMany({ 
      where: { callId }, 
      data: { ended: true } 
    });
    
    console.log('Compete room ended successfully. Updated count:', result.count);
  } catch (error) {
    console.error('Error ending compete room:', error);
  }
}

// Study Session functions
export async function startStudySession(userId: string, callId: string) {
  try {
    console.log(`startStudySession called with userId: ${userId} callId: ${callId}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user already has a session for this call and date
    const existingSession = await prisma.studySession.findFirst({
      where: { 
        userId, 
        callId, 
        date: today 
      },
    });
    
    if (existingSession) {
      console.log('Found existing session:', existingSession.id);
      return existingSession;
    }
    
    console.log('Creating new study session...');
    const newSession = await prisma.studySession.create({
      data: {
        userId,
        callId,
        date: today,
      },
    });
    
    console.log('Created new study session:', {
      id: newSession.id,
      userId: newSession.userId,
      callId: newSession.callId,
      joinedAt: newSession.joinedAt,
      leftAt: newSession.leftAt,
      duration: newSession.duration,
      date: newSession.date,
      createdAt: newSession.createdAt
    });
    
    return newSession;
  } catch (error) {
    // If it's a unique constraint violation, try to find the existing session
    if ((error as any).code === 'P2002') {
      console.log('Duplicate session detected, finding existing session...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingSession = await prisma.studySession.findFirst({
        where: { 
          userId, 
          callId, 
          date: today 
        },
      });
      
      if (existingSession) {
        console.log('Found existing session after duplicate error:', existingSession.id);
        return existingSession;
      }
    }
    
    console.error('Error starting study session:', error);
    throw error;
  }
}

export async function endStudySession(userId: string, callId: string) {
  try {
    const session = await prisma.studySession.findFirst({
      where: { userId, callId, leftAt: null },
      orderBy: { joinedAt: 'desc' },
    });
    
    if (!session) {
      console.warn('No active session found for user:', userId, 'call:', callId);
      return null;
    }
    
    const leftAt = new Date();
    const duration = Math.floor((leftAt.getTime() - session.joinedAt.getTime()) / (1000 * 60)); // duration in minutes
    
    return await prisma.studySession.update({
      where: { id: session.id },
      data: { leftAt, duration },
    });
  } catch (error) {
    console.error('Error ending study session:', error);
    throw error;
  }
}

export async function updateStudySessionWithStreamDurationByCallId(callId: string, streamDurationSeconds: number) {
  try {
    console.log(`Looking for session with callId: ${callId}`);
    
    // Find any session for this call (not just active ones)
    const session = await prisma.studySession.findFirst({
      where: { callId },
      orderBy: { joinedAt: 'desc' },
    });
    
    if (!session) {
      console.warn('No session found for call:', callId);
      
      // Let's check what sessions exist for this callId
      const allSessions = await prisma.studySession.findMany({
        where: { callId },
        orderBy: { joinedAt: 'desc' },
      });
      console.log(`Found ${allSessions.length} sessions for callId ${callId}:`, allSessions.map(s => ({ id: s.id, userId: s.userId, joinedAt: s.joinedAt, leftAt: s.leftAt, duration: s.duration })));
      
      return null;
    }
    
    console.log(`Found session: ${session.id}, leftAt: ${session.leftAt}, duration: ${session.duration}`);
    
    // If session already has duration, don't overwrite it
    if (session.duration !== null) {
      console.log('Session already has duration, skipping update');
      return session;
    }
    
    const leftAt = session.leftAt || new Date();
    
    // If Stream.io duration is 0, use manual calculation
    let duration: number;
    if (streamDurationSeconds === 0) {
      console.log('Stream.io duration is 0, using manual calculation');
      duration = Math.floor((leftAt.getTime() - session.joinedAt.getTime()) / (1000 * 60));
    } else {
      // Convert Stream.io duration from seconds to minutes
      duration = Math.floor(streamDurationSeconds / 60);
    }
    
    console.log(`Session duration: ${duration} minutes (Stream.io: ${streamDurationSeconds}s, Manual: ${Math.floor((leftAt.getTime() - session.joinedAt.getTime()) / (1000 * 60))}m)`);
    
    const updatedSession = await prisma.studySession.update({
      where: { id: session.id },
      data: { leftAt, duration },
    });
    
    console.log('Session updated successfully:', { id: updatedSession.id, duration: updatedSession.duration, leftAt: updatedSession.leftAt });
    return updatedSession;
  } catch (error) {
    console.error('Error updating study session with Stream duration by callId:', error);
    throw error;
  }
}

export async function updateStudySessionWithStreamDuration(userId: string, callId: string, streamDurationSeconds: number) {
  try {
    console.log(`Looking for active session with userId: ${userId}, callId: ${callId}`);
    
    // First try to find any session that hasn't been updated with duration yet
    let session = await prisma.studySession.findFirst({
      where: { 
        userId, 
        callId, 
        duration: null  // Look for sessions without duration first
      },
      orderBy: { joinedAt: 'desc' },
    });
    
    // If no session without duration found, try to find any session for this user and call
    if (!session) {
      session = await prisma.studySession.findFirst({
        where: { userId, callId },
        orderBy: { joinedAt: 'desc' },
      });
    }
    
    if (!session) {
      console.warn('No session found for user:', userId, 'call:', callId);
      
      // Let's check what sessions exist for this user and callId
      const allSessions = await prisma.studySession.findMany({
        where: { userId, callId },
        orderBy: { joinedAt: 'desc' },
      });
      console.log(`Found ${allSessions.length} sessions for userId ${userId} and callId ${callId}:`, allSessions.map(s => ({ id: s.id, joinedAt: s.joinedAt, leftAt: s.leftAt, duration: s.duration })));
      
      return null;
    }
    
    console.log(`Found session: ${session.id}, joinedAt: ${session.joinedAt}, leftAt: ${session.leftAt}, duration: ${session.duration}`);
    
    // If session already has duration, don't overwrite it
    if (session.duration !== null) {
      console.log('Session already has duration, skipping update');
      return session;
    }
    
    const leftAt = session.leftAt || new Date();
    
    // If Stream.io duration is 0, use manual calculation
    let duration: number;
    if (streamDurationSeconds === 0) {
      console.log('Stream.io duration is 0, using manual calculation');
      duration = Math.floor((leftAt.getTime() - session.joinedAt.getTime()) / (1000 * 60));
    } else {
      // Convert Stream.io duration from seconds to minutes
      duration = Math.floor(streamDurationSeconds / 60);
    }
    
    console.log(`Session duration: ${duration} minutes (Stream.io: ${streamDurationSeconds}s, Manual: ${Math.floor((leftAt.getTime() - session.joinedAt.getTime()) / (1000 * 60))}m)`);
    
    const updatedSession = await prisma.studySession.update({
      where: { id: session.id },
      data: { leftAt, duration },
    });
    
    console.log('Session updated successfully:', { id: updatedSession.id, duration: updatedSession.duration, leftAt: updatedSession.leftAt });
    return updatedSession;
  } catch (error) {
    console.error('Error updating study session with Stream duration:', error);
    throw error;
  }
}

export async function getDailyStudyTime(userId: string, date?: Date) {
  try {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
        duration: { not: null },
      },
    });
    
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    return Math.round(totalMinutes / 60 * 100) / 100; // return hours with 2 decimal places
  } catch (error) {
    console.error('Error getting daily study time:', error);
    return 0;
  }
}

export async function getWeeklyStudyTime(userId: string) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // last 7 days
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        duration: { not: null },
      },
    });
    
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    return Math.round(totalMinutes / 60 * 100) / 100; // return hours with 2 decimal places
  } catch (error) {
    console.error('Error getting weekly study time:', error);
    return 0;
  }
}

export async function getLeaderboard(period: 'daily' | 'weekly' = 'weekly', limit: number = 20, offset: number = 0) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    
    const sessions = await prisma.studySession.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        duration: { not: null },
      },
    });
    
    // Group by userId and sum duration
    const userStats = new Map<string, number>();
    sessions.forEach(session => {
      const current = userStats.get(session.userId) || 0;
      userStats.set(session.userId, current + (session.duration || 0));
    });
    
    // Get user info and format results
    const userIds = Array.from(userStats.keys());
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
    });
    
    const allLeaderboard = users.map(user => ({
      userId: user.id,
      name: user.name || 'Anonymous',
      image: user.image,
      hours: Math.round((userStats.get(user.id) || 0) / 60 * 100) / 100,
    })).sort((a, b) => b.hours - a.hours);
    
    // Apply pagination
    const paginatedData = allLeaderboard.slice(offset, offset + limit);
    
    return {
      data: paginatedData,
      total: allLeaderboard.length,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(allLeaderboard.length / limit)
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 0
    };
  }
}

// Confession utility functions
export async function createConfession(data: {
  title: string;
  content: string;
  authorId: string;
  universityId?: string;
  isAnonymous?: boolean;
}) {
  try {
    // Use a transaction to ensure atomicity
    const confession = await prisma.$transaction(async (tx) => {
      // Create the confession
      const newConfession = await tx.confession.create({
        data: {
          title: data.title,
          content: data.content,
          authorId: data.authorId,
          universityId: data.universityId,
          isAnonymous: data.isAnonymous ?? true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              university: true,
            },
          },
          university: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Atomically increment the university's confession count
      if (data.universityId) {
        await tx.university.update({
          where: { id: data.universityId },
          data: {
            confessionCount: {
              increment: 1
            }
          }
        });
      }

      return newConfession;
    });

    // Monitor user activity and update reputation
    await monitorUserActivity(data.authorId, 'confession');

    return confession;
  } catch (error) {
    console.error('Error creating confession:', error);
    throw error;
  }
}

export async function getConfessions(options: {
  page?: number;
  limit?: number;
  universityId?: string;
  sortBy?: 'recent' | 'hot';
  search?: string;
  userId?: string;
}) {
  try {
    const { page = 1, limit = 20, universityId, sortBy = 'recent', search, userId } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      isHidden: false,
    };

    if (universityId) {
      where.universityId = universityId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = sortBy === 'hot' 
      ? { hotScore: 'desc' as const }
      : { createdAt: 'desc' as const };

    const confessions = await prisma.confession.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, image: true, university: true },
        },
        university: {
          select: { id: true, name: true },
        },
        votes: {
          select: { voteType: true },
        },
        _count: {
          select: {
            comments: true,
            savedBy: true,
          },
        },
      },
    });

    // Calculate vote counts and engagement metrics
    const processedConfessions = confessions.map(confession => {
      const believeCount = confession.votes.filter(v => v.voteType === 'BELIEVE').length;
      const doubtCount = confession.votes.filter(v => v.voteType === 'DOUBT').length;
      
      // Find user's vote if userId is provided
      const userVote = userId ? confession.votes.find(v => (v as any).userId === userId) : null;
      
      return {
        ...confession,
        believeCount,
        doubtCount,
        commentCount: confession._count.comments,
        savedCount: confession._count.savedBy,
        userVote: userVote ? userVote.voteType : null,
        votes: undefined, // Remove raw votes from response
        _count: undefined,
      };
    });

    return processedConfessions;
  } catch (error) {
    console.error('Error getting confessions:', error);
    throw error;
  }
}

// New function for infinite scroll with cursor-based pagination
export async function getConfessionsInfinite(options: {
  cursor?: string;
  limit?: number;
  universityId?: string;
  sortBy?: 'recent' | 'hot';
  search?: string;
  userId?: string;
}) {
  try {
    const { cursor, limit = 20, universityId, sortBy = 'recent', search, userId } = options;

    const where: any = {
      isHidden: false,
    };

    if (universityId) {
      where.universityId = universityId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add cursor condition for pagination
    if (cursor) {
      if (sortBy === 'hot') {
        // For hot sorting, we need to handle hotScore + id as compound cursor
        const [hotScore, id] = cursor.split('_');
        where.OR = [
          { hotScore: { lt: parseFloat(hotScore) } },
          { 
            hotScore: parseFloat(hotScore),
            id: { lt: id }
          }
        ];
        // Clear other OR conditions when cursor is present
        if (search) {
          where.AND = [
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ]
            },
            {
              OR: [
                { hotScore: { lt: parseFloat(hotScore) } },
                { 
                  hotScore: parseFloat(hotScore),
                  id: { lt: id }
                }
              ]
            }
          ];
          delete where.OR;
        }
      } else {
        // For recent sorting, use createdAt + id
        const [createdAt, id] = cursor.split('_');
        where.OR = [
          { createdAt: { lt: new Date(createdAt) } },
          { 
            createdAt: new Date(createdAt),
            id: { lt: id }
          }
        ];
        // Clear other OR conditions when cursor is present
        if (search) {
          where.AND = [
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ]
            },
            {
              OR: [
                { createdAt: { lt: new Date(createdAt) } },
                { 
                  createdAt: new Date(createdAt),
                  id: { lt: id }
                }
              ]
            }
          ];
          delete where.OR;
        }
      }
    }

    const orderBy = sortBy === 'hot' 
      ? [{ hotScore: 'desc' as const }, { id: 'desc' as const }]
      : [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

    // Fetch one extra item to determine if there are more items
    const confessions = await prisma.confession.findMany({
      where,
      orderBy,
      take: limit + 1,
      include: {
        author: {
          select: { id: true, name: true, image: true, university: true },
        },
        university: {
          select: { id: true, name: true },
        },
        votes: {
          select: { voteType: true, userId: true },
        },
        _count: {
          select: {
            comments: true,
            savedBy: true,
          },
        },
      },
    });

    // Check if there are more items
    const hasMore = confessions.length > limit;
    const items = hasMore ? confessions.slice(0, limit) : confessions;

    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (sortBy === 'hot') {
        nextCursor = `${lastItem.hotScore}_${lastItem.id}`;
      } else {
        nextCursor = `${lastItem.createdAt.toISOString()}_${lastItem.id}`;
      }
    }

    // Calculate vote counts and engagement metrics
    const processedConfessions = items.map(confession => {
      const believeCount = confession.votes.filter(v => v.voteType === 'BELIEVE').length;
      const doubtCount = confession.votes.filter(v => v.voteType === 'DOUBT').length;
      
      // Find user's vote if userId is provided
      const userVote = userId ? confession.votes.find(v => v.userId === userId) : null;
      
      return {
        ...confession,
        believeCount,
        doubtCount,
        commentCount: confession._count.comments,
        savedCount: confession._count.savedBy,
        userVote: userVote ? userVote.voteType : null,
        votes: undefined, // Remove raw votes from response
        _count: undefined,
      };
    });

    return {
      confessions: processedConfessions,
      nextCursor,
      hasMore,
    };
  } catch (error) {
    console.error('Error getting confessions (infinite):', error);
    throw error;
  }
}

export async function voteConfession(confessionId: string, userId: string, voteType: 'BELIEVE' | 'DOUBT') {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use a transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Check if user already voted
        const existingVote = await tx.confessionVote.findUnique({
          where: {
            userId_confessionId: {
              userId,
              confessionId,
            },
          },
        });

        let vote;
        if (existingVote) {
          // Update existing vote - need to handle counter changes
          const oldVoteType = existingVote.voteType;
          
          // Update the vote first
          vote = await tx.confessionVote.update({
            where: {
              userId_confessionId: {
                userId,
                confessionId,
              },
            },
            data: {
              voteType,
            },
          });

          // Update counters in a single operation to reduce conflicts
          const updateData: any = {};
          if (oldVoteType === 'BELIEVE') {
            updateData.believeCount = { decrement: 1 };
          } else if (oldVoteType === 'DOUBT') {
            updateData.doubtCount = { decrement: 1 };
          }
          
          if (voteType === 'BELIEVE') {
            updateData.believeCount = { increment: 1 };
          } else if (voteType === 'DOUBT') {
            updateData.doubtCount = { increment: 1 };
          }

          // Single update operation
          await tx.confession.update({
            where: { id: confessionId },
            data: updateData
          });
        } else {
          // Create new vote
          vote = await tx.confessionVote.create({
            data: {
              userId,
              confessionId,
              voteType,
            },
          });

          // Increment the vote type counter
          const updateData: any = {};
          if (voteType === 'BELIEVE') {
            updateData.believeCount = { increment: 1 };
          } else if (voteType === 'DOUBT') {
            updateData.doubtCount = { increment: 1 };
          }

          await tx.confession.update({
            where: { id: confessionId },
            data: updateData
          });
        }

        return vote;
      }, {
        maxWait: 5000, // 5 second max wait
        timeout: 10000, // 10 second timeout
      });

      // Monitor user activity and update reputation
      await monitorUserActivity(userId, 'vote');

      // Update hot score
      await updateConfessionHotScore(confessionId);

      return result;
    } catch (error: any) {
      lastError = error;
      
      // If it's a transaction conflict, retry
      if (error.code === 'P2034' && attempt < maxRetries) {
        console.log(`Vote transaction conflict, retrying... (attempt ${attempt}/${maxRetries})`);
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
      
      // If it's not a conflict or we've exhausted retries, throw the error
      console.error('Error voting on confession:', error);
      throw error;
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

export async function removeVoteOnConfession(data: {
  userId: string;
  confessionId: string;
}) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use a transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Get the vote to know what type it was
        const existingVote = await tx.confessionVote.findUnique({
          where: {
            userId_confessionId: {
              userId: data.userId,
              confessionId: data.confessionId,
            },
          },
        });

        if (!existingVote) {
          return { success: true, deletedCount: 0 };
        }

        // Delete the vote
        await tx.confessionVote.delete({
          where: {
            userId_confessionId: {
              userId: data.userId,
              confessionId: data.confessionId,
            },
          },
        });

        // Decrement the appropriate counter
        const updateData: any = {};
        if (existingVote.voteType === 'BELIEVE') {
          updateData.believeCount = { decrement: 1 };
        } else if (existingVote.voteType === 'DOUBT') {
          updateData.doubtCount = { decrement: 1 };
        }

        await tx.confession.update({
          where: { id: data.confessionId },
          data: updateData
        });

        return { success: true, deletedCount: 1 };
      }, {
        maxWait: 5000, // 5 second max wait
        timeout: 10000, // 10 second timeout
      });

      // Update confession hot score
      await updateConfessionHotScore(data.confessionId);

      return result;
    } catch (error: any) {
      lastError = error;
      
      // If it's a transaction conflict, retry
      if (error.code === 'P2034' && attempt < maxRetries) {
        console.log(`Remove vote transaction conflict, retrying... (attempt ${attempt}/${maxRetries})`);
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
      
      // If it's not a conflict or we've exhausted retries, throw the error
      console.error('Error removing vote on confession:', error);
      throw error;
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

export async function getConfessionComments(confessionId: string) {
  try {
    // Get all comments for this confession
    const allComments = await prisma.confessionComment.findMany({
      where: {
        confessionId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter for top-level comments (parentId is null/undefined)
    const topLevelComments = allComments.filter(comment => 
      !comment.parentId || comment.parentId === null || comment.parentId === undefined
    );

    // For each top-level comment, get its replies
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await prisma.confessionComment.findMany({
          where: {
            parentId: comment.id,
          },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        return {
          ...comment,
          replies,
        };
      })
    );

    return commentsWithReplies;
  } catch (error) {
    console.error('Error fetching confession comments:', error);
    throw error;
  }
}

export async function createConfessionComment(data: {
  content: string;
  authorId: string;
  confessionId: string;
  parentId?: string;
  isAnonymous?: boolean;
}) {
  try {
    // Use a transaction to ensure atomicity
    const comment = await prisma.$transaction(async (tx) => {
      // Create the comment
      const newComment = await tx.confessionComment.create({
        data: {
          content: data.content,
          authorId: data.authorId,
          confessionId: data.confessionId,
          parentId: data.parentId,
          isAnonymous: data.isAnonymous ?? true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              university: true,
            },
          },
        },
      });

      // Atomically increment the confession's comment/reply counters
      if (data.parentId) {
        // This is a reply - increment reply count
        await tx.confession.update({
          where: { id: data.confessionId },
          data: {
            replyCount: {
              increment: 1
            }
          }
        });
      } else {
        // This is a top-level comment - increment comment count
        await tx.confession.update({
          where: { id: data.confessionId },
          data: {
            commentCount: {
              increment: 1
            }
          }
        });
      }

      return newComment;
    });

    // Monitor user activity and update reputation
    await monitorUserActivity(data.authorId, 'comment');

    // Update confession hot score
    await updateConfessionHotScore(data.confessionId);

    return comment;
  } catch (error) {
    console.error('Error creating confession comment:', error);
    throw error;
  }
}

export async function saveConfession(userId: string, confessionId: string) {
  try {
    return await prisma.savedConfession.create({
      data: { userId, confessionId },
    });
  } catch (error) {
    console.error('Error saving confession:', error);
    throw error;
  }
}

export async function unsaveConfession(userId: string, confessionId: string) {
  try {
    return await prisma.savedConfession.delete({
      where: {
        userId_confessionId: {
          userId,
          confessionId,
        },
      },
    });
  } catch (error) {
    console.error('Error unsaving confession:', error);
    throw error;
  }
}

export async function getSavedConfessions(userId: string) {
  try {
    const saved = await prisma.savedConfession.findMany({
      where: { userId },
      include: {
        confession: {
          select: {
            id: true,
            title: true,
            content: true,
            authorId: true,
            isAnonymous: true,
            hotScore: true,
            commentCount: true,
            replyCount: true,
            believeCount: true,
            doubtCount: true,
            savedCount: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: { 
                id: true, 
                name: true, 
                image: true, 
                university: true 
              },
            },
            university: {
              select: { 
                id: true, 
                name: true 
              },
            },
            // Only fetch user's vote
            votes: {
              where: { userId },
              select: { voteType: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map(item => {
      const confession = item.confession;
      const userVote = confession.votes?.[0]?.voteType || null;
      
      return {
        ...confession,
        believeCount: confession.believeCount,
        doubtCount: confession.doubtCount,
        commentCount: confession.commentCount,
        savedCount: confession.savedCount,
        userVote,
        votes: undefined, // Remove raw votes from response
      };
    });
  } catch (error) {
    console.error('Error getting saved confessions:', error);
    throw error;
  }
}

export async function getConfessionById(confessionId: string, userId?: string) {
  try {
    const confession = await prisma.confession.findUnique({
      where: { 
        id: confessionId,
        isHidden: false 
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        isAnonymous: true,
        hotScore: true,
        commentCount: true,
        replyCount: true,
        believeCount: true,
        doubtCount: true,
        savedCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, name: true, image: true, university: true },
        },
        university: {
          select: { id: true, name: true },
        },
        // Only fetch user's vote if userId is provided
        ...(userId && {
          votes: {
            where: { userId },
            select: { voteType: true },
            take: 1,
          },
        }),
      },
    });

    if (!confession) {
      return null;
    }

    // Get user's vote if available
    const userVote = userId && confession.votes ? confession.votes[0]?.voteType || null : null;
    
    return {
      ...confession,
      believeCount: confession.believeCount,
      doubtCount: confession.doubtCount,
      commentCount: confession.commentCount,
      savedCount: confession.savedCount,
      userVote,
      votes: undefined, // Remove raw votes from response
    };
  } catch (error) {
    console.error('Error getting confession by ID:', error);
    throw error;
  }
}

// University functions
export async function getOrCreateUniversity(name: string) {
  try {
    const existing = await prisma.university.findUnique({
      where: { name },
    });

    if (existing) {
      return existing;
    }

    return await prisma.university.create({
      data: { name },
    });
  } catch (error) {
    console.error('Error creating university:', error);
    throw error;
  }
}

export async function getUniversities() {
  try {
    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: {
            confessions: true,
          },
        },
      },
      orderBy: {
        confessions: {
          _count: 'desc',
        },
      },
    });

    // Get additional stats for each university
    const universitiesWithStats = await Promise.all(
      universities.map(async (uni) => {
        const votes = await prisma.confessionVote.count({
          where: {
            confession: {
              universityId: uni.id,
            },
          },
        });

        // Get unique student count
        const uniqueStudents = await prisma.confession.groupBy({
          by: ['authorId'],
          where: { universityId: uni.id },
        });

        return {
          ...uni,
          confessionCount: uni._count.confessions,
          studentCount: uniqueStudents.length,
          totalVotes: votes,
          _count: undefined,
        };
      })
    );

    return universitiesWithStats;
  } catch (error) {
    console.error('Error getting universities:', error);
    throw error;
  }
}

// Optimized user info query with selective includes
export async function getUserInfoOptimized(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        customerId: true,
        university: true,
        universityVerifiedAt: true,
        universityChangeCount: true,
        isAdmin: true,
        createdAt: true,
        Subscription: {
          select: {
            id: true,
            plan: true,
            period: true,
            startDate: true,
            endDate: true,
          }
        },
      },
    });

    if (!user) return null;

    return {
      ...user,
      subscription: user.Subscription,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

// Optimized university query with single database call
export async function getUniversitiesOptimized() {
  try {
    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: {
            confessions: true,
          },
        },
      },
      orderBy: {
        confessions: {
          _count: 'desc',
        },
      },
    });

    // Get additional stats for each university in a single query
    const universitiesWithStats = await Promise.all(
      universities.map(async (uni) => {
        const [votes, uniqueStudents] = await Promise.all([
          prisma.confessionVote.count({
            where: {
              confession: {
                universityId: uni.id,
              },
            },
          }),
          prisma.confession.groupBy({
            by: ['authorId'],
            where: { universityId: uni.id },
          }),
        ]);

        return {
          ...uni,
          confessionCount: uni._count.confessions,
          studentCount: uniqueStudents.length,
          totalVotes: votes,
          _count: undefined,
        };
      })
    );

    return universitiesWithStats;
  } catch (error) {
    console.error('Error getting universities:', error);
    throw error;
  }
}

export async function updateUserUniversity(userId: string, university: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { universityChangeCount: true, universityVerifiedAt: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user can change university (max 2 changes per year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (user.universityChangeCount >= 2 && user.universityVerifiedAt && user.universityVerifiedAt > oneYearAgo) {
      throw new Error('University can only be changed twice per year');
    }

    // Reset change count if more than a year has passed
    const shouldResetCount = !user.universityVerifiedAt || user.universityVerifiedAt <= oneYearAgo;

    return await prisma.user.update({
      where: { id: userId },
      data: {
        university,
        universityVerifiedAt: new Date(),
        universityChangeCount: shouldResetCount ? 1 : user.universityChangeCount + 1,
      },
    });
  } catch (error) {
    console.error('Error updating user university:', error);
    throw error;
  }
}

// Hot score calculation algorithm
async function updateConfessionHotScore(confessionId: string) {
  try {
    const confession = await prisma.confession.findUnique({
      where: { id: confessionId },
      include: {
        votes: true,
        comments: true,
      },
    });

    if (!confession) return;

    const now = new Date();
    const ageInHours = (now.getTime() - confession.createdAt.getTime()) / (1000 * 60 * 60);
    
    // Count votes
    const believeCount = confession.votes.filter(v => v.voteType === 'BELIEVE').length;
    const doubtCount = confession.votes.filter(v => v.voteType === 'DOUBT').length;
    const totalVotes = believeCount + doubtCount;
    
    // Controversy score (higher when votes are split)
    const controversyScore = totalVotes > 0 
      ? 1 - Math.abs(believeCount - doubtCount) / totalVotes 
      : 0;
    
    // Engagement score (removed viewCount)
    const engagementScore = totalVotes + (confession.comments.length * 2);
    
    // Time decay factor (content gets less hot over time)
    const timeDecay = Math.exp(-ageInHours / 24); // Decay over 24 hours
    
    // Final hot score calculation
    const hotScore = (engagementScore * (1 + controversyScore)) * timeDecay;
    
    await prisma.confession.update({
      where: { id: confessionId },
      data: { hotScore },
    });
  } catch (error) {
    console.error('Error updating hot score:', error);
  }
}

/**
 * Determine reputation level based on score
 */
function determineReputationLevel(score: number): string {
  if (score >= 800) return 'LEGENDARY';
  if (score >= 600) return 'EXPERT';
  if (score >= 400) return 'TRUSTED';
  if (score >= 200) return 'ACTIVE';
  if (score >= 100) return 'REGULAR';
  return 'NEW';
}

/**
 * Enhanced reputation calculation with bot detection
 */
export async function calculateUserReputation(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        confessions: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            hotScore: true,
            content: true,
            votes: {
              select: {
                id: true,
                voteType: true
              }
            },
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true
              }
            }
          }
        },
        confessionVotes: {
          select: {
            id: true,
            createdAt: true,
            voteType: true
          }
        },
        confessionComments: {
          select: {
            id: true,
            createdAt: true,
            content: true
          }
        },
        reports: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user) return;

    // Calculate activity score
    const activityScore = calculateActivityScore(user);
    
    // Calculate quality score
    const qualityScore = calculateQualityScore(user);
    
    // Calculate trust score
    const trustScore = calculateTrustScore(user);

    // Enhanced bot detection
    const botDetectionResult = await botDetectionService.detectBot(userId);
    
    // Update user's bot probability
    await botDetectionService.updateUserBotProbability(userId, botDetectionResult.probability);

    // Calculate final reputation score with bot penalty
    const botPenalty = botDetectionResult.probability > 50 ? (botDetectionResult.probability - 50) * 0.5 : 0;
    const reputationScore = Math.max(0, activityScore + qualityScore + trustScore - botPenalty);

    // Determine reputation level
    const reputationLevel = determineReputationLevel(reputationScore);

    // Update user reputation
    await prisma.user.update({
      where: { id: userId },
      data: {
        reputationScore: Math.round(reputationScore),
        activityScore: Math.round(activityScore),
        qualityScore: Math.round(qualityScore),
        trustScore: Math.round(trustScore),
        botProbability: Math.round(botDetectionResult.probability),
        reputationLevel,
        isFlagged: botDetectionResult.riskLevel === 'CRITICAL' || botDetectionResult.riskLevel === 'HIGH',
        updatedAt: new Date()
      }
    });

    // Log reputation history
    await prisma.reputationHistory.create({
      data: {
        userId,
        changeType: 'REPUTATION_CALCULATION',
        changeAmount: Math.round(reputationScore) - (user.reputationScore || 0),
        reason: 'Reputation recalculated with bot detection',
        previousScore: user.reputationScore || 0,
        newScore: Math.round(reputationScore),
        reputationScore: Math.round(reputationScore),
        activityScore: Math.round(activityScore),
        qualityScore: Math.round(qualityScore),
        trustScore: Math.round(trustScore),
        botProbability: Math.round(botDetectionResult.probability),
        reputationLevel,
        changeReason: 'reputation_calculation',
        botIndicators: botDetectionResult.indicators,
        riskLevel: botDetectionResult.riskLevel
      }
    });

    console.log(`Reputation updated for user ${userId}:`, {
      reputationScore: Math.round(reputationScore),
      botProbability: Math.round(botDetectionResult.probability),
      riskLevel: botDetectionResult.riskLevel,
      indicators: botDetectionResult.indicators
    });

  } catch (error) {
    console.error('Error calculating user reputation:', error);
  }
}

/**
 * Enhanced user activity monitoring with bot detection
 */
export async function monitorUserActivity(userId: string, action: 'confession' | 'vote' | 'comment'): Promise<void> {
  try {
    // Update daily activity counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateData: any = {
      lastActivityAt: new Date()
    };

    switch (action) {
      case 'confession':
        updateData.dailyConfessions = { increment: 1 };
        updateData.confessionsCreated = { increment: 1 };
        break;
      case 'vote':
        updateData.dailyVotes = { increment: 1 };
        updateData.votesCast = { increment: 1 };
        break;
      case 'comment':
        updateData.dailyComments = { increment: 1 };
        updateData.commentsCreated = { increment: 1 };
        break;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Trigger bot detection analysis
    const botDetectionResult = await botDetectionService.detectBot(userId);
    
    // Update bot probability
    await botDetectionService.updateUserBotProbability(userId, botDetectionResult.probability);

    // Flag user if critical risk detected
    if (botDetectionResult.riskLevel === 'CRITICAL') {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isFlagged: true,
          botProbability: botDetectionResult.probability
        }
      });

      console.log(`Critical bot risk detected for user ${userId}:`, {
        probability: botDetectionResult.probability,
        indicators: botDetectionResult.indicators,
        recommendations: botDetectionResult.recommendations
      });
    }

    // Recalculate reputation with bot detection
    await calculateUserReputation(userId);

  } catch (error) {
    console.error('Error monitoring user activity:', error);
  }
}

/**
 * Get bot detection statistics for admin dashboard
 */
export async function getBotDetectionStats() {
  try {
    return await botDetectionService.getBotDetectionStats();
  } catch (error) {
    console.error('Error getting bot detection stats:', error);
    return {
      totalUsers: 0,
      suspiciousUsers: 0,
      criticalUsers: 0,
      averageProbability: 0
    };
  }
}

/**
 * Get detailed bot detection information for a user
 */
export async function getUserBotDetectionInfo(userId: string): Promise<BotDetectionResult | null> {
  try {
    return await botDetectionService.detectBot(userId);
  } catch (error) {
    console.error('Error getting user bot detection info:', error);
    return null;
  }
}

// Calculate activity-based reputation score
function calculateActivityScore(user: any) {
  let score = 0;
  
  // Account age bonus (1 point per day, max 365)
  const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  score += Math.min(accountAgeDays, 365);
  
  // Confession activity (5 points per confession)
  score += (user.confessions?.length || 0) * 5;
  
  // Voting activity (1 point per vote)
  score += (user.confessionVotes?.length || 0);
  
  // Comment activity (2 points per comment)
  score += (user.confessionComments?.length || 0) * 2;
  
  // Recent activity bonus (last 7 days)
  const recentActivity = (user.confessions?.filter((c: any) => 
    c.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0);
  score += recentActivity * 3;
  
  return Math.min(score, 1000); // Cap at 1000
}

// Calculate quality-based reputation score
function calculateQualityScore(user: any) {
  let score = 0;
  
  // Handle case where user has no confessions or confessions is undefined
  if (!user.confessions || user.confessions.length === 0) return 0;
  
  // Average votes received per confession
  const totalVotesReceived = user.confessions.reduce((sum: number, confession: any) => 
    sum + (confession.votes?.length || 0), 0
  );
  const avgVotesPerConfession = totalVotesReceived / user.confessions.length;
  score += avgVotesPerConfession * 10;
  
  // Positive vote ratio (BELIEVE votes vs total votes)
  const totalVotes = user.confessions.reduce((sum: number, confession: any) => 
    sum + (confession.votes?.length || 0), 0
  );
  const positiveVotes = user.confessions.reduce((sum: number, confession: any) => 
    sum + (confession.votes?.filter((v: any) => v.voteType === 'BELIEVE').length || 0), 0
  );
  
  if (totalVotes > 0) {
    const positiveRatio = positiveVotes / totalVotes;
    score += positiveRatio * 200; // Max 200 points for 100% positive
  }
  
  // Comment engagement (comments received per confession)
  const totalCommentsReceived = user.confessions.reduce((sum: number, confession: any) => 
    sum + (confession.comments?.length || 0), 0
  );
  const avgCommentsPerConfession = totalCommentsReceived / user.confessions.length;
  score += avgCommentsPerConfession * 15;
  
  // Content length quality (longer content gets more points)
  const avgContentLength = user.confessions.reduce((sum: number, confession: any) => 
    sum + (confession.content?.length || 0), 0
  ) / user.confessions.length;
  score += Math.min(avgContentLength / 10, 50); // Max 50 points for long content
  
  return Math.min(score, 1000); // Cap at 1000
}

// Calculate trust-based reputation score
function calculateTrustScore(user: any) {
  let score = 0;
  
  // No reports bonus (100 points)
  if (!user.reports || user.reports.length === 0) {
    score += 100;
  } else {
    // Penalty for reports (-50 per report)
    score -= user.reports.length * 50;
  }
  
  // Account verification bonus (50 points)
  if (user.universityVerifiedAt) {
    score += 50;
  }
  
  // Consistent activity (no long gaps)
  const recentActivity = user.confessions?.filter((c: any) => 
    c.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length || 0;
  if (recentActivity > 0) {
    score += 50;
  }
  
  // No suspicious patterns
  if (!hasSuspiciousPatterns(user)) {
    score += 100;
  }
  
  return Math.max(score, 0); // Don't go below 0
}

// Detect bot activity and suspicious patterns
async function detectBotActivity(user: any) {
  let botScore = 0;
  const reasons: string[] = [];
  
  // Check for rapid activity
  const accountAgeHours = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60);
  const activityRate = user.confessions.length / Math.max(accountAgeHours, 1);
  
  if (activityRate > 2) { // More than 2 confessions per hour
    botScore += 30;
    reasons.push('High activity rate');
  }
  
  // Check for repetitive content
  if (hasRepetitiveContent(user.confessions)) {
    botScore += 25;
    reasons.push('Repetitive content');
  }
  
  // Check for unnatural timing
  if (hasUnnaturalTiming(user.confessions)) {
    botScore += 20;
    reasons.push('Unnatural timing');
  }
  
  // Check for suspicious patterns
  if (hasSuspiciousPatterns(user)) {
    botScore += 15;
    reasons.push('Suspicious patterns');
  }
  
  // Check for no engagement
  const totalVotes = user.confessions.reduce((sum: number, confession: any) => 
    sum + confession.votes.length, 0
  );
  if (user.confessions.length > 5 && totalVotes === 0) {
    botScore += 20;
    reasons.push('No engagement');
  }
  
  return {
    botProbability: Math.min(botScore, 100),
    isBot: botScore > 70,
    isFlagged: botScore > 50,
    reasons,
  };
}

// Check for repetitive content
function hasRepetitiveContent(confessions: any[]) {
  if (confessions.length < 3) return false;
  
  const titles = confessions.map(c => c.title.toLowerCase());
  const contents = confessions.map(c => c.content.toLowerCase());
  
  // Check for duplicate titles
  const duplicateTitles = titles.filter((title, index) => 
    titles.indexOf(title) !== index
  ).length;
  
  // Check for duplicate content
  const duplicateContents = contents.filter((content, index) => 
    contents.indexOf(content) !== index
  ).length;
  
  return duplicateTitles > 1 || duplicateContents > 0;
}

// Check for unnatural timing patterns
function hasUnnaturalTiming(confessions: any[]) {
  if (confessions.length < 3) return false;
  
  const timestamps = confessions.map(c => c.createdAt.getTime()).sort((a, b) => a - b);
  const intervals = [];
  
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i-1]);
  }
  
  // Check for too-regular intervals (bot-like)
  const regularIntervals = intervals.filter(interval => 
    interval > 5000 && interval < 15000 // 5-15 second intervals
  ).length;
  
  return regularIntervals > intervals.length * 0.6; // 60% regular intervals
}

// Check for suspicious patterns
function hasSuspiciousPatterns(user: any) {
  // Handle case where user has no confessions
  if (!user.confessions || user.confessions.length === 0) return false;
  
  // Check for very short content
  const shortContent = user.confessions.filter((c: any) => 
    c.content && c.content.length < 20
  ).length;
  
  // Check for generic titles (if title exists)
  const genericTitles = user.confessions.filter((c: any) => 
    c.title && (
      c.title.toLowerCase().includes('test') || 
      c.title.toLowerCase().includes('hello') ||
      c.title.toLowerCase().includes('hi')
    )
  ).length;
  
  return shortContent > user.confessions.length * 0.5 || genericTitles > 2;
}

// Get verification level based on reputation and bot probability
function getVerificationLevel(reputationScore: number, botProbability: number): string {
  if (botProbability > 70) return 'SUSPICIOUS';
  if (reputationScore > 500) return 'TRUSTED';
  if (reputationScore > 200) return 'VERIFIED';
  return 'NEW_USER';
}

// Log reputation changes for audit trail
async function logReputationChange(userId: string, changeType: string, changeAmount: number, reason: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { reputationScore: true },
    });

    if (!user) return;

    await prisma.reputationHistory.create({
      data: {
        userId,
        changeType,
        changeAmount,
        reason,
        previousScore: user.reputationScore,
        newScore: user.reputationScore + changeAmount,
      },
    });
  } catch (error) {
    console.error('Error logging reputation change:', error);
  }
}

// Get user reputation for display
export async function getUserReputation(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputationScore: true,
        activityScore: true,
        qualityScore: true,
        trustScore: true,
        botProbability: true,
        verificationLevel: true,
        isFlagged: true,
      },
    });
    
    if (!user) return null;

    return {
      reputationScore: user.reputationScore,
      activityScore: user.activityScore,
      qualityScore: user.qualityScore,
      trustScore: user.trustScore,
      botProbability: user.botProbability,
      verificationLevel: user.verificationLevel,
      isFlagged: user.isFlagged,
      reputationLevel: getReputationLevel(user.reputationScore),
    };
  } catch (error) {
    console.error('Error getting user reputation:', error);
    return null;
  }
}

// Get reputation level for display
function getReputationLevel(reputationScore: number): string {
  if (reputationScore >= 800) return 'LEGENDARY';
  if (reputationScore >= 600) return 'EXPERT';
  if (reputationScore >= 400) return 'TRUSTED';
  if (reputationScore >= 200) return 'ACTIVE';
  if (reputationScore >= 100) return 'REGULAR';
  return 'NEW';
}

// Get daily confession count for a user
export async function getDailyConfessionCount(userId: string, date?: Date) {
  try {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await prisma.confession.count({
      where: {
        authorId: userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting daily confession count:', error);
    return 0;
  }
}

export async function getConfessionCommentsOptimized(confessionId: string) {
  try {
    // Single query to get all comments with their replies in one go
    const allComments = await prisma.confessionComment.findMany({
      where: {
        confessionId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: [
        { parentId: 'asc' }, // Top-level comments first (parentId is null)
        { createdAt: 'desc' } // Then by creation time
      ],
    });

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(comment => !comment.parentId);
    const replies = allComments.filter(comment => comment.parentId);

    // Create a map of replies by parent ID for O(1) lookup
    const repliesMap = new Map();
    replies.forEach(reply => {
      if (!repliesMap.has(reply.parentId)) {
        repliesMap.set(reply.parentId, []);
      }
      repliesMap.get(reply.parentId).push(reply);
    });

    // Attach replies to their parent comments
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...comment,
      replies: repliesMap.get(comment.id) || [],
    }));

    return commentsWithReplies;
  } catch (error) {
    console.error('Error fetching confession comments:', error);
    throw error;
  }
}

export async function getConfessionsInfiniteOptimized(options: {
  cursor?: string;
  limit?: number;
  universityId?: string;
  sortBy?: 'recent' | 'hot';
  search?: string;
  userId?: string;
  authorId?: string;
}) {
  try {
    const { cursor, limit = 20, universityId, sortBy = 'recent', search, userId, authorId } = options;

    const where: any = {
      isHidden: false,
    };

    if (universityId) {
      where.universityId = universityId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by author if authorId is provided (for user's own confessions)
    if (authorId) {
      where.authorId = authorId;
    }

    // Simplified cursor logic for better performance
    if (cursor) {
      if (sortBy === 'hot') {
        const [hotScore, id] = cursor.split('_');
        where.AND = [
          { OR: [
            { hotScore: { lt: parseFloat(hotScore) } },
            { hotScore: parseFloat(hotScore), id: { lt: id } }
          ]}
        ];
      } else {
        const [createdAt, id] = cursor.split('_');
        where.AND = [
          { OR: [
            { createdAt: { lt: new Date(createdAt) } },
            { createdAt: new Date(createdAt), id: { lt: id } }
          ]}
        ];
      }
    }

    const orderBy = sortBy === 'hot' 
      ? [{ hotScore: 'desc' as const }, { id: 'desc' as const }]
      : [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

    // Lightning-fast query with aggregated fields
    const confessions = await prisma.confession.findMany({
      where,
      orderBy,
      take: limit + 1,
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        isAnonymous: true,
        hotScore: true,
        commentCount: true,
        replyCount: true,
        believeCount: true,
        doubtCount: true,
        savedCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { 
            id: true, 
            name: true, 
            image: true, 
            university: true 
          },
        },
        university: {
          select: { 
            id: true, 
            name: true 
          },
        },
        // Only fetch user's vote if userId is provided
        ...(userId && {
          votes: {
            where: { userId },
            select: { voteType: true },
            take: 1,
          },
        }),
      },
    });

    // Check if there are more items
    const hasMore = confessions.length > limit;
    const items = hasMore ? confessions.slice(0, limit) : confessions;

    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (sortBy === 'hot') {
        nextCursor = `${lastItem.hotScore}_${lastItem.id}`;
      } else {
        nextCursor = `${lastItem.createdAt.toISOString()}_${lastItem.id}`;
      }
    }

    // Process confessions with aggregated data
    const processedConfessions = items.map(confession => {
      const userVote = confession.votes?.[0]?.voteType || null;
      
      return {
        ...confession,
        believeCount: confession.believeCount,
        doubtCount: confession.doubtCount,
        commentCount: confession.commentCount,
        savedCount: confession.savedCount,
        userVote,
        votes: undefined, // Remove raw votes from response
      };
    });

    return {
      confessions: processedConfessions,
      nextCursor,
      hasMore,
    };
  } catch (error) {
    console.error('Error getting confessions (optimized):', error);
    throw error;
  }
}

// 🚀 ULTRA-FAST MongoDB Aggregation Pipeline for Confessions
export async function getConfessionsAggregated(options: {
  cursor?: string;
  limit?: number;
  universityId?: string;
  sortBy?: 'recent' | 'hot';
  search?: string;
  userId?: string;
}) {
  try {
    const { cursor, limit = 20, universityId, sortBy = 'recent', search, userId } = options;
    
    // Build match stage
    const matchStage: any = { isHidden: false };
    
    if (universityId) {
      matchStage.universityId = universityId;
    }
    
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'User',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $lookup: {
          from: 'University',
          localField: 'universityId',
          foreignField: '_id',
          as: 'university'
        }
      }
    ];
    
    // Add user vote lookup if userId provided
    if (userId) {
      pipeline.push({
        $lookup: {
          from: 'confessionVote',
          let: { confessionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$confessionId', '$$confessionId'] },
                    { $eq: ['$userId', userId] }
                  ]
                }
              }
            },
            { $limit: 1 },
            { $project: { voteType: 1 } }
          ],
          as: 'userVote'
        }
      });
    }
    
    // Add sorting
    const sortStage = sortBy === 'hot' 
      ? { hotScore: -1, _id: -1 }
      : { createdAt: -1, _id: -1 };
    
    pipeline.push({ $sort: sortStage });
    pipeline.push({ $limit: limit + 1 });
    
    // Add projection stage
    pipeline.push({
      $project: {
        id: '$_id',
        title: 1,
        content: 1,
        authorId: 1,
        isAnonymous: 1,
        hotScore: 1,
        commentCount: 1,
        replyCount: 1,
        believeCount: 1,
        doubtCount: 1,
        savedCount: 1,
        createdAt: 1,
        updatedAt: 1,
        author: {
          $arrayElemAt: ['$author', 0]
        },
        university: {
          $arrayElemAt: ['$university', 0]
        },
        userVote: {
          $ifNull: [
            { $arrayElemAt: ['$userVote.voteType', 0] },
            null
          ]
        }
      }
    });
    
    // Execute aggregation
    const result = await prisma.$runCommandRaw({
      aggregate: 'confession',
      pipeline,
      cursor: { batchSize: 1000 }
    });
    
    // Extract results
    const confessions = (result as any).cursor?.firstBatch || [];
    
    // Check if there are more items
    const hasMore = confessions.length > limit;
    const items = hasMore ? confessions.slice(0, limit) : confessions;
    
    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (sortBy === 'hot') {
        nextCursor = lastItem.hotScore + '_' + lastItem.id;
      } else {
        nextCursor = lastItem.createdAt.toISOString() + '_' + lastItem.id;
      }
    }
    
    // Transform results to match expected format
    const processedConfessions = items.map((confession: any) => ({
      id: confession.id,
      title: confession.title,
      content: confession.content,
      authorId: confession.authorId,
      isAnonymous: confession.isAnonymous,
      hotScore: confession.hotScore,
      commentCount: confession.commentCount,
      replyCount: confession.replyCount,
      believeCount: confession.believeCount,
      doubtCount: confession.doubtCount,
      savedCount: confession.savedCount,
      createdAt: confession.createdAt,
      updatedAt: confession.updatedAt,
      author: confession.author ? {
        id: confession.author._id,
        name: confession.author.name,
        image: confession.author.image,
        university: confession.author.university
      } : null,
      university: confession.university ? {
        id: confession.university._id,
        name: confession.university.name
      } : null,
      userVote: confession.userVote
    }));
    
    return {
      confessions: processedConfessions,
      nextCursor,
      hasMore,
    };
    
  } catch (error) {
    console.error('Error in aggregation pipeline:', error);
    // Fallback to regular query if aggregation fails
    console.log('Falling back to regular query...');
    return getConfessionsInfiniteOptimized(options);
  }
}

// 🚀 ULTRA-FAST Aggregated Saved Confessions
export async function getSavedConfessionsAggregated(userId: string) {
  try {
    const pipeline = [
      {
        $match: { userId }
      },
      {
        $lookup: {
          from: 'confession',
          localField: 'confessionId',
          foreignField: '_id',
          as: 'confession'
        }
      },
      {
        $unwind: '$confession'
      },
      {
        $match: { 'confession.isHidden': false }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'confession.authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $lookup: {
          from: 'University',
          localField: 'confession.universityId',
          foreignField: '_id',
          as: 'university'
        }
      },
      {
        $lookup: {
          from: 'confessionVote',
          let: { confessionId: '$confession._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$confessionId', '$$confessionId'] },
                    { $eq: ['$userId', userId] }
                  ]
                }
              }
            },
            { $limit: 1 },
            { $project: { voteType: 1 } }
          ],
          as: 'userVote'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          id: '$confession._id',
          title: '$confession.title',
          content: '$confession.content',
          authorId: '$confession.authorId',
          isAnonymous: '$confession.isAnonymous',
          hotScore: '$confession.hotScore',
          commentCount: '$confession.commentCount',
          replyCount: '$confession.replyCount',
          believeCount: '$confession.believeCount',
          doubtCount: '$confession.doubtCount',
          savedCount: '$confession.savedCount',
          createdAt: '$confession.createdAt',
          updatedAt: '$confession.updatedAt',
          author: {
            $arrayElemAt: ['$author', 0]
          },
          university: {
            $arrayElemAt: ['$university', 0]
          },
          userVote: {
            $ifNull: [
              { $arrayElemAt: ['$userVote.voteType', 0] },
              null
            ]
          }
        }
      }
    ];
    
    const result = await prisma.$runCommandRaw({
      aggregate: 'savedConfession',
      pipeline,
      cursor: { batchSize: 1000 }
    });
    
    const savedConfessions = (result as any).cursor?.firstBatch || [];
    
    return savedConfessions.map((confession: any) => ({
      id: confession.id,
      title: confession.title,
      content: confession.content,
      authorId: confession.authorId,
      isAnonymous: confession.isAnonymous,
      hotScore: confession.hotScore,
      commentCount: confession.commentCount,
      replyCount: confession.replyCount,
      believeCount: confession.believeCount,
      doubtCount: confession.doubtCount,
      savedCount: confession.savedCount,
      createdAt: confession.createdAt,
      updatedAt: confession.updatedAt,
      author: confession.author ? {
        id: confession.author._id,
        name: confession.author.name,
        image: confession.author.image,
        university: confession.author.university
      } : null,
      university: confession.university ? {
        id: confession.university._id,
        name: confession.university.name
      } : null,
      userVote: confession.userVote
    }));
    
  } catch (error) {
    console.error('Error in saved confessions aggregation:', error);
    // Fallback to regular query
    console.log('Falling back to regular saved confessions query...');
    return getSavedConfessions(userId);
  }
}

// �� ULTRA-FAST MongoDB Aggregation Pipeline for Comments
export async function getConfessionCommentsAggregated(confessionId: string) {
  try {
    const pipeline = [
      {
        $match: { confessionId: confessionId }
      },
      {
        $lookup: {
          from: 'User', // Fixed: uppercase
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $addFields: {
          author: {
            $arrayElemAt: ['$author', 0]
          }
        }
      },
      {
        $sort: {
          parentId: 1, // Top-level comments first (null parentId)
          createdAt: -1 // Then by creation time
        }
      },
      {
        $project: {
          id: '$_id',
          content: 1,
          authorId: 1,
          confessionId: 1,
          parentId: 1,
          isAnonymous: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            id: '$author._id',
            name: '$author.name',
            image: '$author.image'
          }
        }
      }
    ];

    const result = await prisma.$runCommandRaw({
      aggregate: 'ConfessionComment',
      pipeline,
      cursor: { batchSize: 1000 }
    });

    const allComments = (result as any).cursor?.firstBatch || [];

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter((comment: any) => !comment.parentId);
    const replies = allComments.filter((comment: any) => comment.parentId);

    // Create a map of replies by parent ID for O(1) lookup
    const repliesMap = new Map();
    replies.forEach((reply: any) => {
      if (!repliesMap.has(reply.parentId)) {
        repliesMap.set(reply.parentId, []);
      }
      repliesMap.get(reply.parentId).push(reply);
    });

    // Attach replies to their parent comments
    const commentsWithReplies = topLevelComments.map((comment: any) => ({
      ...comment,
      replies: repliesMap.get(comment.id) || [],
    }));

    return commentsWithReplies;

  } catch (error) {
    console.error('Error in comments aggregation pipeline:', error);
    // Fallback to regular query if aggregation fails
    console.log('Falling back to regular comments query...');
    return getConfessionCommentsOptimized(confessionId);
  }
}