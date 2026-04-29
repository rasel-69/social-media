"use client";

import { useState, useTransition, useRef } from "react";
import { Share2, Smile, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createShare } from "@/app/actions";
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    content: string | null;
    author: {
      username: string | null;
    };
  };
  currentUser: {
    name: string | null;
    username: string | null;
    image: string | null;
  };
  onSuccess: () => void;
}

export function ShareDialog({ isOpen, onOpenChange, post, currentUser, onSuccess }: ShareDialogProps) {
  const [shareCaption, setShareCaption] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayName = currentUser.name || currentUser.username || "Unknown User";
  const initials = currentUser.name?.[0] || currentUser.username?.[0] || "?";

  const onEmojiClick = (emojiData: any) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newContent = before + emojiData.emoji + after;
    setShareCaption(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
    }, 0);
  };

  const handleShare = async () => {
    startTransition(async () => {
      try {
        const res = await createShare(post.id, shareCaption);
        if (res.success) {
          onSuccess();
          onOpenChange(false);
          setShareCaption("");
          setShowEmojiPicker(false);
          toast.success("Shared to your feed!");
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to share post");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px] rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-500" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 font-bold text-emerald-400 overflow-hidden">
              {currentUser.image ? (
                <img src={currentUser.image} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="font-bold text-sm">{displayName}</p>
              <p className="text-xs text-zinc-500">Sharing to your feed</p>
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
              placeholder="Say something about this..."
              className="min-h-[100px] bg-zinc-900/50 border-zinc-800 focus:ring-emerald-500/20 focus:border-emerald-500/50 resize-none rounded-xl pr-10"
            />
            <div className="absolute right-2 top-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`rounded-full p-1.5 transition ${showEmojiPicker ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800'}`}
              >
                <Smile className="h-5 w-5" />
              </button>

              {showEmojiPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                  <div className="absolute top-full right-0 mt-2 z-50 shadow-2xl">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      theme={"dark" as any}
                      autoFocusSearch={false}
                      width={300}
                      height={350}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900/10 opacity-70">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold">@{post.author.username}</span>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2">{post.content}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              setShowEmojiPicker(false);
            }}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleShare}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full px-8 shadow-lg shadow-emerald-500/20"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Share Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
