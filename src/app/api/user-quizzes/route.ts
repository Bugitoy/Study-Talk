import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userQuizzes = await prisma.userQuiz.findMany({
      where: { userId },
      include: {
        questions: true,
      },
      orderBy: { updatedAt: 'desc' },
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

    return NextResponse.json(transformedQuizzes);
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch user quizzes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, description, questions } = await req.json();

    if (!userId || !title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the quiz with questions
    const quiz = await prisma.userQuiz.create({
      data: {
        userId,
        title,
        description,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correct: q.correct,
          })),
        },
      },
      include: {
        questions: true,
      },
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
    return NextResponse.json({ error: 'Failed to create user quiz' }, { status: 500 });
  }
} 