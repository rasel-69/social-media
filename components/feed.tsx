"use client";

import { Code2, Menu, Image as ImageIcon, X, Smile } from "lucide-react";
import { PostCard } from "./post-card";
import { useState, useTransition, useRef } from "react";
import { createPost } from "@/app/actions";
import { useUploadThing } from "@/lib/uploadthing";
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });


import { Post as PrismaPost, Reaction, User as PrismaUser } from "@/lib/generated/prisma/client";

export type Post = PrismaPost & {
    author: {
        name: string | null;
        username: string | null;
        image: string | null;
    };
    reactions: Reaction[];
};

interface FeedProps {
    initialPosts: Post[];
    currentUserId?: string; // Pass the logged-in user's ID
}


export function Feed({ initialPosts, currentUserId }: FeedProps) {
    const [content, setContent] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            alert("Failed to upload image. Please try again.");
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
        if ((!content.trim() && !image) || isPending || isUploading) return;

        startTransition(async () => {
            await createPost(content, image || undefined);
            setContent("");
            setImage(null);
            setShowEmojiPicker(false);
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

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
        }, 0);
    };





    return (
        <section className="lg:col-span-6 lg:border-r lg:border-zinc-800 h-full overflow-y-auto pb-16 lg:pb-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-black/90 px-4 py-4 backdrop-blur lg:px-5">
                <div className="flex items-center gap-3">
                    <button className="rounded-full p-2 hover:bg-zinc-900 lg:hidden">
                        <Menu className="h-5 w-5" />
                    </button>

                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400 lg:hidden">
                    0
                </div>
            </header>

            {/* Create Post */}
            <div className="border-b border-zinc-800 px-4 py-4 lg:px-5">
                <div className="flex gap-3">
                    <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-slate-800 font-bold text-emerald-400 sm:flex">
                        0
                    </div>

                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening in your mind?"
                            className="min-h-[50px] w-full resize-none bg-transparent text-base outline-none placeholder:text-zinc-500 sm:text-lg"
                        />

                        {/* Image Preview */}
                        {(image || isUploading) && (
                            <div className="relative mt-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
                                {isUploading ? (
                                    <div className="flex h-[150px] w-full flex-col items-center justify-center gap-3 px-10 text-center">
                                        <div className="relative flex h-12 w-12 items-center justify-center">
                                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-400">{uploadProgress}%</span>
                                        </div>
                                        <p className="text-xs font-medium text-zinc-400">Uploading...</p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={removeImage}
                                            className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1 text-white backdrop-blur-sm transition hover:bg-black/80"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <img
                                            src={image!}
                                            alt="Preview"
                                            className="max-h-[300px] w-full object-cover"
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
                            <div className="flex items-center gap-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isPending}
                                    className="rounded-full p-2 text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-50"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                </button>
                                <button className="rounded-full p-2 text-emerald-400 transition hover:bg-emerald-500/10">
                                    <Code2 className="h-5 w-5" />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`rounded-full p-2 transition ${showEmojiPicker ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                                        title="Add Emoji"
                                    >
                                        <Smile className="h-5 w-5" />
                                    </button>

                                    {showEmojiPicker && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setShowEmojiPicker(false)}
                                            />
                                            <div className="absolute bottom-full left-0 mb-2 z-40 shadow-2xl">
                                                <EmojiPicker
                                                    onEmojiClick={onEmojiClick}
                                                    theme={"dark" as any}
                                                    autoFocusSearch={false}
                                                    width={300}
                                                    height={400}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handlePost}
                                disabled={(!content.trim() && !image) || isPending || isUploading}
                                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                                {isPending ? "Posting..." : isUploading ? "Uploading..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="divide-y divide-zinc-800">
                {initialPosts.length > 0 ? (
                    initialPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            isOwner={post.authorId === currentUserId}
                            currentUserId={currentUserId}
                        />
                    ))
                ) : (
                    <div className="flex h-[40vh] items-center justify-center px-4 text-center">
                        <p className="text-base text-zinc-500 sm:text-lg">
                            No posts yet. Be the first to share!
                        </p>
                    </div>
                )}
            </div>

        </section>


    );
}
