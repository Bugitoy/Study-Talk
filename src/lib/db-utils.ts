import prisma from "@/db/prisma";
import { Language } from "@prisma/client";

export type DatabaseWord = {
  id: string;
  word: string;
  language: Language;
  translation: string;
  definition: string;
  pronunciation?: string | null;
  audioUrl?: string | null;
  partOfSpeech: string;
  examples: string[];
  isStarred?: boolean;
};

// Get words by language
export async function getWordsByLanguage(language: Language, limit = 20, userId?: string) {
  try {
    const words = await prisma.word.findMany({
      where: { language },
      take: limit,
      orderBy: { word: "asc" },
      include: userId
        ? {
            StarredWords: {
              where: { userId },
            },
          }
        : undefined,
    });

    return words.map((word) => ({
      ...word,
      isStarred: userId ? (word as any).StarredWords?.length > 0 : false,
      StarredWords: undefined, // Remove this from the response
    }));
  } catch (error) {
    console.error("Error fetching words by language:", error);
    return [];
  }
}

// Search words
export async function searchWords(
  query: string,
  language: Language,
  limit = 20,
  userId?: string,
) {
  try {
    const words = await prisma.word.findMany({
      where: {
        language,
        OR: [
          { word: { contains: query, mode: "insensitive" } },
          { translation: { contains: query, mode: "insensitive" } },
          { definition: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { word: "asc" },
      include: userId
        ? {
            StarredWords: {
              where: { userId },
            },
          }
        : undefined,
    });

    return words.map((word) => ({
      ...word,
      isStarred: userId ? (word as any).StarredWords?.length > 0 : false,
      StarredWords: undefined, // Remove this from the response
    }));
  } catch (error) {
    console.error("Error searching words:", error);
    return [];
  }
}

// Get words by first letter
export async function getWordsByLetter(
  letter: string,
  language: Language,
  limit = 20,
  userId?: string,
) {
  try {
    const words = await prisma.word.findMany({
      where: {
        language,
        word: { startsWith: letter, mode: "insensitive" },
      },
      take: limit,
      orderBy: { word: "asc" },
      include: userId
        ? {
            StarredWords: {
              where: { userId },
            },
          }
        : undefined,
    });

    return words.map((word) => ({
      ...word,
      isStarred: userId ? (word as any).StarredWords?.length > 0 : false,
      StarredWords: undefined, // Remove this from the response
    }));
  } catch (error) {
    console.error("Error fetching words by letter:", error);
    return [];
  }
}

// Get starred words for a user
export async function getStarredWords(userId: string) {
  try {
    const starredWords = await prisma.starredWord.findMany({
      where: { userId },
      include: { Word: true },
      orderBy: { Word: { word: "asc" } },
    });

    return starredWords.map((starred) => ({
      ...starred.Word,
      isStarred: true,
    }));
  } catch (error) {
    console.error("Error fetching starred words:", error);
    return [];
  }
}

// Toggle starred word for a user
export async function toggleStarredWord(userId: string, wordId: string) {
  try {
    const existing = await prisma.starredWord.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    if (existing) {
      // Remove star
      await prisma.starredWord.delete({
        where: { userId_wordId: { userId, wordId } },
      });
      return false;
    } else {
      // Add star
      await prisma.starredWord.create({
        data: { userId, wordId },
      });
      return true;
    }
  } catch (error) {
    console.error("Error toggling starred word:", error);
    throw error;
  }
}

// Get a single word by ID
export async function getWordById(id: string, userId?: string) {
  try {
    const word = await prisma.word.findUnique({
      where: { id },
      include: userId
        ? {
            StarredWords: {
              where: { userId },
            },
          }
        : undefined,
    });

    if (!word) return null;

    return {
      ...word,
      isStarred: userId ? (word as any).StarredWords?.length > 0 : false,
      StarredWords: undefined, // Remove this from the response
    };
  } catch (error) {
    console.error("Error fetching word by ID:", error);
    return null;
  }
}

// Seed database with mock data (for development)
export async function seedDatabase() {
  try {
    const existingWords = await prisma.word.count();
    if (existingWords > 0) {
      console.log("Database already has words, skipping seed.");
      return;
    }

    const mockWords = [
      {
        word: "Amazing",
        language: Language.en,
        translation: "Makatsa",
        definition: "Describes something that is spectacular",
        pronunciation: "/əˈmeɪzɪŋ/",
        partOfSpeech: "adjective",
        examples: [
          "Her eyes were amazing and beautiful in every sense of the word",
        ],
      },
      {
        word: "Apple",
        language: Language.en,
        translation: "Apole",
        definition: "A type of fruit",
        pronunciation: "/ˈæpəl/",
        partOfSpeech: "noun",
        examples: [
          "I ate an apple for breakfast",
          "The apple tree is blooming",
        ],
      },
      {
        word: "Makatsa",
        language: Language.tn,
        translation: "Amazing",
        definition: "Go bontsha selo se se gakgamatsang",
        pronunciation: "/ma-ka-tsa/",
        partOfSpeech: "lesupi",
        examples: ["Matlho a gagwe a ne a makatsa e bile a bontle"],
      },
      // Add more words as needed
    ];

    await prisma.word.createMany({
      data: mockWords,
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

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
    await prisma.studyGroupRoom.updateMany({ where: { callId }, data: { ended: true } });
  } catch (error) {
    console.error('Error ending study group room:', error);
  }
}

// Study Session functions
export async function startStudySession(userId: string, callId: string) {
  try {
    // Check if user already has an active session for this call
    const existingSession = await prisma.studySession.findFirst({
      where: { userId, callId, leftAt: null },
    });
    
    if (existingSession) {
      return existingSession;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await prisma.studySession.create({
      data: {
        userId,
        callId,
        date: today,
      },
    });
  } catch (error) {
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