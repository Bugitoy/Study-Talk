import prisma from "@/db/prisma";

/**
 * Set a user's Stripe customer ID with uniqueness validation
 */
export async function setUserCustomerId(userId: string, customerId: string) {
  try {
    // Check if this customerId is already assigned to another user
    const existingUser = await prisma.user.findFirst({
      where: {
        customerId: customerId,
        id: { not: userId } // Exclude the current user
      }
    });

    if (existingUser) {
      throw new Error(`Customer ID ${customerId} is already assigned to user ${existingUser.email}`);
    }

    // Update the user's customerId
    await prisma.user.update({
      where: { id: userId },
      data: { customerId: customerId }
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting customer ID:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Clear a user's Stripe customer ID (when subscription is cancelled)
 */
export async function clearUserCustomerId(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { customerId: null }
    });

    return { success: true };
  } catch (error) {
    console.error('Error clearing customer ID:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get user by Stripe customer ID
 */
export async function getUserByCustomerId(customerId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { customerId: customerId }
    });

    return user;
  } catch (error) {
    console.error('Error getting user by customer ID:', error);
    return null;
  }
}

/**
 * Validate that a customer ID is unique
 */
export async function validateCustomerIdUniqueness(customerId: string, excludeUserId?: string) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        customerId: customerId,
        ...(excludeUserId && { id: { not: excludeUserId } })
      }
    });

    return !existingUser; // Return true if unique, false if already exists
  } catch (error) {
    console.error('Error validating customer ID uniqueness:', error);
    return false;
  }
} 