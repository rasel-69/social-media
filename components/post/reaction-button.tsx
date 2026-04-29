"use client";

import { useState, useRef, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleReaction } from "@/app/actions";

interface ReactionButtonProps {
  postId: string;
  reactions: any[];
  currentUserId?: string;
}

export function ReactionButton({ postId, reactions, currentUserId }: ReactionButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasReacted = reactions.some(r => r.userId === currentUserId);
  const userReaction = reactions.find(r => r.userId === currentUserId);

  const reactionTypes = [
    { type: "LIKE", label: "Like", emoji: "👍", color: "text-blue-500" },
    { type: "LOVE", label: "Love", emoji: "❤️", color: "text-red-500" },
    { type: "HAHA", label: "Haha", emoji: "😂", color: "text-yellow-500" },
    { type: "CARE", label: "Care", emoji: "🥰", color: "text-pink-500" },
    { type: "SAD", label: "Sad", emoji: "😢", color: "text-blue-400" },
  ];

  const currentReaction = reactionTypes.find(r => r.type === userReaction?.type) || reactionTypes[0];

  const handleToggle = async (type: string = "LIKE") => {
    if (!currentUserId) return;
    startTransition(async () => {
      try {
        await toggleReaction(postId, type);
        setShowMenu(false);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const onEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowMenu(true), 500);
  };

  const onLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowMenu(false), 500);
  };

  return (
    <div className="flex-1 relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {showMenu && (
        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-30">
          {reactionTypes.map((r) => (
            <button
              key={r.type}
              onClick={() => handleToggle(r.type)}
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
        onClick={() => handleToggle(hasReacted ? userReaction?.type : "LIKE")}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 transition hover:bg-zinc-900 ${hasReacted ? currentReaction.color : 'text-zinc-500 hover:text-white'}`}
      >
        {hasReacted ? (
          <span className="text-xl">{currentReaction.emoji}</span>
        ) : (
          <Heart className="h-5 w-5" />
        )}
        <span className="font-semibold">{hasReacted ? currentReaction.label : "Like"}</span>
      </button>
    </div>
  );
}
