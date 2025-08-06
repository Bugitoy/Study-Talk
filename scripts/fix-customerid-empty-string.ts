import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixCustomerIdEmptyString() {
  try {
    console.log('🔧 Setting all users customerId to empty string...');
    const users = await prisma.user.findMany({ select: { id: true, email: true, customerId: true } });
    for (const user of users) {
      if (user.customerId !== '') {
        await prisma.user.update({ where: { id: user.id }, data: { customerId: '' } });
        console.log(`✅ Set customerId to empty string for: ${user.email}`);
      }
    }
    console.log('🎉 All users now have customerId as empty string.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCustomerIdEmptyString();