const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBans() {
  try {
    console.log('Checking room bans...');
    const roomBans = await prisma.roomBan.findMany();
    console.log('Room bans found:', roomBans.length);
    console.log('Room bans:', JSON.stringify(roomBans, null, 2));
    
    console.log('\nChecking blocked users...');
    const blockedUsers = await prisma.user.findMany({
      where: { isBlocked: true }
    });
    console.log('Blocked users found:', blockedUsers.length);
    console.log('Blocked users:', JSON.stringify(blockedUsers.map(u => ({ id: u.id, name: u.name, email: u.email })), null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBans(); 