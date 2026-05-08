"use client";

import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Post } from "../feed";

interface ProfilePhotosGridProps {
  posts: Post[];
  currentUserId?: string;
}

export function ProfilePhotosGrid({ posts, currentUserId }: ProfilePhotosGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-zinc-500">
        No photos shared yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-1 p-1">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/Post/${post.id}`}
          className="group relative aspect-square overflow-hidden rounded-sm bg-zinc-900 transition-all hover:z-10"
        >
          {post.image && (
            <img
              src={post.image}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-4 text-white">
            <div className="flex items-center gap-1.5">
              <Heart className="h-5 w-5 fill-white" />
              <span className="text-sm font-bold">{post.reactions.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-5 w-5 fill-white" />
              <span className="text-sm font-bold">
                {(post as any)._count?.comments || 0}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
