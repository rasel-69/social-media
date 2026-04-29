"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User } from "@/lib/auth-types";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as User | undefined;

  useEffect(() => {
    if (!isPending && session) {
      router.replace(`/Profile/${user?.username || session.user.id}`);
    }
  }, [session, isPending, user, router]);

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-2xl font-bold text-zinc-500">
        {session ? "Redirecting to your profile..." : "Please login to view your profile"}
      </h1>
    </div>
  );
}




