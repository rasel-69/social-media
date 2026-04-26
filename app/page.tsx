import { Sidebar } from "@/components/sidebar";
import { Feed } from "@/components/feed";
import { RightSidebar } from "@/components/right-sidebar";
import { Bell, Compass, Home as HomeIcon, Mail, User, LogIn } from "lucide-react";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const posts = await prisma.post.findMany({
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
    },
  });

  const sidebarLinks = [
    { name: "Home", icon: HomeIcon, active: true, href: "/" },
    { name: "Explore", icon: Compass, href: "/Explore" },
    { name: "Notifications", icon: Bell, href: "/Notifications" },
    { name: "Messages", icon: Mail, href: "/Messages" },
    { name: "Profile", icon: User, href: "/Profile" },
  ];

  return (
    <main className="h-screen bg-black text-white overflow-hidden">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 lg:grid-cols-12">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Feed */}
        <Feed initialPosts={posts} currentUserId={session?.user.id} />

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black lg:hidden">
        <div className="grid grid-cols-5 py-2">
          {sidebarLinks.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 ${item.active ? "text-emerald-400" : "text-zinc-400"}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
          
          {session ? (
            <Link
              href="/Profile"
              className="flex flex-col items-center gap-1 py-2 text-zinc-400"
            >
              <User className="h-5 w-5" />
              <span className="text-[10px]">Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center gap-1 py-2 text-emerald-400 font-bold"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-[10px]">Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}