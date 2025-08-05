const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNullStringCustomerId() {
  try {
    console.log('🔧 Fixing customerId string "null" issue...\n');

    // 1. Find users with customerId = "null" (string)
    console.log('1. Finding users with customerId = "null"...');
    const usersWithNullString = await prisma.user.findMany({
      where: {
        customerId: 'null'
      },
      select: {
        id: true,
        email: true,
        customerId: true,
        name: true
      }
    });

    console.log(`📊 Found ${usersWithNullString.length} users with customerId = "null":`);
    usersWithNullString.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: "${user.customerId}"`);
    });

    // 2. Fix the users by setting customerId to actual null
    if (usersWithNullString.length > 0) {
      console.log('\n2. Fixing users with string "null" customerId...');
      
      for (const user of usersWithNullString) {
        console.log(`   Fixing user: ${user.email}`);
        
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { customerId: null }
          });
          console.log(`   ✅ Fixed user: ${user.email}`);
        } catch (updateError) {
          console.log(`   ❌ Failed to fix user: ${user.email} - ${(updateError as any).message}`);
        }
      }
    } else {
      console.log('✅ No users with string "null" customerId found');
    }

    // 3. Test user creation after fix
    console.log('\n3. Testing user creation after fix...');
    try {
      const testUser = await prisma.user.create({
        data: {
          id: 'kp_test_after_fix_' + Date.now(),
          email: 'test_after_fix_' + Date.now() + '@example.com',
          name: 'Test User After Fix',
          image: 'https://example.com/image.jpg'
        }
      });
      console.log('✅ User creation successful after fix:', testUser.id);
      
      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('🧹 Test user cleaned up');
      
    } catch (createError) {
      console.log('❌ User creation still failing:', (createError as any).message);
      console.log('Error code:', (createError as any).code);
      console.log('Error meta:', (createError as any).meta);
    }

    // 4. Verify the fix
    console.log('\n4. Verifying the fix...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        customerId: true,
        name: true
      }
    });

    console.log(`📊 All users after fix (${allUsers.length} total):`);
    allUsers.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: ${user.customerId === null ? 'null' : `"${user.customerId}"`}`);
    });

  } catch (error) {
    console.error('❌ Error in fixNullStringCustomerId:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNullStringCustomerId(); 