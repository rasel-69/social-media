"use client";

import { MoreHorizontal, Trash2, Edit3, Loader2, Heart, MessageCircle, Share2 } from "lucide-react";
import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { deletePost, updatePost, toggleReaction, createShare } from "@/app/actions";
import { CommentSection } from "./comment/CommentSection";
import { Post } from "./feed";

interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  currentUserId?: string;
}

export function PostCard({ post, isOwner, currentUserId }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isPending, startTransition] = useTransition();
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState((post as any)._count?.comments || (post as any).comments?.length || 0);
  const [shareCount, setShareCount] = useState((post as any)._count?.shares || (post as any).shares?.length || 0);
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const hasReacted = post.reactions.some(r => r.userId === currentUserId);
  const currentUserReaction = post.reactions.find(r => r.userId === currentUserId);
  const reactionCount = post.reactions.length;

  const reactions = [
    { type: "LIKE", label: "Like", emoji: "👍", color: "text-blue-500" },
    { type: "LOVE", label: "Love", emoji: "❤️", color: "text-red-500" },
    { type: "HAHA", label: "Haha", emoji: "😂", color: "text-yellow-500" },
    { type: "CARE", label: "Care", emoji: "🥰", color: "text-pink-500" },
    { type: "SAD", label: "Sad", emoji: "😢", color: "text-blue-400" },
  ];

  const currentReactionData = reactions.find(r => r.type === currentUserReaction?.type) || reactions[0];

  const handleToggleReaction = async (type: string = "LIKE") => {
    if (!currentUserId) return;

    startTransition(async () => {
      try {
        await toggleReaction(post.id, type);
        setShowReactionMenu(false);
      } catch (error) {
        console.error("Reaction failed:", error);
      }
    });
  };

  const handleMouseEnter = () => {
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionMenu(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionMenu(false);
    }, 500);
  };

  return (
    <div className="border-b border-zinc-800 p-4 lg:p-5 transition hover:bg-zinc-950/50">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/Profile/${post.author.username || post.authorId}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400 uppercase hover:opacity-80 transition">
          {initials}
        </Link>

        <div className="flex-1">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-1">
              <Link href={`/Profile/${post.author.username || post.authorId}`} className="font-bold text-white hover:underline">
                {displayName}
              </Link>
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

          {/* Reactions & Stats Info */}
          {(reactionCount > 0 || commentCount > 0 || shareCount > 0) && (
            <div className="mt-4 flex items-center justify-between px-1">
              {reactionCount > 0 ? (
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="flex -space-x-1.5">
                    {/* Show top 3 reaction emojis with cleaner styling */}
                    {Array.from(new Set(post.reactions.map(r => r.type))).slice(0, 3).map((type) => (
                      <div key={type} className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-[11px] shadow-sm">
                        {reactions.find(r => r.type === type)?.emoji}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-zinc-500 font-medium hover:underline hover:text-zinc-400 transition-colors">
                    {reactionCount}
                  </span>
                </div>
              ) : (
                <div />
              )}
              <div className="flex gap-3 text-xs text-zinc-600 font-medium">
                {commentCount > 0 && (
                  <button
                    onClick={() => setShowComments((prev) => !prev)}
                    className="hover:underline hover:text-zinc-400 transition-colors"
                  >
                    {commentCount} comments
                  </button>
                )}
                {shareCount > 0 && <span>{shareCount} shares</span>}
              </div>
            </div>
          )}

          {/* Action Buttons - Single line separator for a professional feel */}
          <div className="mt-3 flex items-center gap-1 border-t border-zinc-900 pt-1.5 relative">
            <div
              className="flex-1 relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {showReactionMenu && (
                <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-30">
                  {reactions.map((r) => (
                    <button
                      key={r.type}
                      onClick={() => handleToggleReaction(r.type)}
                      className="group/emoji relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-125 hover:-translate-y-1 active:scale-95"
                    >
                      <span className="text-2xl">{r.emoji}</span>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-zinc-800 px-2 py-1 text-[10px] font-bold text-white transition-all group-hover/emoji:scale-100">
                        {r.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleToggleReaction(hasReacted ? currentUserReaction?.type : "LIKE")}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 transition hover:bg-zinc-900 ${hasReacted ? currentReactionData.color : 'text-zinc-500 hover:text-white'}`}
              >
                {hasReacted ? (
                  <span className="text-xl">{currentReactionData.emoji}</span>
                ) : (
                  <Heart className="h-5 w-5" />
                )}
                <span className="font-semibold">{hasReacted ? currentReactionData.label : "Like"}</span>
              </button>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Comment</span>
            </button>

            <button
              onClick={async () => {
                try {
                  const res = await createShare(post.id);
                  if (res.success) setShareCount((prev: number) => prev + 1);
                } catch (e) {
                  console.error(e);
                }
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
            >
              <Share2 className="h-5 w-5" />
              <span className="font-semibold">Share</span>
            </button>
          </div>

          {showComments && (
            <CommentSection
              postId={post.id}
              currentUserId={currentUserId}
              onCommentCountChange={setCommentCount}
              onClose={() => setShowComments(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}