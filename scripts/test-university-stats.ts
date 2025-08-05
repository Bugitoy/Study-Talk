import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUniversityStats() {
  try {
    console.log('Testing university statistics...\n');

    // Get a few universities to test with
    const universities = await prisma.university.findMany({
      take: 3,
      orderBy: { confessionCount: 'desc' }
    });

    console.log(`Testing with ${universities.length} universities:`);
    universities.forEach(uni => {
      console.log(`- ${uni.name} (ID: ${uni.id})`);
    });
    console.log('');

    // Test each university's stats
    for (const uni of universities) {
      console.log(`\n=== Testing ${uni.name} ===`);
      
      // Get student count
      const studentCount = await prisma.user.count({
        where: { university: uni.name }
      });
      console.log(`Student count: ${studentCount}`);

      // Get total votes from students of this university
      const totalVotes = await prisma.confessionVote.count({
        where: {
          user: {
            university: uni.name
          }
        }
      });
      console.log(`Total votes from students: ${totalVotes}`);

      // Get confession count (from the university record)
      console.log(`Confession count: ${uni.confessionCount}`);

      // Verify the data makes sense
      if (studentCount > 0) {
        console.log(`✅ ${uni.name} has ${studentCount} students and ${totalVotes} total votes`);
      } else {
        console.log(`⚠️  ${uni.name} has no students registered`);
      }
    }

    // Test the API endpoints
    console.log('\n=== Testing API Endpoints ===');
    
    const baseUrl = 'http://localhost:3000';
    const endpoints = [
      '/api/universities/stats-optimized?limit=3',
      '/api/universities/stats-simple?limit=3'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\nTesting ${endpoint}...`);
        const response = await fetch(`${baseUrl}${endpoint}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Success! Found ${data.universities.length} universities`);
          
          if (data.universities.length > 0) {
            const sample = data.universities[0];
            console.log(`Sample university: ${sample.name}`);
            console.log(`- Confessions: ${sample.confessionCount}`);
            console.log(`- Students: ${sample.studentCount}`);
            console.log(`- Total votes: ${sample.totalVotes}`);
          }
        } else {
          console.log(`❌ Failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${endpoint}:`, error);
      }
    }

    console.log('\n✅ University statistics test completed!');
  } catch (error) {
    console.error('❌ Error testing university statistics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUniversityStats(); 