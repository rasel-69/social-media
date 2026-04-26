import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs"

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
          },
        },
      },
    });
  }

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user.id === user.id;

  return (
    <main className="h-screen bg-black text-white overflow-hidden">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 lg:grid-cols-12">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Profile Content */}
        <div className="col-span-1 h-full overflow-y-auto border-r border-zinc-800 lg:col-span-6 pb-20 lg:pb-0 scrollbar-hide">
          <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
          <ProfileTabs user={user} isOwnProfile={isOwnProfile} currentUserId={session?.user.id} />
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </main>
  );
}
