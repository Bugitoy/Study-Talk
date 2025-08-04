const { PrismaClient: PrismaClientType } = require('@prisma/client');
const fsSeed = require('fs');
const pathSeed = require('path');

const prismaClient = new PrismaClientType();

// Define the structure for university data
type UniversityData = {
  name: string;
  domain: string | null;
  region: string;
  country: string;
  isVerified: boolean;
};

// Function to read and parse university files
function readUniversityFile(filePath: string): UniversityData[] {
  try {
    const content = fsSeed.readFileSync(filePath, 'utf8');
    console.log(`📖 Reading file: ${filePath}`);
    console.log(`📄 File size: ${content.length} characters`);
    
    // Find all university objects using a more comprehensive regex
    const universities: UniversityData[] = [];
    
    // Updated regex to handle the file structure better
    const universityRegex = /\{\s*name:\s*"([^"]+)",\s*domain:\s*(null|"[^"]*"),\s*region:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*isVerified:\s*(true|false)\s*\}/g;
    
    let match;
    let count = 0;
    while ((match = universityRegex.exec(content)) !== null) {
      const [, name, domain, region, country, isVerified] = match;
      
      universities.push({
        name,
        domain: domain === 'null' ? null : domain.replace(/"/g, ''),
        region: region || 'Unknown',
        country: country || 'Unknown',
        isVerified: isVerified === 'true'
      });
      count++;
      
      // Log progress every 100 universities
      if (count % 100 === 0) {
        console.log(`   Found ${count} universities so far...`);
      }
    }
    
    console.log(`✅ Successfully parsed ${universities.length} universities from ${filePath}`);
    return universities;
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return [];
  }
}

async function seedUniversitiesFromFiles() {
  console.log('🌱 Starting university seeding from files...');
  
  try {
    // Clear existing universities
    console.log('🗑️  Clearing existing universities...');
    await prismaClient.university.deleteMany({});
    
    // Get all university files from the directory
    const directoryPath = 'scripts/universities_by_country';
    const files = fsSeed.readdirSync(directoryPath);
    const universityFiles = files
      .filter((file: string) => file.endsWith('-universities.ts'))
      .map((file: string) => ({ path: pathSeed.join(directoryPath, file) }));
    
    let totalCount = 0;
    
    for (const fileInfo of universityFiles) {
      console.log(`\n📚 Processing ${fileInfo.path}...`);
      
      const universities = readUniversityFile(fileInfo.path);
      console.log(`Found ${universities.length} universities in ${fileInfo.path}`);
      
      if (universities.length === 0) {
        console.log(`⚠️  No universities found in ${fileInfo.path}, skipping...`);
        continue;
      }
      
      // Create universities in database using upsert to handle duplicates
      console.log(`💾 Seeding ${universities.length} universities to database...`);
      let seededCount = 0;
      
      for (const university of universities) {
        try {
          await prismaClient.university.upsert({
            where: { name: university.name },
            update: {
              domain: university.domain,
              region: university.region,
              country: university.country,
              isVerified: university.isVerified,
            },
            create: {
              name: university.name,
              domain: university.domain,
              region: university.region,
              country: university.country,
              isVerified: university.isVerified,
            },
          });
          seededCount++;
          
          // Log progress every 50 universities
          if (seededCount % 50 === 0) {
            console.log(`   Seeded ${seededCount}/${universities.length} universities...`);
          }
        } catch (error) {
          console.error(`❌ Error seeding university "${university.name}":`, error);
        }
      }
      
      console.log(`✅ Successfully seeded ${seededCount} universities from ${fileInfo.path}`);
      totalCount += seededCount;
    }
    
    console.log(`\n🎉 Successfully seeded ${totalCount} universities total!`);
    
    // Print summary
    const dbCount = await prismaClient.university.count();
    const verifiedCount = await prismaClient.university.count({
      where: { isVerified: true }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total universities in database: ${dbCount}`);
    console.log(`   Verified universities: ${verifiedCount}`);
    console.log(`   Unverified universities: ${dbCount - verifiedCount}`);
    
    // Print breakdown by region
    const regions = await prismaClient.university.groupBy({
      by: ['region'],
      _count: { region: true }
    });
    
    console.log(`\n🌍 Universities by region:`);
    regions.forEach((region: any) => {
      console.log(`   ${region.region}: ${region._count.region}`);
    });
    
    // Print breakdown by country
    const countries = await prismaClient.university.groupBy({
      by: ['country'],
      _count: { country: true }
    });
    
    console.log(`\n🏛️  Universities by country:`);
    countries.forEach((country: any) => {
      console.log(`   ${country.country}: ${country._count.country}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
    throw error;
  } finally {
    await prismaClient.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedUniversitiesFromFiles()
    .then(() => {
      console.log('✨ Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedUniversitiesFromFiles; 