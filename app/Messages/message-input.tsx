"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Loader2, Mic, StopCircle, Trash2 } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { sendMessage } from "@/app/actions/message";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "sonner";

interface MessageInputProps {
  conversationId: string;
  onMessageSent: (message: any) => void;
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = async () => {
    if ((!content.trim() && !audioBlob) || isSending || isUploading) return;

    setIsSending(true);
    let currentAudioUrl = undefined;

    try {
      if (audioBlob) {
        setIsUploading(true);
        const file = new File([audioBlob], "audio_message.webm", { type: "audio/webm" });
        const uploadRes = await uploadFiles("audioUploader", {
          files: [file],
        });
        currentAudioUrl = uploadRes[0].url;
        setIsUploading(false);
      }

      const result = await sendMessage(conversationId, content, currentAudioUrl);
      
      if (result.success) {
        setContent("");
        setAudioBlob(null);
        setRecordingTime(0);
        onMessageSent(result.message);
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.focus();
        }
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
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
        {!isRecording && !audioBlob && (
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-full transition shrink-0"
          >
            <Smile className="w-6 h-6" />
          </button>
        )}

        {isRecording ? (
          <div className="flex-1 flex items-center gap-3 px-3 py-2 text-emerald-400 font-medium">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm">Recording... {formatTime(recordingTime)}</span>
            <button 
              onClick={cancelRecording}
              className="ml-auto p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-full transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={stopRecording}
              className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition"
            >
              <StopCircle className="w-6 h-6" />
            </button>
          </div>
        ) : audioBlob ? (
          <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Mic className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-bold">Audio recorded ({formatTime(recordingTime)})</span>
            <button 
              onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
              className="ml-auto p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-full transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Aa"
            className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent py-2 px-2 text-white placeholder-zinc-500 focus:outline-none scrollbar-hide"
            rows={1}
          />
        )}

        {!isRecording && !audioBlob && content.trim() === "" ? (
          <button
            onClick={startRecording}
            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-full transition shrink-0"
          >
            <Mic className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={(!content.trim() && !audioBlob) || isSending || isUploading}
            className={`p-2 rounded-full shrink-0 transition ${
              (content.trim() || audioBlob) && !isSending && !isUploading
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "text-zinc-500 cursor-not-allowed"
            }`}
          >
            {isSending || isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
