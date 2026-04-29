"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageInput } from "./message-input";
import { getMessages, markAsRead } from "@/app/actions/message";
import { Loader2, Info } from "lucide-react";
import { format } from "date-fns";

interface ChatAreaProps {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  onMessageAdded: (msg: any) => void;
}

export function ChatArea({ conversationId, currentUserId, otherUser, onMessageAdded }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // Fetch initial messages
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialMessages = async () => {
      setIsLoading(true);
      const data = await getMessages(conversationId);
      if (isMounted) {
        setMessages(data);
        if (data.length > 0) {
          setLastMessageId(data[data.length - 1].id);
        }
        setIsLoading(false);
        markAsRead(conversationId);
      }
    };
    
    fetchInitialMessages();
    
    return () => { isMounted = false; };
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    if (!conversationId) return;

    const pollMessages = async () => {
      try {
        const url = new URL("/api/messages/poll", window.location.origin);
        url.searchParams.set("conversationId", conversationId);
        if (lastMessageId) {
          url.searchParams.set("lastMessageId", lastMessageId);
        }

        const res = await fetch(url.toString());
        if (!res.ok) return;
        
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages]);
          setLastMessageId(data.messages[data.messages.length - 1].id);
          
          // Notify parent (layout) to update sidebar
          onMessageAdded(data.messages[data.messages.length - 1]);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [conversationId, lastMessageId, onMessageAdded]);

  const handleNewMessage = (newMessage: any) => {
    setMessages(prev => [...prev, newMessage]);
    setLastMessageId(newMessage.id);
    onMessageAdded(newMessage);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-black/95 backdrop-blur z-10">
        <Link 
          href={`/Profile/${otherUser.username || otherUser.id}`}
          className="flex items-center gap-3 hover:bg-zinc-900 p-1.5 -ml-1.5 rounded-xl transition"
        >
          <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center font-bold text-emerald-400">
            {otherUser.image ? (
              <img src={otherUser.image} alt={otherUser.name} className="h-full w-full object-cover" />
            ) : (
              otherUser.name?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight">{otherUser.name}</h2>
            <p className="text-xs text-zinc-400">@{otherUser.username || "user"}</p>
          </div>
        </Link>
        <button className="h-10 w-10 rounded-full hover:bg-zinc-900 flex items-center justify-center text-emerald-400 transition">
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="h-24 w-24 rounded-full bg-zinc-900 overflow-hidden mb-4 border-4 border-zinc-800 flex items-center justify-center font-bold text-emerald-400 text-3xl">
              {otherUser.image ? (
                <img src={otherUser.image} alt={otherUser.name} className="h-full w-full object-cover" />
              ) : (
                otherUser.name?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{otherUser.name}</h3>
            <p className="text-zinc-500 text-sm max-w-xs">
              You are friends. Send a message to start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUserId;
              const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId === currentUserId);
              
              // Simple time grouping
              const msgDate = new Date(msg.createdAt);
              const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
              const showTime = !prevMsgDate || (msgDate.getTime() - prevMsgDate.getTime() > 30 * 60 * 1000);

              return (
                <div key={msg.id} className="flex flex-col">
                  {showTime && (
                    <div className="text-center text-xs text-zinc-500 my-4">
                      {format(msgDate, "MMM d, h:mm a")}
                    </div>
                  )}
                  <div className={`flex gap-2 max-w-[75%] ${isMe ? "self-end" : "self-start"}`}>
                    {!isMe && (
                      <div className="w-8 shrink-0 flex items-end pb-1">
                        {showAvatar && (
                          <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden">
                            {otherUser.image ? (
                              <img src={otherUser.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-emerald-400">
                                {otherUser.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words ${
                        isMe 
                          ? "bg-emerald-500 text-black rounded-br-sm" 
                          : "bg-zinc-800 text-white rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                  
                  {isMe && index === messages.length - 1 && msg.isRead && (
                    <div className="text-xs text-zinc-500 self-end mt-1 mr-2">Seen</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} onMessageSent={handleNewMessage} />
    </div>
  );
}
