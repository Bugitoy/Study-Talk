"use server";

import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function checkAuthStatus() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return { success: false };

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: user.id } });

    // sign up
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.given_name + " " + user.family_name,
          image: user.picture,
        },
      });
    } else {
      // Update existing user with latest info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email!,
          name: user.given_name + " " + user.family_name,
          image: user.picture,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error in checkAuthStatus:', error);
    return { success: false, error: (error as any).message };
  }
}
