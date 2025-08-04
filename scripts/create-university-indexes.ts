const { PrismaClient: PrismaClientIndex } = require('@prisma/client');
const prismaIndex = new PrismaClientIndex();

async function createUniversityIndexes() {
  console.log('🔧 Creating database indexes for universities...');
  try {
    console.log(`
📋 Please run these MongoDB commands to create indexes:
// Connect to your MongoDB database
use your_database_name

// Create indexes for better performance
db.university.createIndex({ "confessionCount": -1 })  // For sorting by confession count
db.university.createIndex({ "region": 1 })
db.university.createIndex({ "country": 1 })
db.university.createIndex({ "name": 1 })
db.university.createIndex({ "isVerified": 1 })

// Compound indexes for common queries
db.university.createIndex({ "confessionCount": -1, "isVerified": -1, "name": 1 })  // Main sorting index
db.university.createIndex({ "region": 1, "confessionCount": -1 })
db.university.createIndex({ "country": 1, "confessionCount": -1 })
db.university.createIndex({ "name": "text" })  // For text search

// Related collection indexes
db.confession.createIndex({ "universityId": 1 })
db.confessionVote.createIndex({ "confession.universityId": 1 })

✅ These indexes will dramatically improve query performance!
    `);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await prismaIndex.$disconnect();
  }
}

if (require.main === module) {
  createUniversityIndexes()
    .then(() => {
      console.log('✨ Index creation script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Index creation failed:', error);
      process.exit(1);
    });
}

module.exports = createUniversityIndexes; 