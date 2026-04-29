"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "./conversation-list";
import { ChatArea } from "./chat-area";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

interface MessagesLayoutProps {
  initialConversations: any[];
  currentUserId: string;
}

export function MessagesLayout({ initialConversations, currentUserId }: MessagesLayoutProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectConversation = (conv: any) => {
    if (isMobile) {
      router.push(`/Messages/${conv.id}`);
    } else {
      setActiveConversation(conv);
      // Mark as read locally
      setConversations(prev => 
        prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
      );
    }
  };

  const handleMessageAdded = (msg: any) => {
    // Update conversation list with latest message
    setConversations(prev => {
      const newConvs = [...prev];
      const index = newConvs.findIndex(c => c.id === msg.conversationId);
      
      if (index !== -1) {
        const conv = newConvs[index];
        conv.lastMessage = msg.content;
        conv.lastMsgAt = msg.createdAt;
        // Move to top
        newConvs.splice(index, 1);
        newConvs.unshift(conv);
      }
      return newConvs;
    });
  };

  return (
    <div className="flex h-full w-full bg-black overflow-hidden relative">
      {/* Sidebar - Always visible on desktop, visible on mobile only if no chat active */}
      <div className={`h-full shrink-0 ${isMobile ? 'w-full' : 'w-[350px]'}`}>
        <ConversationList 
          conversations={conversations} 
          activeId={activeConversation?.id} 
          onSelect={handleSelectConversation}
          isMobile={isMobile}
        />
      </div>

      {/* Main Chat Area - Hidden on mobile entirely (uses separate route) */}
      {!isMobile && (
        <div className="flex-1 h-full min-w-0 bg-black flex flex-col relative">
          {activeConversation ? (
            <ChatArea 
              key={activeConversation.id} // Force remount on conversation change
              conversationId={activeConversation.id}
              currentUserId={currentUserId}
              otherUser={activeConversation.user}
              onMessageAdded={handleMessageAdded}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-emerald-500 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <MessageSquare className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
              <p className="text-zinc-500 max-w-sm">
                Select a conversation from the sidebar or start a new chat with a friend.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
