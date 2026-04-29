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

  // If post is already gone, consider it a success
  if (!post) return { success: true };

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


export async function toggleReaction(postId: string, type: string = "LIKE") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const existingReaction = await prisma.reaction.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
  });

  if (existingReaction) {
    if (existingReaction.type === type) {
      // If same type, remove it (unlike)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      // If different type, update it
      await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type },
      });
    }
  } else {
    // Create new reaction
    await prisma.reaction.create({
      data: {
        postId,
        userId: session.user.id,
        type,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        reactions: true,
        sharedPost: {
          include: {
            author: {
              select: {
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    throw error;
  }
}

// ----- COMMENT ACTIONS -----

export async function createComment(content: string, postId: string, parentId?: string) {
  if (!content.trim()) throw new Error("Comment cannot be empty");
  if (content.length > 500) throw new Error("Comment is too long");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      parentId: parentId || null,
      authorId: session.user.id,
    },
    include: {
      author: {
        select: { name: true, username: true, image: true }
      }
    }
  });

  revalidatePath("/");
  return { success: true, comment };
}

export async function updateComment(commentId: string, content: string) {
  if (!content.trim()) throw new Error("Comment cannot be empty");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== session.user.id) throw new Error("You can only edit your own comments");

  await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) throw new Error("Comment not found");
  if (comment.authorId !== session.user.id) throw new Error("You can only delete your own comments");

  // This will cascade delete replies due to relation rules or we handle it if cascade isn't set.
  // Wait, our Prisma schema has `onDelete: Cascade`? Let's check schema. We didn't add onDelete: Cascade to replies. 
  // For safety, we can delete the comment itself. Since we didn't specify cascade, we might need to delete replies manually.
  await prisma.comment.deleteMany({
    where: { parentId: commentId }
  });

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getComments(postId: string) {
  const comments = await prisma.comment.findMany({
    where: { 
      postId,
      parentId: null, // Top level comments
    },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { name: true, username: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, username: true, image: true } }
        }
      }
    }
  });
  return comments;
}

// ----- SHARE ACTIONS -----

export async function createShare(postId: string, content?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // Create a record in the Share table for analytics/counts
  await prisma.share.create({
    data: {
      postId,
      sharerId: session.user.id,
    }
  });

  // Create a new post that appears in the feed and references the original post
  const sharePost = await prisma.post.create({
    data: {
      content: content || null,
      authorId: session.user.id,
      sharedPostId: postId,
    },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      sharedPost: {
        include: {
          author: {
            select: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      reactions: true,
    }
  });

  revalidatePath("/");
  return { success: true, sharePost };
}

export async function updateUserProfileImage(imageUrl: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  revalidatePath("/");
  // Since we don't know the exact username from the session object (it might be in session.user but better to be safe)
  // Revalidating the base profile and root is usually enough, but let's try to be specific.
  return { success: true };
}

export async function updateUserCoverImage(imageUrl: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { coverImage: imageUrl },
  });

  revalidatePath("/");
  return { success: true };
}
