"use client";

import { Loader2, MessageCircle, Share2 } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost, updatePost } from "@/app/actions";
import { CommentSection } from "./comment/CommentSection";
import { Post } from "./feed";
import { authClient } from "@/lib/auth-client";
import { SharedPost } from "./post/shared-post";
import { ShareDialog } from "./post/share-dialog";
import { ReactionButton } from "./post/reaction-button";
import { PostMenu } from "./post/post-menu";

interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, isOwner, currentUserId, onDelete }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content || "");
  const [isPending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState((post as any)._count?.comments || (post as any).comments?.length || 0);
  const [shareCount, setShareCount] = useState((post as any)._count?.shares || (post as any).shares?.length || 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const displayName = post.author.name || post.author.username || "Unknown User";
  const initials = post.author.name?.[0] || post.author.username?.[0] || "?";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    startTransition(async () => {
      try {
        await deletePost(post.id);
        if (onDelete) onDelete(post.id);
      } catch (error) {
        console.error("Delete failed:", error);
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
      }
    });
  };

  return (
    <div className="border-b border-zinc-800 p-4 lg:p-5 transition hover:bg-zinc-950/50">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/Profile/${post.author.username || post.authorId}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400 uppercase hover:opacity-80 transition overflow-hidden">
          {post.author.image ? (
            <img src={post.author.image} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
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

            <PostMenu
              isOwner={!!isOwner}
              isPending={isPending}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                autoFocus
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full bg-zinc-900/50 text-white p-4 rounded-2xl border border-zinc-800 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none min-h-[120px] shadow-inner"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 text-sm font-semibold text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  disabled={isPending || !editedContent.trim()}
                  onClick={handleUpdate}
                  className="bg-emerald-500 hover:bg-emerald-400 px-6 py-2 rounded-full text-black text-sm font-bold disabled:opacity-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-white leading-normal whitespace-pre-wrap">{post.content}</p>
          )}

          {post.image && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800">
              <img src={post.image} alt="Post attachment" className="max-h-[512px] w-full object-cover" />
            </div>
          )}

          {post.sharedPost && <SharedPost post={post.sharedPost as any} />}

          {/* Stats */}
          {(post.reactions.length > 0 || commentCount > 0 || shareCount > 0) && (
            <div className="mt-4 flex items-center justify-between px-1">
              <div className="text-sm text-zinc-500 font-medium">
                {post.reactions.length > 0 && <span>{post.reactions.length} reactions</span>}
              </div>
              <div className="flex gap-3 text-xs text-zinc-600 font-medium">
                {commentCount > 0 && <button onClick={() => setShowComments(!showComments)} className="hover:underline">{commentCount} comments</button>}
                {shareCount > 0 && <span>{shareCount} shares</span>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-1 border-t border-zinc-900 pt-1.5 relative">
            <ReactionButton postId={post.id} reactions={post.reactions} currentUserId={currentUserId} />

            <button
              onClick={() => {
                if (!session) {
                  router.push("/login?callbackURL=" + window.location.pathname);
                } else {
                  setShowComments(!showComments);
                }
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Comment</span>
            </button>

            <button
              onClick={() => {
                if (!session) {
                  router.push("/login?callbackURL=" + window.location.pathname);
                } else {
                  setIsShareModalOpen(true);
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

      {session?.user && (
        <ShareDialog
          isOpen={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          post={post as any}
          currentUser={session.user as any}
          onSuccess={() => setShareCount((prev: number) => prev + 1)}
        />
      )}
    </div>
  );
}