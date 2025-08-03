const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...');
    
    const universityCount = await prisma.university.count();
    console.log(`📊 Total universities in database: ${universityCount}`);
    
    if (universityCount > 0) {
      const regions = await prisma.university.groupBy({
        by: ['region'],
        _count: { region: true }
      });
      
      console.log('\n🌍 Universities by region:');
      regions.forEach((region: any) => {
        console.log(`   ${region.region}: ${region._count.region}`);
      });
    }
    
    console.log('\n✅ Database is ready!');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus(); 