"use client";

import { Button } from "@/components/ui/button";

const trendingTopics = [
  { tag: "#React19", posts: "45.2K" },
  { tag: "#Rust", posts: "28.1K" },
  { tag: "#NextJS", posts: "19.4K" },
  { tag: "#TypeScript", posts: "15.8K" },
];

const suggestedUsers = [
  { name: "User 1", username: "@dev_user1", initials: "U1" },
  { name: "User 2", username: "@dev_user2", initials: "U2" },
  { name: "User 3", username: "@dev_user3", initials: "U3" },
];

export function RightSidebar() {
  return (
    <aside className="hidden md:block lg:col-span-3 px-4 py-5 lg:px-5 h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
      <div className="space-y-5">
        {/* Trending */}
        <div className="rounded-3xl bg-zinc-950 p-5">
          <h2 className="mb-5 text-xl font-bold lg:text-2xl">
            Trending in Tech
          </h2>

          <div className="space-y-5">
            {trendingTopics.map((topic) => (
              <div key={topic.tag}>
                <p className="text-xs text-zinc-500">Trending</p>
                <h3 className="text-base font-bold lg:text-lg">
                  {topic.tag}
                </h3>
                <p className="text-sm text-zinc-500">
                  {topic.posts} posts
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Who To Follow */}
        <div className="rounded-3xl bg-zinc-950 p-5">
          <h2 className="mb-5 text-xl font-bold lg:text-2xl">
            Who to follow
          </h2>

          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-emerald-400">
                    {user.initials}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold">{user.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {user.username}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="rounded-full bg-white text-black hover:bg-zinc-200 border-none h-8 px-4 font-bold">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
