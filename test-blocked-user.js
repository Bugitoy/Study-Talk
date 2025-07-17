const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBlockedUser() {
  try {
    console.log('Testing blocked user functionality...');
    
    // Check if user is blocked
    const blockedUser = await prisma.user.findUnique({
      where: { id: 'kp_3b60ec2e712344f88a7710dd020bf7e1' },
      select: { id: true, name: true, email: true, isBlocked: true }
    });
    
    console.log('Blocked user status:', blockedUser);
    
    if (blockedUser?.isBlocked) {
      console.log('✅ User is blocked in database');
      console.log('Now try to join a call with this user and watch the webhook logs');
      console.log('The webhook should detect the blocked user and remove them from the call');
    } else {
      console.log('❌ User is not blocked');
    }
    
  } catch (error) {
    console.error('Error testing blocked user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBlockedUser(); 