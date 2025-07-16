const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showDetailedSessions() {
  try {
    console.log('=== DETAILED STUDY SESSION ANALYSIS ===\n');
    
    const sessions = await prisma.studySession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5, // Show last 5 sessions
    });
    
    sessions.forEach((session, index) => {
      console.log(`\n--- SESSION ${index + 1} ---`);
      console.log(`Session ID: ${session.id}`);
      console.log(`User ID: ${session.userId}`);
      console.log(`Call ID: ${session.callId}`);
      console.log(`Joined At: ${session.joinedAt}`);
      console.log(`Left At: ${session.leftAt || 'Still active'}`);
      console.log(`Duration: ${session.duration || 'Not calculated'} minutes`);
      console.log(`Date: ${session.date}`);
      
      // Calculate manual duration if both timestamps exist
      if (session.joinedAt && session.leftAt) {
        const manualDuration = Math.floor(
          (new Date(session.leftAt).getTime() - new Date(session.joinedAt).getTime()) / (1000 * 60)
        );
        console.log(`Manual Calculation: ${manualDuration} minutes`);
        
        if (session.duration !== null) {
          console.log(`Database Duration: ${session.duration} minutes`);
          console.log(`Difference: ${Math.abs(manualDuration - session.duration)} minutes`);
        }
      }
    });
    
    // Show sessions with actual duration values
    console.log('\n=== SESSIONS WITH DURATION > 0 ===');
    const sessionsWithDuration = await prisma.studySession.findMany({
      where: { 
        duration: { 
          not: null,
          gt: 0 
        } 
      },
      orderBy: { createdAt: 'desc' },
    });
    
    sessionsWithDuration.forEach((session, index) => {
      console.log(`\n${index + 1}. Duration: ${session.duration} minutes`);
      console.log(`   Call ID: ${session.callId}`);
      console.log(`   Joined: ${session.joinedAt}`);
      console.log(`   Left: ${session.leftAt}`);
      console.log(`   Time in call: ${Math.floor(
        (new Date(session.leftAt).getTime() - new Date(session.joinedAt).getTime()) / (1000 * 60)
      )} minutes`);
    });
    
    console.log(`\nTotal sessions with duration > 0: ${sessionsWithDuration.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showDetailedSessions(); 