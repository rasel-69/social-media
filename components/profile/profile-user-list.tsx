"use client";

import { useEffect, useState } from "react";
import { getUserFollowers, getUserFollowing, checkIsFollowing } from "@/app/actions/follow";
import { UserFollowCard } from "@/components/user-follow-card";
import { Loader2 } from "lucide-react";

interface ProfileUserListProps {
  userId: string;
  type: "followers" | "following";
  currentUserId?: string;
}

export function ProfileUserList({ userId, type, currentUserId }: ProfileUserListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        let fetchedUsers = [];
        if (type === "followers") {
          fetchedUsers = await getUserFollowers(userId);
        } else {
          fetchedUsers = await getUserFollowing(userId);
        }

        // Now we need to determine if the CURRENT logged-in user is following each of these users
        // If there's no current user, they are not following anyone.
        const usersWithFollowState = await Promise.all(
          fetchedUsers.map(async (user) => {
            const isFollowing = currentUserId && currentUserId !== user.id 
              ? await checkIsFollowing(user.id) 
              : false;
            
            return {
              ...user,
              isFollowing,
            };
          })
        );

        setUsers(usersWithFollowState);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [userId, type, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p>No {type} found.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800 p-4">
      {users.map((user) => (
        <UserFollowCard 
          key={user.id} 
          user={user} 
          initialIsFollowing={user.isFollowing} 
        />
      ))}
    </div>
  );
}
