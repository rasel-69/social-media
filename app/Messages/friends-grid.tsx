"use client";

import { Search, MessageSquare, MoreHorizontal, User } from "lucide-react";
import { useState } from "react";

interface Friend {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
}

interface FriendsGridProps {
  friends: Friend[];
  onStartChat: (friendId: string) => void;
  isStartingChat?: boolean;
}

export function FriendsGrid({ friends, onStartChat, isStartingChat }: FriendsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (f.username && f.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black">
      {/* Header with Search */}
      <div className="p-6 md:p-8 border-b border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Messages</h1>
            <p className="text-zinc-500 mt-1">Chat with your friends and stay connected.</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/50 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Your Friends</span>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-16 w-16 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-700 mb-4">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No friends found</h3>
            <p className="text-zinc-500 text-sm mt-1">Try searching for someone else or add more friends.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredFriends.map((friend) => (
              <div 
                key={friend.id}
                onClick={() => !isStartingChat && onStartChat(friend.id)}
                className="group relative bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/30 rounded-3xl p-5 transition-all duration-300 cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors"></div>
                
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-4">
                    <div className="h-20 w-20 rounded-full bg-zinc-800 p-0.5 ring-2 ring-zinc-800 group-hover:ring-emerald-500/50 transition-all duration-300 overflow-hidden flex items-center justify-center shadow-xl">
                      {friend.image ? (
                        <img src={friend.image} alt={friend.name} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <span className="text-2xl font-black text-emerald-400">
                          {friend.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Status Indicator (Mock) */}
                    <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-lg ring-2 ring-emerald-500/20 animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate w-full">
                    {friend.name}
                  </h3>
                  <p className="text-zinc-500 text-xs mb-6 truncate w-full">
                    @{friend.username || "user"}
                  </p>
                  
                  <button 
                    className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-emerald-500 text-zinc-300 hover:text-black font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    <MessageSquare className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                    <span>Chat Now</span>
                  </button>
                </div>
                
                <button className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
