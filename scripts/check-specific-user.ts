const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificUser() {
  try {
    console.log('🔍 Checking for specific user causing the issue...\n');

    const kindeId = 'kp_b711cfa5c8f24a4ab001d94eda4a1f10';
    const email = 'moalositlefika@gmail.com';

    // Check by Kinde ID
    console.log('1. Checking by Kinde ID:', kindeId);
    const userByKindeId = await prisma.user.findUnique({
      where: { id: kindeId },
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true,
        name: true
      }
    });

    if (userByKindeId) {
      console.log('✅ Found user by Kinde ID:');
      console.log(`   ID: ${userByKindeId.id}`);
      console.log(`   Email: ${userByKindeId.email}`);
      console.log(`   Name: ${userByKindeId.name}`);
      console.log(`   CustomerID: ${userByKindeId.customerId || 'null'}`);
      console.log(`   Created: ${userByKindeId.createdAt}`);
    } else {
      console.log('❌ No user found by Kinde ID');
    }

    // Check by email
    console.log('\n2. Checking by email:', email);
    const userByEmail = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true,
        name: true
      }
    });

    if (userByEmail) {
      console.log('✅ Found user by email:');
      console.log(`   ID: ${userByEmail.id}`);
      console.log(`   Email: ${userByEmail.email}`);
      console.log(`   Name: ${userByEmail.name}`);
      console.log(`   CustomerID: ${userByEmail.customerId || 'null'}`);
      console.log(`   Created: ${userByEmail.createdAt}`);
    } else {
      console.log('❌ No user found by email');
    }

    // Check all users in database
    console.log('\n3. Checking all users in database...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true,
        name: true
      },
      take: 10
    });

    console.log(`📊 Total users in database: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log('📋 Users found:');
      allUsers.forEach((user: any, index: number) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: ${user.customerId || 'null'}`);
      });
    }

    // Check if there's a user with a customerId that might conflict
    console.log('\n4. Checking for any user with customerId...');
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

    console.log(`📊 Users with customerId: ${usersWithCustomerId.length}`);
    usersWithCustomerId.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: ${user.customerId}`);
    });

  } catch (error) {
    console.error('❌ Error in checkSpecificUser:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificUser(); 