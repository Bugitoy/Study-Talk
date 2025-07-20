import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db/prisma';

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

    if (!userId || !title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First, verify the quiz belongs to the user
    const existingQuiz = await prisma.userQuiz.findFirst({
      where: { 
        id,
        userId
      },
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Delete existing questions and recreate them
    await prisma.userQuizQuestion.deleteMany({
      where: { quizId: id },
    });

    // Update the quiz with new questions
    const quiz = await prisma.userQuiz.update({
      where: { id },
      data: {
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
    console.error('Error updating user quiz:', error);
    return NextResponse.json({ error: 'Failed to update user quiz' }, { status: 500 });
  }
} 