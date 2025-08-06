import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testUserCreation() {
  try {
    console.log('🧪 Testing user creation to identify constraint issue...\n');

    const testUserData = {
      id: 'kp_b711cfa5c8f24a4ab001d94eda4a1f10',
      email: 'moalositlefika@gmail.com',
      name: 'Test User',
      image: 'https://example.com/image.jpg'
    };

    console.log('1. Testing user creation with exact data from error...');
    console.log('Test data:', testUserData);

    try {
      const createdUser = await prisma.user.create({
        data: testUserData
      });
      console.log('✅ User creation successful:', createdUser.id);
      
      // Clean up
      await prisma.user.delete({
        where: { id: createdUser.id }
      });
      console.log('🧹 Test user cleaned up');
      
    } catch (createError) {
      console.log('❌ User creation failed:', (createError as any).message);
      console.log('Error code:', (createError as any).code);
      console.log('Error meta:', (createError as any).meta);
    }

    console.log('\n2. Testing user creation with customerId explicitly set to null...');
    try {
      const createdUser2 = await prisma.user.create({
        data: {
          ...testUserData,
          customerId: null
        }
      });
      console.log('✅ User creation with explicit null customerId successful:', createdUser2.id);
      
      // Clean up
      await prisma.user.delete({
        where: { id: createdUser2.id }
      });
      console.log('🧹 Test user 2 cleaned up');
      
    } catch (createError2) {
      console.log('❌ User creation with null customerId failed:', (createError2 as any).message);
      console.log('Error code:', (createError2 as any).code);
      console.log('Error meta:', (createError2 as any).meta);
    }

    console.log('\n3. Testing user creation with different ID...');
    try {
      const createdUser3 = await prisma.user.create({
        data: {
          id: 'kp_test_' + Date.now(),
          email: 'test_' + Date.now() + '@example.com',
          name: 'Test User 3',
          image: 'https://example.com/image.jpg'
        }
      });
      console.log('✅ User creation with different ID successful:', createdUser3.id);
      
      // Clean up
      await prisma.user.delete({
        where: { id: createdUser3.id }
      });
      console.log('🧹 Test user 3 cleaned up');
      
    } catch (createError3) {
      console.log('❌ User creation with different ID failed:', (createError3 as any).message);
      console.log('Error code:', (createError3 as any).code);
      console.log('Error meta:', (createError3 as any).meta);
    }

    console.log('\n4. Checking if there are any database constraints or triggers...');
    const existingUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        customerId: true,
        plan: true
      }
    });

    if (existingUser) {
      console.log('📋 Existing user structure:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   CustomerID: ${existingUser.customerId || 'null'}`);
      console.log(`   Plan: ${existingUser.plan}`);
    }

  } catch (error) {
    console.error('❌ Error in testUserCreation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserCreation(); 