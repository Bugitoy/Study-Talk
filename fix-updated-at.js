const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUpdatedAt() {
  try {
    console.log('Fixing null updatedAt values using raw MongoDB queries...');
    
    // Use raw MongoDB queries to find and update records with null updatedAt
    const now = new Date();
    
    // Fix StudySession records
    const studySessionResult = await prisma.$runCommandRaw({
      update: "StudySession",
      updates: [{
        q: { updatedAt: null },
        u: { $set: { updatedAt: now } },
        multi: true
      }]
    });
    
    console.log(`Updated StudySession records:`, studySessionResult);
    
    // Fix User records
    const userResult = await prisma.$runCommandRaw({
      update: "User",
      updates: [{
        q: { updatedAt: null },
        u: { $set: { updatedAt: now } },
        multi: true
      }]
    });
    
    console.log(`Updated User records:`, userResult);
    
    // Fix Confession records
    const confessionResult = await prisma.$runCommandRaw({
      update: "Confession",
      updates: [{
        q: { updatedAt: null },
        u: { $set: { updatedAt: now } },
        multi: true
      }]
    });
    
    console.log(`Updated Confession records:`, confessionResult);
    
    // Fix ConfessionComment records
    const commentResult = await prisma.$runCommandRaw({
      update: "ConfessionComment",
      updates: [{
        q: { updatedAt: null },
        u: { $set: { updatedAt: now } },
        multi: true
      }]
    });
    
    console.log(`Updated ConfessionComment records:`, commentResult);
    
    // Fix Report records
    const reportResult = await prisma.$runCommandRaw({
      update: "Report",
      updates: [{
        q: { updatedAt: null },
        u: { $set: { updatedAt: now } },
        multi: true
      }]
    });
    
    console.log(`Updated Report records:`, reportResult);
    
    // Fix UserReport records
    const userReportResult = await prisma.$runCommandRaw({
      update: "UserReport",
      updates: [{
        q: { updatedAt: null },
        u: { $set: { updatedAt: now } },
        multi: true
      }]
    });
    
    console.log(`Updated UserReport records:`, userReportResult);
    
    // Fix RoomBan records
    const roomBanResult = await prisma.$runCommandRaw({
      update: "RoomBan",
      updates: [{
        q: { updatedAt: null },
        u: { $set: { updatedAt: now } },
        multi: true
      }]
    });
    
    console.log(`Updated RoomBan records:`, roomBanResult);
    
    console.log('✅ All null updatedAt values have been fixed!');
    
  } catch (error) {
    console.error('Error fixing updatedAt values:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUpdatedAt(); 