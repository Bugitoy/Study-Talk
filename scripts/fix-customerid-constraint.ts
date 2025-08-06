import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixCustomerIdConstraint() {
  try {
    console.log('🔍 Diagnosing customerId constraint issue...\n');

    // 1. Check for users with customerId
    console.log('1. Checking users with customerId...');
    const usersWithCustomerId = await prisma.user.findMany({
      where: {
        customerId: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${usersWithCustomerId.length} users with customerId:`);
    usersWithCustomerId.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: ${user.customerId}, Created: ${user.createdAt}`);
    });

    // 2. Check for duplicate customerIds (MongoDB compatible)
    console.log('\n2. Checking for duplicate customerIds...');
    const allUsersWithCustomerId = await prisma.user.findMany({
      where: {
        customerId: {
          not: null
        }
      },
      select: {
        customerId: true
      }
    });

    const customerIdCounts: { [key: string]: number } = {};
    allUsersWithCustomerId.forEach((user: any) => {
      if (user.customerId) {
        customerIdCounts[user.customerId] = (customerIdCounts[user.customerId] || 0) + 1;
      }
    });

    const duplicateCustomerIds = Object.entries(customerIdCounts)
      .filter(([_, count]) => count > 1)
      .map(([customerId, count]) => ({ customerId, count }));

    if (duplicateCustomerIds.length > 0) {
      console.log('⚠️  Found duplicate customerIds:');
      duplicateCustomerIds.forEach((item: any) => {
        console.log(`   CustomerID: ${item.customerId}, Count: ${item.count}`);
      });
    } else {
      console.log('✅ No duplicate customerIds found');
    }

    // 3. Check for users with null customerId but should have one
    console.log('\n3. Checking users with null customerId...');
    const usersWithoutCustomerId = await prisma.user.findMany({
      where: {
        customerId: null
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      },
      take: 10
    });

    console.log(`📊 Found ${usersWithoutCustomerId.length} users without customerId (showing first 10):`);
    usersWithoutCustomerId.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, Created: ${user.createdAt}`);
    });

    // 4. Check the specific user that's causing the issue
    console.log('\n4. Checking for the specific user causing the issue...');
    const problematicUser = await prisma.user.findFirst({
      where: {
        email: 'moalositlefika@gmail.com'
      },
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true
      }
    });

    if (problematicUser) {
      console.log('🔍 Found problematic user:');
      console.log(`   ID: ${problematicUser.id}`);
      console.log(`   Email: ${problematicUser.email}`);
      console.log(`   CustomerID: ${problematicUser.customerId || 'null'}`);
      console.log(`   Created: ${problematicUser.createdAt}`);
    } else {
      console.log('✅ No user found with email: moalositlefika@gmail.com');
    }

    // 5. Provide fix recommendations
    console.log('\n5. Fix Recommendations:');
    console.log('   Option 1: Clear customerId for users without subscriptions');
    console.log('   Option 2: Update the auth callback to not set customerId during creation');
    console.log('   Option 3: Handle the constraint violation more gracefully');

    // 6. Apply fix: Clear customerId for users without active subscriptions
    console.log('\n6. Applying fix: Clearing customerId for users without subscriptions...');
    
    const usersToFix = await prisma.user.findMany({
      where: {
        customerId: {
          not: null
        },
        Subscription: null // No active subscription
      },
      select: {
        id: true,
        email: true,
        customerId: true
      }
    });

    if (usersToFix.length > 0) {
      console.log(`🔄 Found ${usersToFix.length} users to fix:`);
      usersToFix.forEach((user: any, index: number) => {
        console.log(`   ${index + 1}. ${user.email} (CustomerID: ${user.customerId})`);
      });

      // Ask for confirmation
      console.log('\n⚠️  This will clear customerId for users without subscriptions.');
      console.log('   This is safe as customerId should only be set when users have active subscriptions.');
      
      // For now, just show what would be fixed
      console.log('\n📋 Would clear customerId for these users:');
      usersToFix.forEach((user: any, index: number) => {
        console.log(`   ${index + 1}. ${user.email}`);
      });
    } else {
      console.log('✅ No users need fixing');
    }

  } catch (error) {
    console.error('❌ Error in fixCustomerIdConstraint:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCustomerIdConstraint(); 