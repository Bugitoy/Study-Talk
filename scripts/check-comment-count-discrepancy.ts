const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCommentCountDiscrepancy() {
  try {
    console.log('🔍 Checking comment count discrepancy...');
    
    // Get a confession with comments
    const confessionWithComments = await prisma.confession.findFirst({
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

    if (!confessionWithComments) {
      console.log('❌ No confessions with comments found for testing');
      return;
    }

    console.log(`📝 Confession: ${confessionWithComments.title}`);
    console.log(`🔑 Confession ID: ${confessionWithComments.id}`);
    console.log(`📊 commentCount field: ${confessionWithComments.commentCount}`);
    console.log(`📊 _count.comments: ${confessionWithComments._count.comments}`);

    // Get actual comments
    const actualComments = await prisma.confessionComment.findMany({
      where: { confessionId: confessionWithComments.id },
      select: {
        id: true,
        content: true,
        parentId: true,
        createdAt: true
      }
    });

    console.log(`📋 Actual comments in database: ${actualComments.length}`);
    
    // Separate top-level comments and replies
    const topLevelComments = actualComments.filter((comment: any) => !comment.parentId);
    const replies = actualComments.filter((comment: any) => comment.parentId);

    console.log(`📝 Top-level comments: ${topLevelComments.length}`);
    console.log(`💬 Replies: ${replies.length}`);
    console.log(`📊 Total comments (top-level + replies): ${topLevelComments.length + replies.length}`);

    // Show comment details
    actualComments.forEach((comment: any, index: number) => {
      console.log(`\nComment ${index + 1}:`);
      console.log(`  ID: ${comment.id}`);
      console.log(`  Content: ${comment.content.substring(0, 50)}...`);
      console.log(`  ParentId: ${comment.parentId ? comment.parentId : 'null (top-level)'}`);
      console.log(`  CreatedAt: ${comment.createdAt}`);
    });

    // Check if commentCount should include replies
    console.log('\n🔍 Analysis:');
    console.log(`• commentCount field: ${confessionWithComments.commentCount}`);
    console.log(`• _count.comments: ${confessionWithComments._count.comments}`);
    console.log(`• Actual total comments: ${actualComments.length}`);
    console.log(`• Top-level comments only: ${topLevelComments.length}`);

    // Determine what the commentCount should be
    const expectedCommentCount = actualComments.length; // Include all comments (top-level + replies)
    
    if (confessionWithComments.commentCount !== expectedCommentCount) {
      console.log(`\n❌ DISCREPANCY FOUND!`);
      console.log(`• Expected commentCount: ${expectedCommentCount}`);
      console.log(`• Actual commentCount: ${confessionWithComments.commentCount}`);
      console.log(`• Difference: ${expectedCommentCount - confessionWithComments.commentCount}`);
    } else {
      console.log(`\n✅ Comment count is correct!`);
    }

  } catch (error) {
    console.error('❌ Error checking comment count discrepancy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCommentCountDiscrepancy(); 