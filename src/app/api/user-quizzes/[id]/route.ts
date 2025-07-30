import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { validateQuizData, sanitizeInput, logSecurityEvent } from '@/lib/security-utils';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 30,
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Rate limiting
    if (checkRateLimit(userId)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, { endpoint: 'GET_QUIZ', quizId: id });
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const quiz = await prisma.userQuiz.findFirst({
      where: { 
        id,
        userId // Ensure the quiz belongs to the user
      },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      logSecurityEvent('QUIZ_NOT_FOUND', userId, { quizId: id });
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user quiz:', error);
    logSecurityEvent('QUIZ_FETCH_ERROR', 'unknown', { 
      quizId: (await params).id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({ error: 'Failed to fetch user quiz' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, title, description, questions } = await req.json();

    // Basic validation
    if (!userId || !title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Rate limiting
    if (checkRateLimit(userId)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, { endpoint: 'PUT_QUIZ', quizId: id });
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Server-side validation
    const validation = validateQuizData({ title, description, questions });
    if (!validation.isValid) {
      logSecurityEvent('VALIDATION_FAILED', userId, { quizId: id, errors: validation.errors });
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }

    // First, verify the quiz belongs to the user
    const existingQuiz = await prisma.userQuiz.findFirst({
      where: { 
        id,
        userId
      },
    });

    if (!existingQuiz) {
      logSecurityEvent('UNAUTHORIZED_QUIZ_UPDATE', userId, { quizId: id });
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
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

    // Delete existing questions and recreate them
    await prisma.userQuizQuestion.deleteMany({
      where: { quizId: id },
    });

    // Update the quiz with sanitized data
    const quiz = await prisma.userQuiz.update({
      where: { id },
      data: {
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

    // Log successful update
    logSecurityEvent('QUIZ_UPDATED', userId, { 
      quizId: id, 
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
    console.error('Error updating user quiz:', error);
    logSecurityEvent('QUIZ_UPDATE_ERROR', 'unknown', { 
      quizId: (await params).id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({ error: 'Failed to update user quiz' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Rate limiting
    if (checkRateLimit(userId)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, { endpoint: 'DELETE_QUIZ', quizId: id });
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // First, verify the quiz belongs to the user
    const existingQuiz = await prisma.userQuiz.findFirst({
      where: { 
        id,
        userId
      },
    });

    if (!existingQuiz) {
      logSecurityEvent('UNAUTHORIZED_QUIZ_DELETE', userId, { quizId: id });
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    // Delete the quiz (questions will be deleted automatically due to cascade)
    await prisma.userQuiz.delete({
      where: { id },
    });

    // Log successful deletion
    logSecurityEvent('QUIZ_DELETED', userId, { 
      quizId: id,
      quizTitle: existingQuiz.title
    });

    return NextResponse.json({ 
      message: 'Quiz deleted successfully',
      deletedQuizId: id 
    });
  } catch (error) {
    console.error('Error deleting user quiz:', error);
    logSecurityEvent('QUIZ_DELETE_ERROR', 'unknown', { 
      quizId: (await params).id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json({ error: 'Failed to delete user quiz' }, { status: 500 });
  }
} 