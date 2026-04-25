"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image?: string) {
  if (!content.trim() && !image) return;

  try {
    let user = await prisma.user.findUnique({
      where: { username: "06378384" },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Dev_06378",
          username: "06378384",
          email: "dev@example.com",
        },
      });
    }

    await prisma.post.create({
      data: {
        content: content,
        image: image || null, // Ensure there is no { after this line
        authorId: user.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in createPost:", error);
    throw error;
  }
}