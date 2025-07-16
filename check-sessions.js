const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudySessions() {
  try {
    console.log('=== STUDY SESSIONS IN DATABASE ===');
    
    const sessions = await prisma.studySession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10, // Show last 10 sessions
    });
    
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session ID: ${session.id}`);
      console.log(`   User ID: ${session.userId}`);
      console.log(`   Call ID: ${session.callId}`);
      console.log(`   Joined At: ${session.joinedAt}`);
      console.log(`   Left At: ${session.leftAt || 'Still active'}`);
      console.log(`   Duration: ${session.duration || 'Not set'} minutes`);
      console.log(`   Date: ${session.date}`);
    });
    
    // Check for sessions with duration
    const sessionsWithDuration = await prisma.studySession.findMany({
      where: { duration: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`\n=== SESSIONS WITH DURATION ===`);
    console.log(`Found ${sessionsWithDuration.length} sessions with duration:`);
    sessionsWithDuration.forEach((session, index) => {
      console.log(`\n${index + 1}. Duration: ${session.duration} minutes`);
      console.log(`   Call ID: ${session.callId}`);
      console.log(`   User ID: ${session.userId}`);
      console.log(`   Joined: ${session.joinedAt}`);
      console.log(`   Left: ${session.leftAt}`);
    });
    
  } catch (error) {
    console.error('Error checking sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudySessions(); 