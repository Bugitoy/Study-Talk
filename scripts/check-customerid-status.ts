import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCustomerIdStatus() {
  try {
    console.log('🔍 Checking customerId status in database...\n');

    // Get all users and their customerId status
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total users: ${allUsers.length}\n`);

    // Categorize users by customerId status
    const usersWithNullCustomerId = allUsers.filter(user => user.customerId === null);
    const usersWithEmptyCustomerId = allUsers.filter(user => user.customerId === '');
    const usersWithValidCustomerId = allUsers.filter(user => user.customerId && user.customerId.trim() !== '');

    console.log('📋 CustomerId Status Breakdown:');
    console.log(`   • Users with null customerId: ${usersWithNullCustomerId.length}`);
    console.log(`   • Users with empty string customerId: ${usersWithEmptyCustomerId.length}`);
    console.log(`   • Users with valid customerId: ${usersWithValidCustomerId.length}\n`);

    if (usersWithNullCustomerId.length > 0) {
      console.log('👥 Users with null customerId:');
      usersWithNullCustomerId.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id}) - Created: ${user.createdAt}`);
      });
      console.log('');
    }

    if (usersWithEmptyCustomerId.length > 0) {
      console.log('⚠️  Users with empty string customerId:');
      usersWithEmptyCustomerId.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id}) - Created: ${user.createdAt}`);
      });
      console.log('');
    }

    if (usersWithValidCustomerId.length > 0) {
      console.log('✅ Users with valid customerId:');
      usersWithValidCustomerId.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id}) - CustomerId: ${user.customerId}`);
      });
      console.log('');
    }

    // Check for the specific problematic user
    const problematicUser = allUsers.find(user => user.email === 'moalositlefika@gmail.com');
    if (problematicUser) {
      console.log('🔍 Specific user causing issues:');
      console.log(`   Email: ${problematicUser.email}`);
      console.log(`   ID: ${problematicUser.id}`);
      console.log(`   CustomerId: "${problematicUser.customerId}"`);
      console.log(`   Created: ${problematicUser.createdAt}`);
    } else {
      console.log('✅ No user found with email: moalositlefika@gmail.com');
    }

    console.log('\n💡 Recommendations:');
    if (usersWithEmptyCustomerId.length > 0) {
      console.log('   • Need to fix empty string customerIds');
      if (usersWithNullCustomerId.length > 0) {
        console.log('   • Cannot set to null due to unique constraint');
        console.log('   • Consider setting to a unique placeholder value or removing the constraint');
      }
    }

  } catch (error) {
    console.error('❌ Error in checkCustomerIdStatus:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomerIdStatus(); 