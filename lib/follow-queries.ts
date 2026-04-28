import prisma from "@/lib/db";

export async function getSuggestedUsersQuery(userId: string | undefined, limit: number = 5) {
  if (!userId) {
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
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  // Return users not followed by the current user, excluding themselves
  return prisma.user.findMany({
    where: {
      id: {
        notIn: [...followingIds, userId],
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

export async function getUserFollowersQuery(userId: string) {
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

export async function getUserFollowingQuery(userId: string) {
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
