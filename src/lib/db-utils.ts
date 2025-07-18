import prisma from "@/db/prisma";

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
    return await prisma.topicQuestion.findMany({ where: { topic } });
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
  allowReview: boolean;
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
    // If setting a callId, check for uniqueness at application level
    if (data.callId) {
      const existingWithCallId = await prisma.roomSetting.findFirst({
        where: { 
          callId: data.callId,
          id: { not: id } // Exclude the current record
        }
      });
      
      if (existingWithCallId) {
        throw new Error(`CallId ${data.callId} is already in use by another room setting`);
      }
    }
    
    return await prisma.roomSetting.update({ where: { id }, data });
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
    return await prisma.roomSetting.findFirst({ where: { callId } });
  } catch (error) {
    console.error("Error fetching room setting by callId:", error);
    return null;
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

export async function endStudyGroupRoom(callId: string) {
  try {
    console.log('endStudyGroupRoom called for callId:', callId);
    
    // Check if room exists and is not already ended
    const room = await prisma.studyGroupRoom.findFirst({
      where: { callId }
    });
    
    if (!room) {
      console.log('No study group room found for callId:', callId);
      return;
    }
    
    if (room.ended) {
      console.log('Room already ended for callId:', callId);
      return;
    }
    
    console.log('Ending room:', room.roomName, 'for callId:', callId);
    
    const result = await prisma.studyGroupRoom.updateMany({ 
      where: { callId }, 
      data: { ended: true } 
    });
    
    console.log('Room ended successfully. Updated count:', result.count);
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

export async function getLeaderboard(period: 'daily' | 'weekly' = 'weekly') {
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
    
    const leaderboard = users.map(user => ({
      userId: user.id,
      name: user.name || 'Anonymous',
      image: user.image,
      hours: Math.round((userStats.get(user.id) || 0) / 60 * 100) / 100,
    })).sort((a, b) => b.hours - a.hours);
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
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
    return await prisma.confession.create({
      data: {
        ...data,
        isAnonymous: data.isAnonymous ?? true,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, university: true },
        },
        university: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            savedBy: true,
          },
        },
      },
    });
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

export async function voteOnConfession(data: {
  userId: string;
  confessionId: string;
  voteType: 'BELIEVE' | 'DOUBT';
}) {
  try {
    // Upsert vote (update if exists, create if not)
    const vote = await prisma.confessionVote.upsert({
      where: {
        userId_confessionId: {
          userId: data.userId,
          confessionId: data.confessionId,
        },
      },
      update: {
        voteType: data.voteType,
      },
      create: data,
    });

    // Update confession hot score
    await updateConfessionHotScore(data.confessionId);

    return vote;
  } catch (error) {
    console.error('Error voting on confession:', error);
    throw error;
  }
}

export async function removeVoteOnConfession(data: {
  userId: string;
  confessionId: string;
}) {
  try {
    // Delete the vote if it exists
    const deletedVote = await prisma.confessionVote.deleteMany({
      where: {
        userId: data.userId,
        confessionId: data.confessionId,
      },
    });

    // Update confession hot score
    await updateConfessionHotScore(data.confessionId);

    return { success: true, deletedCount: deletedVote.count };
  } catch (error) {
    console.error('Error removing vote on confession:', error);
    throw error;
  }
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
  isAnonymous?: boolean;
  parentId?: string;
}) {
  try {
    const comment = await prisma.confessionComment.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map(item => {
      const confession = item.confession;
      const believeCount = confession.votes.filter(v => v.voteType === 'BELIEVE').length;
      const doubtCount = confession.votes.filter(v => v.voteType === 'DOUBT').length;
      
      return {
        ...confession,
        believeCount,
        doubtCount,
        commentCount: confession._count.comments,
        savedCount: confession._count.savedBy,
        votes: undefined,
        _count: undefined,
      };
    });
  } catch (error) {
    console.error('Error getting saved confessions:', error);
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
        const stats = await prisma.confession.aggregate({
          where: { universityId: uni.id },
          _sum: {
            viewCount: true,
          },
          _count: {
            authorId: true,
          },
        });

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
          totalViews: stats._sum.viewCount || 0,
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
    
    // Engagement score
    const engagementScore = totalVotes + (confession.comments.length * 2) + (confession.viewCount * 0.1);
    
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

export async function incrementConfessionView(confessionId: string) {
  try {
    await prisma.confession.update({
      where: { id: confessionId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
    
    // Update hot score after view increment
    await updateConfessionHotScore(confessionId);
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}