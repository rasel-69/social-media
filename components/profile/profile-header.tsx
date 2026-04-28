"use client";

import { useState, useTransition } from "react";
import { MapPin, Calendar, Link as LinkIcon, Camera, Edit, ArrowLeft } from "lucide-react";
import { User } from "@/lib/generated/prisma/client";
import { useRouter } from "next/navigation";
import { followUser, unfollowUser } from "@/app/actions/follow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileUserList } from "./profile-user-list";

interface ProfileHeaderProps {
  user: any; // Using any for now to include _count
  isOwnProfile: boolean;
  initialIsFollowing?: boolean;
  currentUserId?: string;
}

export function ProfileHeader({ user, isOwnProfile, initialIsFollowing = false, currentUserId }: ProfileHeaderProps) {
  const router = useRouter();
  const displayName = user.name || user.username || "User";
  const username = user.username || user.id;
  const initials = displayName[0].toUpperCase();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">("followers");

  const openModal = (type: "followers" | "following") => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleToggleFollow = () => {
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
        setIsFollowing(!newValue);
      }
    });
  };

  return (
    <div className="relative border-b border-zinc-800">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 flex items-center gap-6 bg-black/80 px-4 py-2 backdrop-blur-md">
        <button 
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-zinc-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-xs text-zinc-500">{user._count?.posts || 0} posts</p>
        </div>
      </div>

      {/* Cover Image */}
      <div className="h-48 w-full bg-gradient-to-r from-emerald-900/40 via-zinc-900 to-emerald-900/40 lg:h-64 relative group">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
           {isOwnProfile && <Camera className="text-white h-8 w-8" />}
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="px-4 pb-4">
        <div className="relative -mt-16 mb-4 flex items-end justify-between lg:-mt-20">
          <div className="relative h-32 w-32 rounded-full border-4 border-black bg-zinc-900 lg:h-40 lg:w-40 overflow-hidden shadow-2xl">
            {user.image ? (
              <img src={user.image} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-800 text-4xl font-bold text-emerald-400 uppercase">
                {initials}
              </div>
            )}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="text-white h-6 w-6" />
              </div>
            )}
          </div>

          <div className="mb-2">
            {isOwnProfile ? (
              <button className="rounded-full border border-zinc-700 px-6 py-2 text-sm font-bold transition hover:bg-zinc-900">
                Edit Profile
              </button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                className={`rounded-full px-6 py-2 text-sm font-bold transition ${
                  isFollowing
                    ? "border-zinc-700 bg-transparent text-white hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                }`}
                onClick={handleToggleFollow}
                disabled={isPending}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white lg:text-3xl">{displayName}</h1>
          <p className="text-zinc-500">@{username}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          {/* Add placeholders for location/website if needed */}
        </div>

        <div className="mt-4 flex gap-6">
          <div 
            onClick={() => openModal("following")}
            className="flex items-center gap-1 cursor-pointer hover:underline"
          >
            <span className="font-bold text-white">{user._count?.following || 0}</span>
            <span className="text-zinc-500">Following</span>
          </div>
          <div 
            onClick={() => openModal("followers")}
            className="flex items-center gap-1 cursor-pointer hover:underline"
          >
            <span className="font-bold text-white">{user._count?.followers || 0}</span>
            <span className="text-zinc-500">Followers</span>
          </div>
        </div>
      </div>

      {/* Followers/Following Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-zinc-800">
          <DialogHeader className="p-4 border-b border-zinc-800">
            <DialogTitle className="text-center text-xl font-bold">
              {modalType === "followers" ? "Followers" : "Following"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
            <ProfileUserList 
              userId={user.id} 
              type={modalType} 
              currentUserId={currentUserId} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
