import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugUniversityData() {
  try {
    console.log('🔍 Debugging university data storage...\n');

    // Check how many users have university data
    const totalUsers = await prisma.user.count();
    const usersWithUniversity = await prisma.user.count({
      where: {
        university: { not: null }
      }
    });

    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with university: ${usersWithUniversity}\n`);

    // Get a sample of users with university data
    const sampleUsers = await prisma.user.findMany({
      where: {
        university: { not: null }
      },
      select: {
        id: true,
        name: true,
        university: true
      },
      take: 10
    });

    console.log('Sample users with university data:');
    sampleUsers.forEach(user => {
      console.log(`- ${user.name || 'Unknown'} (${user.id}): "${user.university}"`);
    });
    console.log('');

    // Check if any users have "University of Cincinnati"
    const cincinnatiUsers = await prisma.user.findMany({
      where: {
        university: {
          contains: 'Cincinnati',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        university: true
      }
    });

    console.log(`Users with "Cincinnati" in university: ${cincinnatiUsers.length}`);
    cincinnatiUsers.forEach(user => {
      console.log(`- ${user.name || 'Unknown'}: "${user.university}"`);
    });
    console.log('');

    // Get the University of Cincinnati record
    const cincinnatiUni = await prisma.university.findFirst({
      where: {
        name: {
          contains: 'Cincinnati',
          mode: 'insensitive'
        }
      }
    });

    if (cincinnatiUni) {
      console.log(`University of Cincinnati record:`);
      console.log(`- ID: ${cincinnatiUni.id}`);
      console.log(`- Name: "${cincinnatiUni.name}"`);
      console.log(`- Confession count: ${cincinnatiUni.confessionCount}`);
      console.log('');

      // Check if any users have this exact university ID
      const usersWithExactId = await prisma.user.count({
        where: {
          university: cincinnatiUni.id
        }
      });
      console.log(`Users with exact university ID (${cincinnatiUni.id}): ${usersWithExactId}`);

      // Check if any users have the university name
      const usersWithName = await prisma.user.count({
        where: {
          university: cincinnatiUni.name
        }
      });
      console.log(`Users with university name ("${cincinnatiUni.name}"): ${usersWithName}`);

      // Check for partial matches
      const usersWithPartial = await prisma.user.count({
        where: {
          university: {
            contains: 'Cincinnati',
            mode: 'insensitive'
          }
        }
      });
      console.log(`Users with "Cincinnati" in university field: ${usersWithPartial}`);
    }

    // Check for votes from users with any university
    const votesFromUniversityUsers = await prisma.confessionVote.count({
      where: {
        user: {
          university: { not: null }
        }
      }
    });

    console.log(`\nTotal votes from users with university data: ${votesFromUniversityUsers}`);

    // Get a sample of votes with user university data
    const sampleVotes = await prisma.confessionVote.findMany({
      where: {
        user: {
          university: { not: null }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            university: true
          }
        }
      },
      take: 5
    });

    console.log('\nSample votes from users with university data:');
    sampleVotes.forEach(vote => {
      console.log(`- Vote by ${vote.user.name || 'Unknown'} from "${vote.user.university}"`);
    });

  } catch (error) {
    console.error('❌ Error debugging university data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUniversityData(); 