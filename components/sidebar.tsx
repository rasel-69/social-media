"use client";

import {
  Bell,
  Compass,
  Home as HomeIcon,
  Mail,
  MoreHorizontal,
  Terminal,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  { name: "Home", icon: HomeIcon, href: "/" },
  { name: "Explore", icon: Compass, href: "/explore" },
  { name: "Notifications", icon: Bell, href: "/notifications" },
  { name: "Messages", icon: Mail, href: "/messages" },
  { name: "Profile", icon: User, href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:col-span-3 lg:flex lg:flex-col lg:justify-between lg:border-r lg:border-zinc-800 lg:px-5 lg:py-5">
      <div>
        <Link href="/" className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500 text-emerald-400">
          <Terminal className="h-5 w-5" />
        </Link>

        <nav className="space-y-1">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left transition ${
                  active
                    ? "font-semibold text-white"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${active ? "text-emerald-400" : ""}`}
                />
                <span className="text-xl">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button className="mt-6 w-full rounded-full bg-emerald-500 py-3 text-lg font-bold text-black transition hover:bg-emerald-400">
          Post
        </button>
      </div>

      <div className="flex items-center justify-between rounded-full p-3 transition hover:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400">
            0
          </div>

          <div>
            <h3 className="text-sm font-bold">Dev_06378</h3>
            <p className="text-xs text-zinc-400">@06378384</p>
          </div>
        </div>

        <MoreHorizontal className="h-4 w-4 text-zinc-400" />
      </div>
    </aside>
  );
}
