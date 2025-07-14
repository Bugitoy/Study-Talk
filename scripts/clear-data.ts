import prisma from '../src/db/prisma';

async function clearQuizData() {
  try {
    await prisma.quizAnswer.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.quizSession.deleteMany();
    await prisma.quizRoom.deleteMany();
    await prisma.roomSetting.deleteMany();
    console.log('Cleared QuizAnswer, QuizQuestion, QuizRoom, QuizSession, and RoomSetting collections.');
  } catch (error) {
    console.error('Error clearing quiz data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearQuizData();
