"use client";

import { Home as HomeIcon, Compass, Bell, Mail, User, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const links = [
    { name: "Home", icon: HomeIcon, href: "/" },
    { name: "Explore", icon: Compass, href: "/Explore" },
    { name: "Notifications", icon: Bell, href: "/Notifications" },
    { name: "Messages", icon: Mail, href: "/Messages" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black lg:hidden">
      <div className="grid grid-cols-5 py-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 ${isActive ? "text-emerald-400" : "text-zinc-400"}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "fill-emerald-400/10" : ""}`} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}

        {session ? (
          <Link
            href={`/Profile/${(session.user as any).username || session.user.id}`}
            className={`flex flex-col items-center gap-1 py-2 ${pathname.startsWith("/Profile") ? "text-emerald-400" : "text-zinc-400"}`}
          >
            <div className={`flex h-5 w-5 items-center justify-center rounded-full overflow-hidden ${pathname.startsWith("/Profile") ? "ring-1 ring-emerald-400" : "bg-zinc-800"}`}>
              {session.user.image ? (
                <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className={`h-full w-full p-0.5 ${pathname.startsWith("/Profile") ? "fill-emerald-400/10" : ""}`} />
              )}
            </div>
            <span className="text-[10px]">Profile</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center gap-1 py-2 text-emerald-400 font-bold"
          >
            <LogIn className="h-5 w-5" />
            <span className="text-[10px]">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
