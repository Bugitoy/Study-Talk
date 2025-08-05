import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUniversityStatsIndexes() {
  try {
    console.log('Creating indexes for university statistics...');

    // Create index on User.university for fast student count queries
    await prisma.$runCommandRaw({
      createIndexes: 'User',
      indexes: [
        {
          key: { university: 1 },
          name: 'university_index',
          background: true
        }
      ]
    });
    console.log('✓ Created index on User.university');

    // Create compound index on ConfessionVote for vote aggregation
    await prisma.$runCommandRaw({
      createIndexes: 'ConfessionVote',
      indexes: [
        {
          key: { userId: 1, confessionId: 1 },
          name: 'userId_confessionId_index',
          background: true
        }
      ]
    });
    console.log('✓ Created compound index on ConfessionVote');

    // Create index on University for filtering and sorting
    await prisma.$runCommandRaw({
      createIndexes: 'University',
      indexes: [
        {
          key: { confessionCount: -1, isVerified: -1, name: 1 },
          name: 'confessionCount_isVerified_name_index',
          background: true
        },
        {
          key: { region: 1, country: 1 },
          name: 'region_country_index',
          background: true
        }
      ]
    });
    console.log('✓ Created indexes on University');

    console.log('✅ All university statistics indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUniversityStatsIndexes(); 