"use client";

import { MoreHorizontal, Trash2, Edit3, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deletePost, updatePost } from "@/app/actions";

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
  isOwner?: boolean;
}

export function PostCard({ post, isOwner }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isPending, startTransition] = useTransition();

  const displayName = post.author.name || post.author.username || "Unknown User";
  const initials = post.author.name?.[0] || post.author.username?.[0] || "?";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    startTransition(async () => {
      try {
        await deletePost(post.id);
        setShowMenu(false);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete post. Please try again.");
      }
    });
  };

  const handleUpdate = async () => {
    if (!editedContent.trim() || editedContent === post.content) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        await updatePost(post.id, editedContent);
        setIsEditing(false);
      } catch (error) {
        console.error("Update failed:", error);
        alert("Failed to update post. Please try again.");
      }
    });
  };

  return (
    <div className="border-b border-zinc-800 p-4 lg:p-5 transition hover:bg-zinc-950/50">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400 uppercase">
          {initials}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between relative">
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

            {/* Actions Menu - Only visible if isOwner is true */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-zinc-500 hover:text-emerald-400 rounded-full p-1 transition hover:bg-emerald-500/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {showMenu && (
                  <>
                    {/* Overlay to close menu when clicking outside */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />

                    <div className="absolute right-0 mt-2 w-36 rounded-xl border border-zinc-800 bg-black shadow-2xl z-20 overflow-hidden py-1">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-900 transition"
                        onClick={() => {
                          setEditedContent(post.content);
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                      >
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                      <button
                        disabled={isPending}
                        onClick={handleDelete}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-900 transition disabled:opacity-50"
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                autoFocus
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full bg-zinc-900/50 text-white p-4 rounded-2xl border border-zinc-800 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none min-h-[120px] shadow-inner"
                placeholder="What's on your mind?"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(post.content);
                  }}
                  className="px-5 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  disabled={isPending || !editedContent.trim()}
                  onClick={handleUpdate}
                  className="bg-emerald-500 hover:bg-emerald-400 px-6 py-2 rounded-full text-black text-sm font-bold disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-white leading-normal whitespace-pre-wrap">
              {post.content}
            </p>
          )}

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