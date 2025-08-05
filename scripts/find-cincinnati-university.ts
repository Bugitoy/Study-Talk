import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findCincinnatiUniversity() {
  try {
    console.log('🔍 Finding University of Cincinnati record...\n');

    // Search for any university with Cincinnati in the name
    const cincinnatiUniversities = await prisma.university.findMany({
      where: {
        name: {
          contains: 'Cincinnati',
          mode: 'insensitive'
        }
      }
    });

    console.log(`Found ${cincinnatiUniversities.length} universities with "Cincinnati" in name:`);
    cincinnatiUniversities.forEach(uni => {
      console.log(`- ID: ${uni.id}`);
      console.log(`- Name: "${uni.name}"`);
      console.log(`- Confession count: ${uni.confessionCount}`);
      console.log('');
    });

    // Search for any university that might match "University of Cincinnati"
    const universityOfCincinnati = await prisma.university.findMany({
      where: {
        name: {
          contains: 'University of Cincinnati',
          mode: 'insensitive'
        }
      }
    });

    console.log(`Found ${universityOfCincinnati.length} universities with "University of Cincinnati" in name:`);
    universityOfCincinnati.forEach(uni => {
      console.log(`- ID: ${uni.id}`);
      console.log(`- Name: "${uni.name}"`);
      console.log(`- Confession count: ${uni.confessionCount}`);
      console.log('');
    });

    // Check if there's a university with confession count > 0 that might be the right one
    const universitiesWithConfessions = await prisma.university.findMany({
      where: {
        confessionCount: { gt: 0 }
      },
      orderBy: {
        confessionCount: 'desc'
      },
      take: 10
    });

    console.log('Top 10 universities by confession count:');
    universitiesWithConfessions.forEach(uni => {
      console.log(`- "${uni.name}" (ID: ${uni.id}): ${uni.confessionCount} confessions`);
    });

  } catch (error) {
    console.error('❌ Error finding Cincinnati university:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findCincinnatiUniversity(); 