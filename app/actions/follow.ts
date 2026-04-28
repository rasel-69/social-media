"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function followUser(targetUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");
  if (session.user.id === targetUserId) throw new Error("Cannot follow yourself");

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  });

  revalidatePath("/");
  revalidatePath(`/Profile`);
  return { success: true };
}

export async function unfollowUser(targetUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  });

  revalidatePath("/");
  revalidatePath(`/Profile`);
  return { success: true };
}

export async function checkIsFollowing(targetUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return false;

  const follow = await prisma.follow.findFirst({
    where: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  });

  return !!follow;
}

export async function getSuggestedUsers(limit: number = 5) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    // If not logged in, just return some random users
    return prisma.user.findMany({
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get users the current user is already following
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  // Return users not followed by the current user, excluding themselves
  return prisma.user.findMany({
    where: {
      id: {
        notIn: [...followingIds, session.user.id],
      },
    },
    take: limit,
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserFollowers(userId: string) {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return followers.map(f => f.follower);
}

export async function getUserFollowing(userId: string) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return following.map(f => f.following);
}
