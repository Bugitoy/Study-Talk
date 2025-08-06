import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixHiddenCustomerId() {
  try {
    console.log('🔍 Finding hidden customerId causing constraint violation...\n');

    // 1. Check all users in the database
    console.log('1. Checking all users in database...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true,
        name: true
      }
    });

    console.log(`📊 Total users found: ${allUsers.length}`);
    allUsers.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: ${user.customerId || 'null'}`);
    });

    // 2. Check for any user with a customerId (even if it seems null)
    console.log('\n2. Checking for users with any customerId value...');
    const usersWithAnyCustomerId = await prisma.user.findMany({
      where: {
        OR: [
          { customerId: { not: null } },
          { customerId: { not: '' } }
        ]
      },
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true
      }
    });

    console.log(`📊 Users with any customerId: ${usersWithAnyCustomerId.length}`);
    usersWithAnyCustomerId.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: "${user.customerId}"`);
    });

    // 3. Check for users with empty string customerId
    console.log('\n3. Checking for users with empty string customerId...');
    const usersWithEmptyCustomerId = await prisma.user.findMany({
      where: {
        customerId: ''
      },
      select: {
        id: true,
        email: true,
        customerId: true,
        createdAt: true
      }
    });

    console.log(`📊 Users with empty string customerId: ${usersWithEmptyCustomerId.length}`);
    usersWithEmptyCustomerId.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: "${user.customerId}"`);
    });

    // 4. Check for users with whitespace-only customerId
    console.log('\n4. Checking for users with whitespace-only customerId...');
    const usersWithWhitespaceCustomerId = await prisma.user.findMany({
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

    const whitespaceUsers = usersWithWhitespaceCustomerId.filter((user: any) => 
      user.customerId && user.customerId.trim() === ''
    );

    console.log(`📊 Users with whitespace-only customerId: ${whitespaceUsers.length}`);
    whitespaceUsers.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, CustomerID: "${user.customerId}"`);
    });

    // 5. Fix the issue by clearing problematic customerIds
    console.log('\n5. Fixing problematic customerIds...');
    
    const usersToFix = [
      ...usersWithEmptyCustomerId,
      ...whitespaceUsers
    ];

    if (usersToFix.length > 0) {
      console.log(`🔄 Found ${usersToFix.length} users to fix:`);
      
      for (const user of usersToFix) {
        console.log(`   Fixing user: ${user.email} (CustomerID: "${user.customerId}")`);
        
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
      console.log('✅ No users need fixing');
    }

    // 6. Test user creation after fix
    console.log('\n6. Testing user creation after fix...');
    try {
      const testUser = await prisma.user.create({
        data: {
          id: 'kp_test_' + Date.now(),
          email: 'test_' + Date.now() + '@example.com',
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

  } catch (error) {
    console.error('❌ Error in fixHiddenCustomerId:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHiddenCustomerId(); 