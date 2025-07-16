const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===');
    
    // Test 1: Check if we can connect
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Check if StudySession table exists
    console.log('\n2. Testing StudySession table...');
    const sessionCount = await prisma.studySession.count();
    console.log(`✅ StudySession table exists, current count: ${sessionCount}`);
    
    // Test 3: Try to create a test session
    console.log('\n3. Testing session creation...');
    const testSession = await prisma.studySession.create({
      data: {
        userId: 'test-user',
        callId: 'test-call-123',
        date: new Date(),
      },
    });
    console.log('✅ Test session created:', testSession.id);
    
    // Test 4: Clean up test session
    console.log('\n4. Cleaning up test session...');
    await prisma.studySession.delete({
      where: { id: testSession.id },
    });
    console.log('✅ Test session deleted');
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 