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
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
            name: user.given_name + " " + user.family_name,
            image: user.picture,
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
    
    // If it's a unique constraint error, try to handle it gracefully
    if ((error as any).code === 'P2002') {
      console.log('⚠️  Unique constraint violation. Attempting to resolve conflict...');
      
      // Try to find the user by email and update their ID if needed
      if (user.email) {
        try {
          const existingUserByEmail = await prisma.user.findUnique({ 
            where: { email: user.email } 
          });
          
          if (existingUserByEmail) {
            console.log('🔄 Found user by email, updating user info...');
            // Update the existing user's info (but keep the original ID)
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.given_name + " " + user.family_name,
                image: user.picture,
              },
            });
            console.log('✅ User info updated successfully');
            return { success: true };
          }
        } catch (updateError) {
          console.error('❌ Error updating user ID:', updateError);
        }
      }
      
      // If we can't resolve by email, try to find by customerId
      console.log('🔍 Attempting to find user by other criteria...');
      try {
        // Check if there's a user with the same email but different ID
        const allUsers = await prisma.user.findMany({
          where: { email: user.email || '' }
        });
        
        if (allUsers.length > 0) {
          console.log('🔄 Found conflicting users, attempting to merge...');
          // Keep the first user and update it (but don't change the ID)
          const userToKeep = allUsers[0];
          await prisma.user.update({
            where: { id: userToKeep.id },
            data: {
              email: user.email!,
              name: user.given_name + " " + user.family_name,
              image: user.picture,
            },
          });
          console.log('✅ User merged successfully');
          return { success: true };
        }
      } catch (mergeError) {
        console.error('❌ Error merging users:', mergeError);
      }
    }
    
    return { success: false, error: (error as any).message };
  }
}
