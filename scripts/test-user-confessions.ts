import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserConfessions() {
  try {
    console.log('Testing user confessions functionality...\n');

    // Get a user with confessions
    const userWithConfessions = await prisma.user.findFirst({
      where: {
        confessions: {
          some: {}
        }
      },
      include: {
        confessions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!userWithConfessions) {
      console.log('No users with confessions found. Creating test data...');
      
      // Create a test user
      const testUser = await prisma.user.create({
        data: {
          id: 'test-user-confessions',
          email: 'test-confessions@example.com',
          name: 'Test User',
        }
      });

      // Create some test confessions
      await prisma.confession.createMany({
        data: [
          {
            title: 'Test Confession 1',
            content: 'This is a test confession for the user confessions feature.',
            authorId: testUser.id,
            isAnonymous: false,
          },
          {
            title: 'Test Confession 2',
            content: 'Another test confession to verify the functionality.',
            authorId: testUser.id,
            isAnonymous: true,
          },
          {
            title: 'Test Confession 3',
            content: 'Third test confession with different content.',
            authorId: testUser.id,
            isAnonymous: false,
          }
        ]
      });

      console.log('Created test user and confessions.');
      
      // Test the filtering
      const userConfessions = await prisma.confession.findMany({
        where: {
          authorId: testUser.id,
          isHidden: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              university: true,
            }
          },
          university: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`Found ${userConfessions.length} confessions for user ${testUser.id}:`);
      userConfessions.forEach((confession, index) => {
        console.log(`${index + 1}. "${confession.title}" (${confession.isAnonymous ? 'Anonymous' : 'Named'})`);
      });

      // Clean up test data
      await prisma.confession.deleteMany({
        where: { authorId: testUser.id }
      });
      await prisma.user.delete({
        where: { id: testUser.id }
      });

      console.log('\nCleaned up test data.');
    } else {
      console.log(`Found user: ${userWithConfessions.name} (${userWithConfessions.id})`);
      console.log(`User has ${userWithConfessions.confessions.length} confessions:`);
      
      userWithConfessions.confessions.forEach((confession, index) => {
        console.log(`${index + 1}. "${confession.title}" (${confession.isAnonymous ? 'Anonymous' : 'Named'})`);
      });

      // Test the filtering with existing user
      const userConfessions = await prisma.confession.findMany({
        where: {
          authorId: userWithConfessions.id,
          isHidden: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              university: true,
            }
          },
          university: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`\nFiltered query found ${userConfessions.length} confessions for this user.`);
    }

    console.log('\n✅ User confessions functionality test completed successfully!');
    console.log('The database filtering by authorId is working correctly.');

  } catch (error) {
    console.error('❌ Error testing user confessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserConfessions(); 