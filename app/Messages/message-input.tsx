"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Loader2 } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { sendMessage } from "@/app/actions/message";

interface MessageInputProps {
  conversationId: string;
  onMessageSent: (message: any) => void;
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    const result = await sendMessage(conversationId, content);
    
    if (result.success) {
      setContent("");
      onMessageSent(result.message);
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.focus();
      }
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="relative border-t border-zinc-800 bg-black p-4">
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-full right-4 mb-2 z-50">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
        </div>
      )}
      
      <div className="flex items-end gap-2 bg-zinc-900 rounded-2xl p-2 border border-zinc-800 focus-within:border-zinc-700 transition">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-full transition shrink-0"
        >
          <Smile className="w-6 h-6" />
        </button>

        <textarea
          ref={inputRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent py-2 px-2 text-white placeholder-zinc-500 focus:outline-none scrollbar-hide"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className={`p-2 rounded-full shrink-0 transition ${
            content.trim() && !isSending
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "text-zinc-500 cursor-not-allowed"
          }`}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
