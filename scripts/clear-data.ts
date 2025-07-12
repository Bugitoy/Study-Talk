import prisma from '../src/db/prisma';

async function clearQuizData() {
  try {
    await prisma.quizAnswer.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.quizRoom.deleteMany();
    console.log('Cleared QuizAnswer, QuizQuestion, and QuizRoom collections.');
  } catch (error) {
    console.error('Error clearing quiz data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearQuizData();
