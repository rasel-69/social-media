"use client";

import { useEffect, useState } from "react";
import { getUserFriends } from "@/app/actions/friend";
import { Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Friend {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
}

interface ProfileFriendsListProps {
  userId: string;
}

export function ProfileFriendsList({ userId }: ProfileFriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        const data = await getUserFriends(userId);
        setFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-zinc-500">Loading friends...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
          <UserIcon className="h-8 w-8 text-zinc-700" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
        <p className="text-zinc-500">When they add friends, they&apos;ll show up here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {friends.map((friend) => (
        <div key={friend.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl transition hover:border-zinc-700">
          <Link href={`/Profile/${friend.username || friend.id}`} className="shrink-0">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-800 flex items-center justify-center font-bold text-emerald-400 text-xl relative">
              {friend.image ? (
                <Image src={friend.image} alt={friend.name} fill className="object-cover" />
              ) : (
                friend.name?.[0]?.toUpperCase() || "?"
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/Profile/${friend.username || friend.id}`} className="font-bold text-white hover:underline truncate block text-lg">
              {friend.name}
            </Link>
            <p className="text-sm text-zinc-500 truncate">@{friend.username || "user"}</p>
          </div>
          <button 
            onClick={() => router.push(`/Profile/${friend.username || friend.id}`)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition"
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}
