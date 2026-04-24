"use client";

import { Code2, Menu } from "lucide-react";
import { PostCard } from "./post-card";
import { useState, useTransition } from "react";
import { createPost } from "@/app/actions";

interface Post {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        name: string | null;
        username: string;
        image: string | null;
    };
}

interface FeedProps {
    initialPosts: Post[];
}

export function Feed({ initialPosts }: FeedProps) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    const handlePost = async () => {
        if (!content.trim() || isPending) return;
        
        startTransition(async () => {
            await createPost(content);
            setContent("");
        });
    };

    return (
        <section className="lg:col-span-6 lg:border-r lg:border-zinc-800">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-black/90 px-4 py-4 backdrop-blur lg:px-5">
                <div className="flex items-center gap-3">
                    <button className="rounded-full p-2 hover:bg-zinc-900 lg:hidden">
                        <Menu className="h-5 w-5" />
                    </button>

                    <h1 className="text-xl font-bold lg:text-2xl">Home</h1>
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
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening in your codebase?"
                            className="min-h-[100px] w-full resize-none bg-transparent text-base outline-none placeholder:text-zinc-500 sm:text-lg"
                        />

                        <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
                            <button className="rounded-full p-2 text-emerald-400 transition hover:bg-emerald-500/10">
                                <Code2 className="h-5 w-5" />
                            </button>

                            <button 
                                onClick={handlePost}
                                disabled={!content.trim() || isPending}
                                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                                {isPending ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="divide-y divide-zinc-800">
                {initialPosts.length > 0 ? (
                    initialPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
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
