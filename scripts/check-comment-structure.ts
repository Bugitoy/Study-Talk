import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCommentStructure() {
  try {
    console.log('🔍 Checking comment structure in database...');
    
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

    console.log(`📝 Testing with confession: ${confessionWithComments.title}`);
    console.log(`📊 Comment count: ${confessionWithComments._count.comments}`);
    console.log(`🔑 Confession ID: ${confessionWithComments.id}`);
    console.log(`🔑 Confession ID type: ${typeof confessionWithComments.id}`);

    // Get actual comments using Prisma
    const comments = await prisma.confessionComment.findMany({
      where: { confessionId: confessionWithComments.id },
      take: 2
    });

    console.log(`\n📋 Found ${comments.length} comments via Prisma:`);
    comments.forEach((comment: any, index: number) => {
      console.log(`\nComment ${index + 1}:`);
      console.log(`  ID: ${comment.id} (type: ${typeof comment.id})`);
      console.log(`  ConfessionId: ${comment.confessionId} (type: ${typeof comment.confessionId})`);
      console.log(`  AuthorId: ${comment.authorId} (type: ${typeof comment.authorId})`);
      console.log(`  Content: ${comment.content.substring(0, 50)}...`);
      console.log(`  ParentId: ${comment.parentId} (type: ${typeof comment.parentId})`);
      console.log(`  CreatedAt: ${comment.createdAt}`);
    });

    // Test raw MongoDB query to see the actual data
    console.log('\n🧪 Testing raw MongoDB query...');
    const rawResult = await prisma.$runCommandRaw({
      find: 'ConfessionComment',
      filter: { confessionId: confessionWithComments.id },
      limit: 2
    });

    const rawComments = (rawResult as any).cursor?.firstBatch || [];
    console.log(`📋 Found ${rawComments.length} comments via raw MongoDB:`);
    
    if (rawComments.length > 0) {
      console.log('\nRaw comment structure:');
      console.log(JSON.stringify(rawComments[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error checking comment structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCommentStructure(); 