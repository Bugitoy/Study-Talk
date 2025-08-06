import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCommentCollection() {
  try {
    console.log('🔍 Debugging comment collection and aggregation...');
    
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

    // Test different collection names
    const collectionNames = ['confessionComment', 'ConfessionComment', 'confessioncomment'];
    
    for (const collectionName of collectionNames) {
      console.log(`\n🧪 Testing collection: ${collectionName}`);
      
      try {
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
          aggregate: collectionName,
          pipeline,
          cursor: { batchSize: 1000 }
        });

        const comments = (result as any).cursor?.firstBatch || [];
        
        console.log(`✅ Collection ${collectionName}: Found ${comments.length} comments`);
        
        if (comments.length > 0) {
          console.log('📋 Sample comment data:');
          console.log(JSON.stringify(comments[0], null, 2));
        }
        
      } catch (error) {
        console.log(`❌ Collection ${collectionName}: Error - ${(error as any).message}`);
      }
    }

    // Also test the regular Prisma query
    console.log('\n🧪 Testing regular Prisma query...');
    const regularComments = await prisma.confessionComment.findMany({
      where: { confessionId: confessionWithComments.id },
      include: { author: { select: { id: true, name: true, image: true } } },
      orderBy: [{ parentId: 'asc' }, { createdAt: 'desc' }]
    });
    
    console.log(`✅ Regular Prisma query: Found ${regularComments.length} comments`);

  } catch (error) {
    console.error('❌ Error debugging comment collection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCommentCollection(); 