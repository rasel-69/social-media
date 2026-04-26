"use client";

import { useState, useRef, useTransition, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import {
  X,
  Image as ImageIcon,
  Smile,
  Code2,
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2 // Added for loading state
} from "lucide-react";
import { createPost } from "@/app/actions";
import { useUploadThing } from "@/lib/uploadthing";
import { authClient } from "@/lib/auth-client"; // Import authClient
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Get session data
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  // Protect the route: If not logged in and not loading, redirect to login
  useEffect(() => {
    if (!isSessionLoading && !session) {
      router.push("/login?callbackURL=/Post/new");
    }
  }, [session, isSessionLoading, router]);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      setImage(res[0].ufsUrl);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      alert("Failed to upload image.");
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onUploadProgress: (p) => {
      setUploadProgress(p);
    },
  });


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await startUpload([file]);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !image) return;
    if (isUploading || !session) return;

    startTransition(async () => {
      try {
        const result = await createPost(content, image || undefined);
        if (result?.success) {
          router.push("/");
          router.refresh();
        }
      } catch (error) {
        alert("Something went wrong while posting.");
      }
    });
  };

  const onEmojiClick = (emojiData: any) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newContent = before + emojiData.emoji + after;
    setContent(newContent);

    // Set focus back to textarea and move cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
    }, 0);
  };

  // Show a loader while checking session to prevent "flashing" the content
  if (isSessionLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-black/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 transition hover:bg-zinc-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">New Post</h1>
        </div>
        <button
          onClick={handlePost}
          disabled={(!content.trim() && !image) || isPending || isUploading}
          className="rounded-full bg-emerald-500 px-6 py-1.5 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Posting..." : isUploading ? "Uploading..." : "Post"}
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex gap-4">
          {/* Dynamic Avatar using session data */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400 uppercase">
            {session.user.name?.[0] || "U"}
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[150px] w-full resize-none bg-transparent py-2 text-xl outline-none placeholder:text-zinc-600"
              autoFocus
            />

            {(image || isUploading) && (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
                {isUploading ? (
                  <div className="flex h-[200px] w-full flex-col items-center justify-center gap-4 px-10 text-center">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
                      <span className="text-xs font-bold text-emerald-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full max-w-xs overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 bg-emerald-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-zinc-400">Uploading to cloud...</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={removeImage}
                      className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/80"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <img
                      src={image!}
                      alt="Preview"
                      className="max-h-[400px] w-full object-cover"
                    />
                  </>
                )}
              </div>
            )}

            <div className="mt-8 border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full p-2.5 text-emerald-500 transition hover:bg-emerald-500/10"
                    title="Add Image"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button className="rounded-full p-2.5 text-emerald-500 transition hover:bg-emerald-500/10">
                    <Code2 className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`rounded-full p-2.5 transition ${showEmojiPicker ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                      title="Add Emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </button>

                    {showEmojiPicker && (
                      <>
                        <div
                          className="fixed inset-0 z-[60]"
                          onClick={() => setShowEmojiPicker(false)}
                        />
                        <div className="absolute bottom-full left-0 mb-2 z-[70] shadow-2xl">
                          <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme={"dark" as any}
                            autoFocusSearch={false}
                            width={320}
                            height={400}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <button className="rounded-full p-2.5 text-emerald-500 transition hover:bg-emerald-500/10">
                    <Calendar className="h-5 w-5" />
                  </button>
                  <button className="rounded-full p-2.5 text-emerald-500 transition hover:bg-emerald-500/10">
                    <MapPin className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`h-6 w-6 rounded-full border-2 border-zinc-800 flex items-center justify-center text-[10px] ${content.length > 280 ? 'text-red-500' : 'text-zinc-500'}`}>
                    {content.length > 0 && 280 - content.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePostPage;