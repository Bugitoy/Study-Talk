import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeCommentCounts() {
  console.log('🔧 Initializing comment counts for all confessions...');
  
  try {
    // Get all confessions
    const confessions = await prisma.confession.findMany({
      select: {
        id: true,
        title: true,
      }
    });

    console.log(`📊 Found ${confessions.length} confessions to update`);

    // Update each confession with its current comment count
    let updatedCount = 0;
    for (const confession of confessions) {
      // Count top-level comments (parentId is null)
      const topLevelComments = await prisma.confessionComment.count({
        where: {
          confessionId: confession.id,
          parentId: null
        }
      });

      // Count replies (parentId is not null)
      const replies = await prisma.confessionComment.count({
        where: {
          confessionId: confession.id,
          parentId: {
            not: null
          }
        }
      });

      console.log(`📝 "${confession.title}": ${topLevelComments} comments, ${replies} replies`);

      await prisma.confession.update({
        where: { id: confession.id },
        data: { 
          commentCount: topLevelComments,
          replyCount: replies
        }
      });
      
      updatedCount++;
    }

    console.log(`✅ Successfully updated comment counts for ${updatedCount} confessions`);

    // Show final results
    const finalConfessions = await prisma.confession.findMany({
      select: {
        title: true,
        commentCount: true,
        replyCount: true
      },
      orderBy: [
        { commentCount: 'desc' },
        { replyCount: 'desc' }
      ],
      take: 10
    });

    console.log('\n🏆 Final comment counts:');
    finalConfessions.forEach((confession: any, i: number) => {
      console.log(`${i + 1}. "${confession.title}": ${confession.commentCount} comments, ${confession.replyCount} replies`);
    });

  } catch (error) {
    console.error('❌ Error initializing comment counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  initializeCommentCounts()
    .then(() => {
      console.log('✨ Comment count initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Comment count initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeCommentCounts; 