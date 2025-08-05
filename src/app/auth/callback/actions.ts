"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function checkAuthStatus() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return { success: false };

  try {
    console.log('🔍 Checking auth status for user:', user.id, 'Email:', user.email);
    
    // First, try to find user by ID
    let existingUser = await prisma.user.findUnique({ where: { id: user.id } });

    // If not found by ID, try to find by email
    if (!existingUser && user.email) {
      existingUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (existingUser) {
        console.log('📧 Found existing user by email, updating ID...');
      }
    }

    // sign up
    if (!existingUser) {
      console.log('✅ Creating new user with ID:', user.id, 'Email:', user.email);
      
      // Double-check that no user exists with this email or ID
      const conflictingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: user.id },
            { email: user.email! }
          ]
        }
      });
      
      if (conflictingUser) {
        console.log('⚠️  Found conflicting user, updating instead of creating');
        await prisma.user.update({
          where: { id: conflictingUser.id },
          data: {
            email: user.email!,
            name: user.given_name + " " + user.family_name,
            image: user.picture,
          },
        });
      } else {
        // Use upsert to handle potential constraint violations gracefully
        // This will create if not exists, or update if exists
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email!,
            name: user.given_name + " " + user.family_name,
            image: user.picture,
          },
          create: {
            id: user.id,
            email: user.email!,
            name: user.given_name + " " + user.family_name,
            image: user.picture,
            // Don't set customerId - let it be undefined/null by default
            // customerId will only be set when user purchases subscription via webhook
          },
        });
        console.log('✅ New user created successfully');
      }
    } else {
      console.log('🔄 Updating existing user with ID:', existingUser.id);
      // Update existing user with latest info, but preserve customerId if it exists
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: user.email!,
          name: user.given_name + " " + user.family_name,
          image: user.picture,
        },
      });
      console.log('✅ Existing user updated successfully');
    }



    return { success: true };
  } catch (error) {
    console.error('❌ Error in checkAuthStatus:', error);
    
    // If it's a unique constraint error, try one more approach
    if ((error as any).code === 'P2002') {
      console.log('⚠️  Unique constraint violation. Trying alternative approach...');
      
      try {
        // Try to find and update existing user by email
        const existingUser = await prisma.user.findUnique({ 
          where: { email: user.email! } 
        });
        
        if (existingUser) {
          console.log('✅ Found existing user by email, updating...');
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.given_name + " " + user.family_name,
              image: user.picture,
            },
          });
          return { success: true };
        }
      } catch (fallbackError) {
        console.error('❌ Fallback approach also failed:', fallbackError);
      }
    }
    
    return { success: false, error: (error as any).message };
  }
}
