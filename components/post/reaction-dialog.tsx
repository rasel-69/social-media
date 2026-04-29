"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPostReactions } from "@/app/actions";
import { Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface ReactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

export function ReactionDialog({ isOpen, onOpenChange, postId }: ReactionDialogProps) {
  const [reactions, setReactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    if (isOpen) {
      const fetchReactions = async () => {
        setIsLoading(true);
        const data = await getPostReactions(postId);
        setReactions(data);
        setIsLoading(false);
      };
      fetchReactions();
    }
  }, [isOpen, postId]);

  const reactionTypes = [
    { type: "LIKE", emoji: "👍", color: "text-blue-500" },
    { type: "LOVE", emoji: "❤️", color: "text-red-500" },
    { type: "HAHA", emoji: "😂", color: "text-yellow-500" },
    { type: "CARE", emoji: "🥰", color: "text-pink-500" },
    { type: "SAD", emoji: "😢", color: "text-blue-400" },
  ];

  const filteredReactions = activeTab === "ALL" 
    ? reactions 
    : reactions.filter(r => r.type === activeTab);

  const getEmojiByType = (type: string) => {
    return reactionTypes.find(r => r.type === type)?.emoji || "👍";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[450px] rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-zinc-900">
          <DialogTitle className="text-lg font-bold">People who reacted</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-zinc-900 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === "ALL" ? "border-emerald-500 text-emerald-500" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
          >
            All {reactions.length}
          </button>
          {reactionTypes.map(r => {
            const count = reactions.filter(react => react.type === r.type).length;
            if (count === 0) return null;
            return (
              <button 
                key={r.type}
                onClick={() => setActiveTab(r.type)}
                className={`px-4 py-3 text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === r.type ? "border-emerald-500 text-emerald-500" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
              >
                <span>{r.emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm text-zinc-500">Loading reactions...</p>
            </div>
          ) : filteredReactions.length > 0 ? (
            <div className="space-y-1">
              {filteredReactions.map((reaction) => (
                <Link 
                  key={reaction.id}
                  href={`/Profile/${reaction.user.username || reaction.user.id}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition group"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-emerald-400">
                        {reaction.user.image ? (
                          <img src={reaction.user.image} alt={reaction.user.name} className="h-full w-full object-cover" />
                        ) : (
                          reaction.user.name?.[0] || "?"
                        )}
                      </div>
                      <div className="absolute -right-1 -bottom-1 bg-zinc-950 rounded-full p-0.5 text-sm">
                        {getEmojiByType(reaction.type)}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:underline">{reaction.user.name}</p>
                      <p className="text-xs text-zinc-500">@{reaction.user.username || "user"}</p>
                    </div>
                  </div>
                  
                  <button className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-1.5 rounded-full transition">
                    View Profile
                  </button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-zinc-500">No reactions here yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
