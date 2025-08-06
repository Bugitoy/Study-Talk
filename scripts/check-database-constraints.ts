import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDatabaseConstraints() {
  try {
    console.log('🔍 Checking database constraints and indexes...\n');

    // 1. Try to create a user with a completely different approach
    console.log('1. Testing user creation with minimal data...');
    try {
      const minimalUser = await prisma.user.create({
        data: {
          id: 'kp_minimal_' + Date.now(),
          email: 'minimal_' + Date.now() + '@test.com',
          name: 'Minimal User'
        }
      });
      console.log('✅ Minimal user creation successful:', minimalUser.id);
      
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

    // 2. Check if there's a database-level default value
    console.log('\n2. Checking for database-level default values...');
    try {
      // Try to create a user and see what customerId gets set to
      const testUser = await prisma.user.create({
        data: {
          id: 'kp_test_default_' + Date.now(),
          email: 'test_default_' + Date.now() + '@test.com',
          name: 'Test Default User'
        },
        select: {
          id: true,
          email: true,
          customerId: true,
          name: true
        }
      });
      
      console.log('📋 Created user details:');
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Name: ${testUser.name}`);
      console.log(`   CustomerID: "${testUser.customerId}"`);
      
      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('🧹 Test user cleaned up');
      
    } catch (defaultError) {
      console.log('❌ Test user creation failed:', (defaultError as any).message);
      console.log('Error code:', (defaultError as any).code);
      console.log('Error meta:', (defaultError as any).meta);
    }

    // 3. Check if there's a unique constraint on a different field
    console.log('\n3. Checking for other unique constraints...');
    const existingUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        customerId: true,
        name: true
      }
    });

    if (existingUser) {
      console.log('📋 Existing user structure:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   CustomerID: "${existingUser.customerId}"`);
    }

    // 4. Try to create a user with the same email as existing user
    console.log('\n4. Testing user creation with existing email...');
    try {
      const duplicateEmailUser = await prisma.user.create({
        data: {
          id: 'kp_duplicate_email_' + Date.now(),
          email: existingUser?.email || 'test@example.com',
          name: 'Duplicate Email User'
        }
      });
      console.log('✅ Duplicate email user creation successful (this should fail):', duplicateEmailUser.id);
      
      // Clean up
      await prisma.user.delete({
        where: { id: duplicateEmailUser.id }
      });
      console.log('🧹 Duplicate email user cleaned up');
      
    } catch (duplicateError) {
      console.log('❌ Duplicate email user creation failed (expected):', (duplicateError as any).message);
      console.log('Error code:', (duplicateError as any).code);
      console.log('Error meta:', (duplicateError as any).meta);
    }

    // 5. Check if there's a database trigger or function
    console.log('\n5. Checking database structure...');
    try {
      // Try to get database info using $runCommandRaw instead
      const dbInfo = await prisma.$runCommandRaw({ listCollections: 1 });
      console.log('📊 Database collections:', dbInfo);
    } catch (dbError) {
      console.log('❌ Could not get database info:', (dbError as any).message);
    }

  } catch (error) {
    console.error('❌ Error in checkDatabaseConstraints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConstraints(); 