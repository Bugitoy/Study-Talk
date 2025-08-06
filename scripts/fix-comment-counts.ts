import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCommentCounts() {
  try {
    console.log('🔧 Fixing comment count discrepancies...');
    
    // Get all confessions with comments
    const confessionsWithComments = await prisma.confession.findMany({
      where: {
        comments: {
          some: {}
        }
      },
      select: {
        id: true,
        title: true,
        commentCount: true,
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    console.log(`📋 Found ${confessionsWithComments.length} confessions with comments`);

    let fixedCount = 0;
    let totalDiscrepancies = 0;

    for (const confession of confessionsWithComments) {
      const actualCommentCount = confession._count.comments;
      const storedCommentCount = confession.commentCount;
      
      if (actualCommentCount !== storedCommentCount) {
        console.log(`\n🔧 Fixing confession: ${confession.title}`);
        console.log(`  • Current commentCount: ${storedCommentCount}`);
        console.log(`  • Actual comments: ${actualCommentCount}`);
        console.log(`  • Difference: ${actualCommentCount - storedCommentCount}`);
        
        // Update the commentCount field
        await prisma.confession.update({
          where: { id: confession.id },
          data: { commentCount: actualCommentCount }
        });
        
        console.log(`  ✅ Updated commentCount to ${actualCommentCount}`);
        fixedCount++;
        totalDiscrepancies += Math.abs(actualCommentCount - storedCommentCount);
      }
    }

    console.log(`\n🎉 Fix completed!`);
    console.log(`• Confessions fixed: ${fixedCount}`);
    console.log(`• Total discrepancies resolved: ${totalDiscrepancies}`);
    
    if (fixedCount === 0) {
      console.log(`✅ All comment counts are already correct!`);
    }

  } catch (error) {
    console.error('❌ Error fixing comment counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCommentCounts(); 