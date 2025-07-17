const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBan() {
  try {
    const userId = 'kp_c7ea3bdaec3c43849d7a63b6c069108f';
    const callId = '0ef58355-f559-483e-974f-c7dd7502a45c'; // Current room from logs
    
    console.log('Testing ban for user:', userId, 'in call:', callId);
    
    // Check if user is banned from this specific room
    const roomBan = await prisma.roomBan.findUnique({
      where: {
        userId_callId: {
          userId,
          callId
        }
      }
    });
    
    console.log('Room ban check result:', roomBan ? 'BANNED' : 'NOT BANNED');
    
    if (roomBan) {
      console.log('Ban details:', {
        id: roomBan.id,
        userId: roomBan.userId,
        callId: roomBan.callId,
        hostId: roomBan.hostId,
        reason: roomBan.reason,
        bannedAt: roomBan.bannedAt
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBan(); 