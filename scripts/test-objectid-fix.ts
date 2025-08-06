import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testObjectIdFix() {
  try {
    console.log('🧪 Testing ObjectId fix for comment aggregation...');
    
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

    // Test the aggregation pipeline with string match
    const pipeline1 = [
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

    const result1 = await prisma.$runCommandRaw({
      aggregate: 'ConfessionComment',
      pipeline: pipeline1,
      cursor: { batchSize: 1000 }
    });

    const comments1 = (result1 as any).cursor?.firstBatch || [];
    console.log(`✅ String match: Found ${comments1.length} comments`);

    // Test with ObjectId conversion
    const pipeline2 = [
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

    const result2 = await prisma.$runCommandRaw({
      aggregate: 'ConfessionComment',
      pipeline: pipeline2,
      cursor: { batchSize: 1000 }
    });

    const comments2 = (result2 as any).cursor?.firstBatch || [];
    console.log(`✅ ObjectId match: Found ${comments2.length} comments`);

    // Test regular Prisma query for comparison
    const regularComments = await prisma.confessionComment.findMany({
      where: { confessionId: confessionWithComments.id },
      include: { author: { select: { id: true, name: true, image: true } } },
      orderBy: [{ parentId: 'asc' }, { createdAt: 'desc' }]
    });
    
    console.log(`✅ Regular Prisma: Found ${regularComments.length} comments`);

    if (comments2.length > 0) {
      console.log('\n📋 Sample comment from aggregation:');
      console.log(JSON.stringify(comments2[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing ObjectId fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testObjectIdFix(); 