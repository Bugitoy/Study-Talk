import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { validateQuizData, sanitizeInput, logSecurityEvent } from '@/lib/security-utils';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 20,
  WINDOW_MS: 60000, // 1 minute
};

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS });
    return false;
  }
  
  if (userLimit.count >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    return true;
  }
  
  userLimit.count++;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Rate limiting
    if (checkRateLimit(userId)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, { endpoint: 'GET_QUIZZES' });
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Get total count for pagination
    const totalCount = await prisma.userQuiz.count({
      where: { userId },
    });

    // Fetch quizzes with pagination
    const userQuizzes = await prisma.userQuiz.findMany({
      where: { userId },
      include: {
        questions: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Transform the data to match the expected format
    const transformedQuizzes = userQuizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    }));

    const hasMore = offset + limit < totalCount;

    return NextResponse.json({
      quizzes: transformedQuizzes,
      hasMore,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch user quizzes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, description, questions } = await req.json();

    // Basic validation
    if (!userId || !title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Rate limiting
    if (checkRateLimit(userId)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, { endpoint: 'POST_QUIZ' });
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Check user's plan and quiz limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check quiz limit for free and plus users (premium users have unlimited)
    if (user.plan === 'free' || user.plan === 'plus') {
      const quizCount = await prisma.userQuiz.count({
        where: { userId }
      });

      const limit = user.plan === 'free' ? 3 : 50;
      
      if (quizCount >= limit) {
        logSecurityEvent('QUIZ_LIMIT_EXCEEDED', userId, { 
          currentCount: quizCount, 
          limit: limit,
          plan: user.plan 
        });
        return NextResponse.json({ 
          error: `Quiz limit exceeded. ${user.plan === 'free' ? 'Free' : 'Plus'} users can only create ${limit} quizzes. ${user.plan === 'free' ? 'Upgrade to Plus or Premium' : 'Upgrade to Premium'} to create more.` 
        }, { status: 403 });
      }
    }

    // Check question limit for free and plus users (premium users have unlimited)
    if (user.plan === 'free' || user.plan === 'plus') {
      const questionLimit = user.plan === 'free' ? 20 : 50;
      
      if (questions.length > questionLimit) {
        logSecurityEvent('QUESTION_LIMIT_EXCEEDED', userId, { 
          currentCount: questions.length, 
          limit: questionLimit,
          plan: user.plan 
        });
        return NextResponse.json({ 
          error: `Question limit exceeded. ${user.plan === 'free' ? 'Free' : 'Plus'} users can only create ${questionLimit} questions per quiz. ${user.plan === 'free' ? 'Upgrade to Plus or Premium' : 'Upgrade to Premium'} to create more questions.` 
        }, { status: 403 });
      }
    }

    // Server-side validation
    const validation = validateQuizData({ title, description, questions });
    if (!validation.isValid) {
      logSecurityEvent('VALIDATION_FAILED', userId, { errors: validation.errors });
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }

    // Sanitize all inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedQuestions = questions.map((q: any) => ({
      question: sanitizeInput(q.question),
      optionA: sanitizeInput(q.optionA),
      optionB: sanitizeInput(q.optionB),
      optionC: sanitizeInput(q.optionC),
      optionD: sanitizeInput(q.optionD),
      correct: sanitizeInput(q.correct),
    }));

    // Create the quiz with sanitized data
    const quiz = await prisma.userQuiz.create({
      data: {
        userId,
        title: sanitizedTitle,
        description: sanitizedDescription,
        questions: {
          create: sanitizedQuestions,
        },
      },
      include: {
        questions: true,
      },
    });

    // Log successful creation
    logSecurityEvent('QUIZ_CREATED', userId, { 
      quizId: quiz.id, 
      questionCount: questions.length 
    });

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating user quiz:', error);
    logSecurityEvent('QUIZ_CREATION_ERROR', 'unknown', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Failed to create user quiz' }, { status: 500 });
  }
} 