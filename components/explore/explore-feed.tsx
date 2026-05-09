"use client";

import { PostCard } from "@/components/post-card";
import { Post } from "@/components/feed";
import { useState, useEffect } from "react";

interface ExploreFeedProps {
  initialPosts: Post[];
  currentUserId?: string;
}

export function ExploreFeed({ initialPosts, currentUserId }: ExploreFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  return (
    <div className="divide-y divide-zinc-800 pb-20">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={post.authorId === currentUserId}
            currentUserId={currentUserId}
            onDelete={(deletedId) => {
              setPosts((prev) => prev.filter((p) => p.id !== deletedId));
            }}
          />
        ))
      ) : (
        <div className="flex h-[40vh] items-center justify-center px-4 text-center">
          <p className="text-base text-zinc-500 sm:text-lg">
            No posts found.
          </p>
        </div>
      )}
    </div>
  );
}
