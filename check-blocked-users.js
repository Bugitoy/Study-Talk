const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBlockedUsers() {
  try {
    console.log('Checking for blocked users...');
    
    const blockedUsers = await prisma.user.findMany({
      where: { isBlocked: true },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        isBlocked: true 
      }
    });
    
    console.log('Blocked users:', blockedUsers);
    
    if (blockedUsers.length === 0) {
      console.log('No blocked users found in database');
    } else {
      console.log(`Found ${blockedUsers.length} blocked user(s):`);
      blockedUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking blocked users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlockedUsers(); 