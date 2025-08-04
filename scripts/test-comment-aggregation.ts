const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCommentAggregation() {
  try {
    console.log('🧪 Testing comment aggregation pipeline...');
    
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

    // Test the aggregation pipeline
    const pipeline = [
      {
        $match: { confessionId: confessionWithComments.id }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $addFields: {
          author: {
            $arrayElemAt: ['$author', 0]
          }
        }
      },
      {
        $sort: {
          parentId: 1,
          createdAt: -1
        }
      },
      {
        $project: {
          id: '$_id',
          content: 1,
          authorId: 1,
          confessionId: 1,
          parentId: 1,
          isAnonymous: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            id: '$author._id',
            name: '$author.name',
            image: '$author.image'
          }
        }
      }
    ];

    const result = await prisma.$runCommandRaw({
      aggregate: 'confessionComment',
      pipeline,
      cursor: { batchSize: 1000 }
    });

    const comments = (result as any).cursor?.firstBatch || [];
    
    console.log(`✅ Aggregation successful! Found ${comments.length} comments`);
    
    if (comments.length > 0) {
      console.log('📋 Sample comment data:');
      console.log(JSON.stringify(comments[0], null, 2));
    }

    // Test performance comparison
    console.log('\n⏱️ Performance comparison:');
    
    const startTime1 = Date.now();
    await prisma.confessionComment.findMany({
      where: { confessionId: confessionWithComments.id },
      include: { author: { select: { id: true, name: true, image: true } } },
      orderBy: [{ parentId: 'asc' }, { createdAt: 'desc' }]
    });
    const time1 = Date.now() - startTime1;
    
    const startTime2 = Date.now();
    await prisma.$runCommandRaw({
      aggregate: 'confessionComment',
      pipeline,
      cursor: { batchSize: 1000 }
    });
    const time2 = Date.now() - startTime2;
    
    console.log(`📊 Regular query: ${time1}ms`);
    console.log(`🚀 Aggregation: ${time2}ms`);
    console.log(`⚡ Speed improvement: ${Math.round((time1 - time2) / time1 * 100)}% faster`);

  } catch (error) {
    console.error('❌ Error testing comment aggregation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCommentAggregation(); 