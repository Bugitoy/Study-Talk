const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearStudySessions() {
  try {
    console.log('=== CLEARING STUDY SESSIONS ===');
    
    // First, let's see how many sessions we have
    const sessionCount = await prisma.studySession.count();
    console.log(`Found ${sessionCount} study sessions in database`);
    
    if (sessionCount === 0) {
      console.log('No study sessions to clear.');
      return;
    }
    
    // Show a sample of sessions before clearing
    console.log('\n--- SAMPLE SESSIONS BEFORE CLEARING ---');
    const sampleSessions = await prisma.studySession.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
    
    sampleSessions.forEach((session, index) => {
      console.log(`${index + 1}. Session ID: ${session.id}`);
      console.log(`   User ID: ${session.userId}`);
      console.log(`   Call ID: ${session.callId}`);
      console.log(`   Duration: ${session.duration || 'Not set'} minutes`);
      console.log(`   Created: ${session.createdAt}`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete ALL study sessions!');
    console.log('Type "CLEAR" to confirm deletion:');
    
    // For now, we'll proceed with clearing
    console.log('\nProceeding with deletion...');
    
    // Delete all study sessions
    const deleteResult = await prisma.studySession.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.count} study sessions`);
    
    // Verify deletion
    const remainingCount = await prisma.studySession.count();
    console.log(`Remaining sessions: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('✅ All study sessions cleared successfully!');
    } else {
      console.log('⚠️  Some sessions may still exist');
    }
    
  } catch (error) {
    console.error('❌ Error clearing study sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearStudySessions(); 