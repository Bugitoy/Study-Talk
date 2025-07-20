import { PrismaClient } from '@prisma/client';
import { calculateUserReputation } from '../src/lib/db-utils';

const prisma = new PrismaClient();

async function initializeReputation() {
  try {
    console.log('Starting reputation initialization...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    
    console.log(`Found ${users.length} users to process`);
    
    let processed = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.name || user.email} (${user.id})`);
        
        const reputation = await calculateUserReputation(user.id);
        
        if (reputation) {
          console.log(`✅ User ${user.name || user.email}: Reputation = ${reputation.reputationScore}, Bot Probability = ${reputation.botProbability}%`);
          processed++;
        } else {
          console.log(`❌ Failed to calculate reputation for user: ${user.name || user.email}`);
          errors++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.name || user.email}:`, error);
        errors++;
      }
    }
    
    console.log(`\n🎉 Reputation initialization complete!`);
    console.log(`✅ Successfully processed: ${processed} users`);
    console.log(`❌ Errors: ${errors} users`);
    
  } catch (error) {
    console.error('Error during reputation initialization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
initializeReputation()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 