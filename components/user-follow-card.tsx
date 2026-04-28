"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/app/actions/follow";
import { UserCircle } from "lucide-react";
import Link from "next/link";

interface UserFollowCardProps {
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  initialIsFollowing?: boolean;
  currentUserId?: string;
}

export function UserFollowCard({ user, initialIsFollowing = false, currentUserId }: UserFollowCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggleFollow = () => {
    // Optimistic update
    const newValue = !isFollowing;
    setIsFollowing(newValue);

    startTransition(async () => {
      try {
        if (newValue) {
          await followUser(user.id);
        } else {
          await unfollowUser(user.id);
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
        // Revert optimistic update on error
        setIsFollowing(!newValue);
      }
    });
  };

  const displayName = user.name || user.username || "User";
  const displayUsername = user.username || user.id.substring(0, 8);
  const initials = displayName[0]?.toUpperCase() || "U";

  return (
    <div className="flex items-center justify-between py-2">
      <Link href={`/Profile/${user.username || user.id}`} className="flex items-center gap-3 group">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-sm font-bold text-emerald-400 border border-zinc-800 group-hover:border-emerald-500/50 transition-colors">
          {user.image ? (
            <img src={user.image} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-bold group-hover:underline">{displayName}</h3>
          <p className="text-xs text-zinc-500">@{displayUsername}</p>
        </div>
      </Link>

      {currentUserId !== user.id && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          className={`h-8 rounded-full px-4 text-xs font-bold transition-all ${
            isFollowing
              ? "border-zinc-700 bg-transparent text-white hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
          onClick={handleToggleFollow}
          disabled={isPending}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
