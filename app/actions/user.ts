"use server"; // Force rebuild after client regeneration

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  bio?: string;
  study?: string;
  work?: string;
  address?: string;
  name?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Basic validation
  if (data.name !== undefined && data.name.trim() === "") {
    throw new Error("Name cannot be empty");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.study !== undefined && { study: data.study }),
      ...(data.work !== undefined && { work: data.work }),
      ...(data.address !== undefined && { address: data.address }),
    },
  });

  revalidatePath(`/profile/${updatedUser.username || updatedUser.id}`);
  revalidatePath("/");

  return { success: true, user: updatedUser };
}
