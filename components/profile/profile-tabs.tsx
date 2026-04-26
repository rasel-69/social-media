"use client";

import { useState } from "react";
import { ProfileFeed } from "./profile-feed";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, LayoutGrid, UserCircle, Image as ImageIcon, Users } from "lucide-react";

interface ProfileTabsProps {
  user: any;
  isOwnProfile: boolean;
  currentUserId?: string;
}

type TabType = "All" | "About" | "Photos" | "Friends";

export function ProfileTabs({ user, isOwnProfile, currentUserId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const tabs: { name: TabType; icon: any }[] = [
    { name: "All", icon: LayoutGrid },
    { name: "About", icon: UserCircle },
    { name: "Photos", icon: ImageIcon },
    { name: "Friends", icon: Users },
  ];

  return (
    <div className="w-full">
      <div className="flex border-b border-zinc-800 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-bold transition hover:bg-zinc-900 ${
                activeTab === tab.name ? "text-white" : "text-zinc-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
              {activeTab === tab.name && (
                <div className="absolute bottom-0 h-1 w-full rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
        {isOwnProfile && (
          <button
            onClick={handleLogout}
            className="flex min-w-[100px] flex-1 items-center justify-center gap-2 py-4 text-sm font-bold text-red-500 transition hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        )}
      </div>

      <div className="p-0">
        {activeTab === "All" && (
          <ProfileFeed userId={user.id} type="all" currentUserId={currentUserId} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === "About" && (
          <div className="p-8 text-center text-zinc-500">
             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                <UserCircle className="h-8 w-8 text-emerald-500" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">About {user.name || "User"}</h3>
             <p className="max-w-md mx-auto">This user hasn't added a bio yet. Stay tuned for more details!</p>
          </div>
        )}
        {activeTab === "Photos" && (
          <ProfileFeed userId={user.id} type="photos" currentUserId={currentUserId} isOwnProfile={isOwnProfile} />
        )}
        {activeTab === "Friends" && (
          <div className="p-8 text-center text-zinc-500">
             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                <Users className="h-8 w-8 text-emerald-500" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Friends</h3>
             <p>Friend list feature coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
