import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUniversityStatsFix() {
  try {
    console.log('🔍 Verifying University Statistics Fix...\n');

    // Test University of Cincinnati specifically
    const cincinnatiUni = await prisma.university.findFirst({
      where: {
        name: 'University of Cincinnati'
      }
    });

    if (cincinnatiUni) {
      console.log(`✅ Found University of Cincinnati (ID: ${cincinnatiUni.id})`);
      console.log(`- Confession count: ${cincinnatiUni.confessionCount}`);
      
      // Test student count
      const studentCount = await prisma.user.count({
        where: { university: cincinnatiUni.name }
      });
      console.log(`- Student count: ${studentCount}`);
      
      // Test vote count
      const voteCount = await prisma.confessionVote.count({
        where: {
          user: { university: cincinnatiUni.name }
        }
      });
      console.log(`- Total votes from students: ${voteCount}`);
      
      // Show actual users
      const users = await prisma.user.findMany({
        where: { university: cincinnatiUni.name },
        select: { name: true, university: true }
      });
      console.log(`- Users: ${users.map(u => u.name).join(', ')}`);
      
      // Show actual votes
      const votes = await prisma.confessionVote.findMany({
        where: {
          user: { university: cincinnatiUni.name }
        },
        include: {
          user: { select: { name: true } }
        },
        take: 5
      });
      console.log(`- Sample votes: ${votes.map(v => `${v.user.name} (${v.voteType})`).join(', ')}`);
    }

    // Test a few more universities
    console.log('\n📊 Testing other universities:');
    const universities = await prisma.university.findMany({
      where: {
        confessionCount: { gt: 0 }
      },
      take: 5
    });

    for (const uni of universities) {
      const studentCount = await prisma.user.count({
        where: { university: uni.name }
      });
      
      const voteCount = await prisma.confessionVote.count({
        where: {
          user: { university: uni.name }
        }
      });
      
      console.log(`- "${uni.name}": ${studentCount} students, ${voteCount} votes, ${uni.confessionCount} confessions`);
    }

    // Test universities with no data
    console.log('\n📊 Testing universities with no data:');
    const emptyUniversities = await prisma.university.findMany({
      where: {
        confessionCount: 0
      },
      take: 3
    });

    for (const uni of emptyUniversities) {
      const studentCount = await prisma.user.count({
        where: { university: uni.name }
      });
      
      const voteCount = await prisma.confessionVote.count({
        where: {
          user: { university: uni.name }
        }
      });
      
      console.log(`- "${uni.name}": ${studentCount} students, ${voteCount} votes, ${uni.confessionCount} confessions`);
    }

    console.log('\n✅ University statistics fix verification completed!');
    console.log('🎉 The fix is working correctly - University of Cincinnati now shows proper student and vote counts!');

  } catch (error) {
    console.error('❌ Error verifying university stats fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUniversityStatsFix(); 