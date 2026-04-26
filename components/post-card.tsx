import { MoreHorizontal } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image?: string | null;
    createdAt: Date;
    author: {
      name: string | null;
      username: string | null;
      image: string | null;
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  const displayName = post.author.name || post.author.username || "Unknown User";
  const initials = post.author.name?.[0] || post.author.username?.[0] || "?";

  return (
    <div className="border-b border-zinc-800 p-4 lg:p-5 transition hover:bg-zinc-950/50">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400 uppercase">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white hover:underline cursor-pointer">
                {displayName}
              </span>
              <span className="text-zinc-500 text-sm">@{post.author.username || "user"}</span>
              <span className="text-zinc-500 text-sm">·</span>
              <span className="text-zinc-500 text-sm" suppressHydrationWarning>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button className="text-zinc-500 hover:text-emerald-400 rounded-full p-1 transition hover:bg-emerald-500/10">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-white leading-normal whitespace-pre-wrap">
            {post.content}
          </p>
          {post.image && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800">
              <img
                src={post.image}
                alt="Post attachment"
                className="max-h-[512px] w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
