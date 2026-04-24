import { Sidebar } from "@/components/sidebar";
import { Feed } from "@/components/feed";
import { RightSidebar } from "@/components/right-sidebar";
import { Bell, Compass, Home as HomeIcon, Mail, User } from "lucide-react";
import prisma from "@/lib/db";

export default async function Home() {
  // Fetch posts from database
  // In a real app, you'd handle authentication and fetch relevant posts
  // For now, let's just fetch all posts or return empty if none
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
    { name: "Home", icon: HomeIcon, active: true },
    { name: "Explore", icon: Compass },
    { name: "Notifications", icon: Bell },
    { name: "Messages", icon: Mail },
    { name: "Profile", icon: User },
  ];

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-12">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Feed */}
        <Feed initialPosts={posts} />

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black lg:hidden">
        <div className="grid grid-cols-5 py-2">

          {sidebarLinks.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`flex flex-col items-center gap-1 py-2 ${item.active ? "text-emerald-400" : "text-zinc-400"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}