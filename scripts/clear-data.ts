import prisma from '../src/db/prisma';

async function clearQuizData() {
  try {
    // Delete in order of dependencies (child tables first, then parent tables)
    
    // 1. Delete child records that reference other tables
    await prisma.quizAnswer.deleteMany();
    await prisma.confessionComment.deleteMany();
    await prisma.confessionVote.deleteMany();
    await prisma.savedConfession.deleteMany();
    await prisma.userReport.deleteMany();
    await prisma.callParticipant.deleteMany();
    
    // 2. Delete parent records
    await prisma.quizQuestion.deleteMany();
    await prisma.quizSession.deleteMany();
    await prisma.quizRoom.deleteMany();
    await prisma.confession.deleteMany();
    await prisma.report.deleteMany();
    await prisma.callSession.deleteMany();
    await prisma.competeRoom.deleteMany();
    await prisma.studyGroupRoom.deleteMany();
    await prisma.studySession.deleteMany();
    await prisma.roomBan.deleteMany();
    await prisma.roomSetting.deleteMany();
    await prisma.subscription.deleteMany();
    
    console.log('✅ Successfully cleared all data collections in correct order.');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearQuizData();
