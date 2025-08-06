import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetDatabaseConstraints() {
  try {
    console.log('🔄 Resetting database constraints...\n');

    // 1. Check if there are any hidden records
    console.log('1. Checking for any hidden records...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        customerId: true,
        name: true,
        createdAt: true
      }
    });

    console.log(`📊 Total users in database: ${allUsers.length}`);
    allUsers.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: ${user.customerId === null ? 'null' : `"${user.customerId}"`}, Created: ${user.createdAt}`);
    });

    // 2. Try to create a user with a completely different ID pattern
    console.log('\n2. Testing user creation with different ID pattern...');
    try {
      const testUser = await prisma.user.create({
        data: {
          id: 'test_user_' + Math.random().toString(36).substr(2, 9),
          email: 'test_' + Math.random().toString(36).substr(2, 9) + '@example.com',
          name: 'Test User Different Pattern'
        }
      });
      console.log('✅ User creation with different ID pattern successful:', testUser.id);
      
      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('🧹 Test user cleaned up');
      
    } catch (createError) {
      console.log('❌ User creation with different ID pattern failed:', (createError as any).message);
      console.log('Error code:', (createError as any).code);
      console.log('Error meta:', (createError as any).meta);
    }

    // 3. Try to create a user with the exact same data as the existing user but different ID
    console.log('\n3. Testing user creation with same data but different ID...');
    try {
      const existingUser = allUsers[0];
      if (existingUser) {
        const duplicateUser = await prisma.user.create({
          data: {
            id: 'duplicate_' + Math.random().toString(36).substr(2, 9),
            email: existingUser.email,
            name: existingUser.name,
            customerId: existingUser.customerId
          }
        });
        console.log('✅ Duplicate user creation successful (this should fail):', duplicateUser.id);
        
        // Clean up
        await prisma.user.delete({
          where: { id: duplicateUser.id }
        });
        console.log('🧹 Duplicate user cleaned up');
      }
    } catch (duplicateError) {
      console.log('❌ Duplicate user creation failed (expected):', (duplicateError as any).message);
      console.log('Error code:', (duplicateError as any).code);
      console.log('Error meta:', (duplicateError as any).meta);
    }

    // 4. Check if there's a database-level issue by trying to create a user without customerId field
    console.log('\n4. Testing user creation without customerId field...');
    try {
      const minimalUser = await prisma.user.create({
        data: {
          id: 'minimal_' + Math.random().toString(36).substr(2, 9),
          email: 'minimal_' + Math.random().toString(36).substr(2, 9) + '@example.com',
          name: 'Minimal User No CustomerId'
        },
        select: {
          id: true,
          email: true,
          customerId: true,
          name: true
        }
      });
      console.log('✅ Minimal user creation successful:', minimalUser.id);
      console.log('   CustomerID after creation:', minimalUser.customerId === null ? 'null' : `"${minimalUser.customerId}"`);
      
      // Clean up
      await prisma.user.delete({
        where: { id: minimalUser.id }
      });
      console.log('🧹 Minimal user cleaned up');
      
    } catch (minimalError) {
      console.log('❌ Minimal user creation failed:', (minimalError as any).message);
      console.log('Error code:', (minimalError as any).code);
      console.log('Error meta:', (minimalError as any).meta);
    }

    // 5. Check if there's a database connection issue
    console.log('\n5. Testing database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Test a simple query
      const userCount = await prisma.user.count();
      console.log(`✅ Database query successful. User count: ${userCount}`);
      
    } catch (dbError) {
      console.log('❌ Database connection failed:', (dbError as any).message);
    }

  } catch (error) {
    console.error('❌ Error in resetDatabaseConstraints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabaseConstraints(); 