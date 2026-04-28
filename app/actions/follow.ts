"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSuggestedUsersQuery, getUserFollowersQuery, getUserFollowingQuery } from "@/lib/follow-queries";

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

export async function checkMultipleFollowStatus(targetUserIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || targetUserIds.length === 0) return {};

  const follows = await prisma.follow.findMany({
    where: {
      followerId: session.user.id,
      followingId: { in: targetUserIds },
    },
    select: { followingId: true },
  });

  const followMap: Record<string, boolean> = {};
  targetUserIds.forEach(id => followMap[id] = false);
  follows.forEach(f => followMap[f.followingId] = true);

  return followMap;
}

export async function getSuggestedUsers(limit: number = 5) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return getSuggestedUsersQuery(session?.user.id, limit);
}

export async function getUserFollowers(userId: string) {
  return getUserFollowersQuery(userId);
}

export async function getUserFollowing(userId: string) {
  return getUserFollowingQuery(userId);
}
