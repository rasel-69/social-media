"use client";

import { TrendingUp, MessageSquare, MoreHorizontal } from "lucide-react";

// For a real app, this data would come from an API/Database based on trending hashtags or topics.
// We are using a mock list styled similarly to X's trending page.
const trendingTopics = [
  { category: "Technology · Trending", tag: "#React19", posts: "45.2K", description: "The new React compiler is here." },
  { category: "Programming · Trending", tag: "#Rust", posts: "28.1K", description: "Memory safety without garbage collection." },
  { category: "Web Development · Trending", tag: "#NextJS", posts: "19.4K", description: "Server components in action." },
  { category: "Software Engineering · Trending", tag: "#TypeScript", posts: "15.8K", description: "Type-safe JavaScript." },
  { category: "AI · Trending", tag: "#OpenAI", posts: "112K", description: "New model announcements." },
  { category: "Design · Trending", tag: "#UIUX", posts: "8.3K", description: "Latest design trends." },
];

export function ExploreTrending() {
  return (
    <div className="flex flex-col pb-20">
      {/* Header Area for Trending could go here if we wanted a hero section */}
      <div className="relative h-48 w-full bg-gradient-to-r from-emerald-900/40 via-zinc-800 to-teal-900/40 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-extrabold text-white">What&apos;s happening</h2>
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        {trendingTopics.map((topic, idx) => (
          <div key={idx} className="flex items-start justify-between p-4 transition-colors hover:bg-zinc-950/50 cursor-pointer group">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <span>{idx + 1} · {topic.category}</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                {topic.tag}
              </h3>
              {topic.description && (
                <p className="text-sm text-zinc-400">
                  {topic.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                <MessageSquare className="h-3 w-3" />
                <span>{topic.posts} posts</span>
              </div>
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
