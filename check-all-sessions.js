const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllSessions() {
  try {
    console.log('=== ALL STUDY SESSIONS IN DATABASE ===');
    
    const allSessions = await prisma.studySession.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`Total sessions found: ${allSessions.length}`);
    
    if (allSessions.length === 0) {
      console.log('❌ No study sessions found in database');
      console.log('This means sessions are not being created when calls start');
      return;
    }
    
    allSessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session ID: ${session.id}`);
      console.log(`   User ID: ${session.userId}`);
      console.log(`   Call ID: ${session.callId}`);
      console.log(`   Joined At: ${session.joinedAt}`);
      console.log(`   Left At: ${session.leftAt || 'Still active'}`);
      console.log(`   Duration: ${session.duration || 'Not set'} minutes`);
      console.log(`   Created: ${session.createdAt}`);
    });
    
    // Check for active sessions (leftAt is null)
    const activeSessions = allSessions.filter(s => s.leftAt === null);
    console.log(`\nActive sessions: ${activeSessions.length}`);
    
    if (activeSessions.length > 0) {
      console.log('Active sessions:');
      activeSessions.forEach((session, index) => {
        console.log(`  ${index + 1}. Call ID: ${session.callId}, User: ${session.userId}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllSessions(); 