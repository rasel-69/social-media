"use client";

import Link from "next/link";

interface SharedPostProps {
  post: {
    id: string;
    content: string | null;
    image: string | null;
    createdAt: Date | string;
    author: {
      name: string | null;
      username: string | null;
      image: string | null;
    };
    authorId: string;
  };
}

export function SharedPost({ post }: SharedPostProps) {
  const authorInitials = post.author.name?.[0] || post.author.username?.[0] || "?";

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 transition p-4">
      <Link href={`/Profile/${post.author.username || post.authorId}`} className="flex items-center gap-2 mb-2 group/author">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400 uppercase overflow-hidden ring-1 ring-zinc-800 group-hover/author:ring-emerald-500/50 transition">
          {post.author.image ? (
            <img src={post.author.image} alt={post.author.name || ""} className="h-full w-full object-cover" />
          ) : (
            authorInitials
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-white group-hover/author:underline group-hover/author:text-emerald-400 transition-colors">
            {post.author.name || post.author.username}
          </span>
          <span className="text-xs text-zinc-500">@{post.author.username}</span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs text-zinc-500" suppressHydrationWarning>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </Link>
      <p className="text-sm text-zinc-200 line-clamp-3 mb-2">{post.content}</p>
      {post.image && (
        <div className="overflow-hidden rounded-xl border border-zinc-800/50">
          <img src={post.image} alt="Original post" className="max-h-60 w-full object-cover" />
        </div>
      )}
    </div>
  );
}
