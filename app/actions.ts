"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createPost(content: string, image?: string) {
  if (!content.trim() && !image) return;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to post.");
  }

  try {
    await prisma.post.create({
      data: {
        content: content,
        image: image || null,
        authorId: session.user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in createPost:", error);
    throw error;
  }
}