
import { MainLayout } from "@/components/main-layout";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { checkIsFollowing } from "@/app/actions/follow";
import { getFriendStatus } from "@/app/actions/friend";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Try to find by username, if not found try by ID
  let user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          friendships1: true,
          friendships2: true,
        },
      },
    },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: { id: username },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            friendships1: true,
            friendships2: true,
          },
        },
      },
    });
  }

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user.id === user.id;
  const initialIsFollowing = !isOwnProfile && session ? await checkIsFollowing(user.id) : false;
  const friendStatus = !isOwnProfile && session ? await getFriendStatus(user.id) : "NONE";

  return (
    <MainLayout>
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} initialIsFollowing={initialIsFollowing} initialFriendStatus={friendStatus} currentUserId={session?.user.id} />
      <ProfileTabs user={user} isOwnProfile={isOwnProfile} currentUserId={session?.user.id} />
    </MainLayout>
  );
}
