"use client";

import { useEffect, useState, useTransition } from "react";
import { getNotifications, markNotificationsAsRead } from "@/app/actions";
import { Loader2, Heart, MessageCircle, Share2, Reply, Bell } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NotificationListProps {
  initialNotifications: any[];
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Mark notifications as read when the page is opened
    const markAsRead = async () => {
      await markNotificationsAsRead();
    };
    markAsRead();
  }, []);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-zinc-700" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
        <p className="text-zinc-500 max-w-xs">When people like, comment on, or share your posts, you'll see them here.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE": return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
      case "COMMENT": return <MessageCircle className="h-4 w-4 text-blue-500 fill-blue-500" />;
      case "REPLY": return <Reply className="h-4 w-4 text-emerald-500" />;
      case "SHARE": return <Share2 className="h-4 w-4 text-emerald-500" />;
      default: return <Bell className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getMessage = (type: string) => {
    switch (type) {
      case "LIKE": return "liked your post";
      case "COMMENT": return "commented on your post";
      case "REPLY": return "replied to your comment";
      case "SHARE": return "shared your post";
      default: return "interacted with you";
    }
  };

  return (
    <div className="divide-y divide-zinc-800">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`flex gap-3 p-4 hover:bg-zinc-900/50 transition cursor-pointer group ${!notification.isRead ? 'bg-emerald-500/5' : ''}`}
        >
          {/* Actor Avatar */}
          <Link href={`/Profile/${notification.actor.username || notification.actorId}`} className="shrink-0 pt-1">
            <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
              {notification.actor.image ? (
                <img src={notification.actor.image} alt={notification.actor.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-emerald-400">
                  {notification.actor.name?.[0] || "?"}
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(notification.type)}
                  <p className="text-sm text-zinc-400">
                    <Link href={`/Profile/${notification.actor.username || notification.actorId}`} className="font-bold text-white hover:underline">
                      {notification.actor.name || notification.actor.username}
                    </Link>{" "}
                    {getMessage(notification.type)}
                  </p>
                </div>

                {notification.post?.content && (
                  <p className="text-sm text-zinc-500 line-clamp-2 italic mb-1 px-2 border-l-2 border-zinc-800">
                    "{notification.post.content}"
                  </p>
                )}

                <span className="text-xs text-zinc-600">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {!notification.isRead && (
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
