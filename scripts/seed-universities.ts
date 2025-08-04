import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type UniversityData = {
  name: string;
  domain: string | null;
  region?: string;
  country?: string;
  isVerified: boolean;
};

const universities: UniversityData[] = [
  
];

async function seedUniversities() {
  console.log('🌱 Starting university seeding...');
  
  try {
    // Clear existing universities (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing universities...');
    await prisma.university.deleteMany({});
    
    // Seed universities
    console.log(`📚 Seeding ${universities.length} universities...`);
    
    for (const university of universities) {
      await prisma.university.create({
        data: university,
      });
      console.log(`✅ Created: ${university.name}`);
    }
    
    console.log('🎉 University seeding completed successfully!');
    
    // Print summary
    const totalCount = await prisma.university.count();
    const verifiedCount = await prisma.university.count({
      where: { isVerified: true }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total universities: ${totalCount}`);
    console.log(`   Verified universities: ${verifiedCount}`);
    console.log(`   Unverified universities: ${totalCount - verifiedCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedUniversities()
    .then(() => {
      console.log('✨ Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedUniversities; 