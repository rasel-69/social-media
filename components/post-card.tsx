import { MoreHorizontal } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      name: string | null;
      username: string;
      image: string | null;
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="border-b border-zinc-800 p-4 lg:p-5 transition hover:bg-zinc-950/50">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400">
          {post.author.name?.[0] || post.author.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white hover:underline cursor-pointer">
                {post.author.name || post.author.username}
              </span>
              <span className="text-zinc-500 text-sm">@{post.author.username}</span>
              <span className="text-zinc-500 text-sm">·</span>
              <span className="text-zinc-500 text-sm">
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
        </div>
      </div>
    </div>
  );
}
