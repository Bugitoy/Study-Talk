const { PrismaClient: PrismaClientConfession } = require('@prisma/client');

const prismaConfession = new PrismaClientConfession();

async function createConfessionIndexes() {
  console.log('🔧 Creating database indexes for confessions...');
  try {
    console.log(`
📋 Please run these MongoDB commands to create indexes:
// Connect to your MongoDB database
use your_database_name

// Create indexes for better confession performance
db.confession.createIndex({ "isHidden": 1 })
db.confession.createIndex({ "hotScore": -1 })
db.confession.createIndex({ "createdAt": -1 })
db.confession.createIndex({ "authorId": 1 })
db.confession.createIndex({ "universityId": 1 })

// Aggregated field indexes for lightning-fast queries
db.confession.createIndex({ "commentCount": -1 })
db.confession.createIndex({ "replyCount": -1 })
db.confession.createIndex({ "believeCount": -1 })
db.confession.createIndex({ "doubtCount": -1 })
db.confession.createIndex({ "savedCount": -1 })

// Compound indexes for common queries
db.confession.createIndex({ "isHidden": 1, "createdAt": -1, "id": -1 })  // Recent sorting
db.confession.createIndex({ "isHidden": 1, "hotScore": -1, "id": -1 })   // Hot sorting
db.confession.createIndex({ "isHidden": 1, "universityId": 1, "createdAt": -1 })  // University filtering
db.confession.createIndex({ "isHidden": 1, "authorId": 1, "createdAt": -1 })      // User filtering

// Text search index
db.confession.createIndex({ "title": "text", "content": "text" })

// Related collection indexes
db.confessionVote.createIndex({ "confessionId": 1 })
db.confessionVote.createIndex({ "userId": 1 })
db.confessionVote.createIndex({ "userId_confessionId": 1 }, { unique: true })
db.confessionVote.createIndex({ "confessionId": 1, "voteType": 1 })

db.confessionComment.createIndex({ "confessionId": 1 })
db.confessionComment.createIndex({ "authorId": 1 })
db.confessionComment.createIndex({ "parentId": 1 })
db.confessionComment.createIndex({ "confessionId": 1, "parentId": 1 })

db.savedConfession.createIndex({ "userId": 1 })
db.savedConfession.createIndex({ "confessionId": 1 })
db.savedConfession.createIndex({ "userId_confessionId": 1 }, { unique: true })

✅ These indexes will dramatically improve confession query performance!
    `);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await prismaConfession.$disconnect();
  }
}

if (require.main === module) {
  createConfessionIndexes()
    .then(() => {
      console.log('✨ Index creation script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Index creation failed:', error);
      process.exit(1);
    });
}

module.exports = createConfessionIndexes; 