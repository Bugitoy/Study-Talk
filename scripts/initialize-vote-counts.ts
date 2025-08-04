const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeVoteCounts() {
  console.log('🔧 Initializing vote counts for all confessions...');
  
  try {
    // Get all confessions
    const confessions = await prisma.confession.findMany({
      select: {
        id: true,
        title: true,
      }
    });

    console.log(`📊 Found ${confessions.length} confessions to update`);

    // Update each confession with its current vote counts
    let updatedCount = 0;
    for (const confession of confessions) {
      // Count BELIEVE votes
      const believeCount = await prisma.confessionVote.count({
        where: {
          confessionId: confession.id,
          voteType: 'BELIEVE'
        }
      });

      // Count DOUBT votes
      const doubtCount = await prisma.confessionVote.count({
        where: {
          confessionId: confession.id,
          voteType: 'DOUBT'
        }
      });

      // Count saved confessions
      const savedCount = await prisma.savedConfession.count({
        where: {
          confessionId: confession.id
        }
      });

      console.log(`📝 "${confession.title}": ${believeCount} believe, ${doubtCount} doubt, ${savedCount} saved`);

      await prisma.confession.update({
        where: { id: confession.id },
        data: { 
          believeCount,
          doubtCount,
          savedCount
        }
      });
      
      updatedCount++;
    }

    console.log(`✅ Successfully updated vote counts for ${updatedCount} confessions`);

    // Show final results
    const finalConfessions = await prisma.confession.findMany({
      select: {
        title: true,
        believeCount: true,
        doubtCount: true,
        savedCount: true
      },
      orderBy: [
        { believeCount: 'desc' },
        { doubtCount: 'desc' }
      ],
      take: 10
    });

    console.log('\n🏆 Final vote counts:');
    finalConfessions.forEach((confession: any, i: number) => {
      console.log(`${i + 1}. "${confession.title}": ${confession.believeCount} believe, ${confession.doubtCount} doubt, ${confession.savedCount} saved`);
    });

  } catch (error) {
    console.error('❌ Error initializing vote counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  initializeVoteCounts()
    .then(() => {
      console.log('✨ Vote count initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Vote count initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeVoteCounts; 