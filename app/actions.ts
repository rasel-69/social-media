"use server";


import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(content: string) {
  if (!content.trim()) return;

  // For demo purposes, we'll use a hardcoded user or create one if not exists
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
      content,
      authorId: user.id,
    },
  });

  revalidatePath("/");
}
