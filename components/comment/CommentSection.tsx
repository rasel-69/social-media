"use client";

import { useEffect, useState } from "react";
import { getComments, createComment, updateComment, deleteComment } from "@/app/actions";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { Loader2 } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
  onCommentCountChange?: (count: number) => void;
  onClose?: () => void;
}

export function CommentSection({ postId, currentUserId, onCommentCountChange, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
      if (onCommentCountChange) {
        // Calculate total comments including replies
        const total = data.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
        onCommentCountChange(total);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCreateComment = async (content: string) => {
    await createComment(content, postId);
    await fetchComments();
  };

  const handleReply = async (parentId: string, content: string) => {
    await createComment(content, postId, parentId);
    await fetchComments();
  };

  const handleEdit = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
    await fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    await fetchComments();
  };

  return (
    <div className="pt-4 border-t border-zinc-800/50">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4 px-2">Comments</h3>
      
      <div className="px-2 mb-6">
        <CommentForm onSubmit={handleCreateComment} onCancel={onClose} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        </div>
      ) : comments.length > 0 ? (
        <div className="flex flex-col gap-2 px-2">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-zinc-500">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}
