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


export async function deletePost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found");

  if (post.authorId !== session.user.id) {
    throw new Error("You can only delete your own posts");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/");
  return { success: true };
}


export async function updatePost(postId: string, content: string) {
  if (!content.trim()) return;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found");

  if (post.authorId !== session.user.id) {
    throw new Error("You can only edit your own posts");
  }

  await prisma.post.update({
    where: { id: postId },
    data: { content },
  });

  revalidatePath("/");
  return { success: true };
}









