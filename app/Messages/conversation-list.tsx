"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Edit, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: any[];
  activeId?: string;
  onSelect: (conv: any) => void;
  isMobile?: boolean;
}

export function ConversationList({ conversations, activeId, onSelect, isMobile = false }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(c => 
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.user.username && c.user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-black border-r border-zinc-800 w-full lg:w-[350px] shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <button className="h-9 w-9 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-emerald-400 transition">
            <Edit className="h-4 w-4" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Messenger"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-4 text-zinc-500 text-sm mt-4">
            {searchQuery ? "No results found." : "No conversations yet."}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = activeId === conv.id && !isMobile;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left ${
                    isActive ? "bg-zinc-900/80" : "hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center font-bold text-emerald-400 shrink-0">
                      {conv.user.image ? (
                        <img src={conv.user.image} alt={conv.user.name} className="h-full w-full object-cover" />
                      ) : (
                        conv.user.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={`text-[15px] truncate ${conv.unreadCount > 0 ? "font-bold text-white" : "font-medium text-zinc-200"}`}>
                        {conv.user.name}
                      </h3>
                      {conv.lastMsgAt && (
                        <span className="text-xs text-zinc-500 shrink-0 ml-2">
                          {formatShortTime(new Date(conv.lastMsgAt))}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold text-white" : "text-zinc-500"}`}>
                        {conv.lastMessage || "Started a chat"}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatShortTime(date: Date) {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  
  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
