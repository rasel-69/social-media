import { MainLayout } from "@/components/main-layout";
import {
  getSuggestedFriends,
  getIncomingFriendRequests,
  getSentFriendRequests,
} from "@/app/actions/friend";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ExploreUserCard } from "./explore-user-card";
import { FriendRequestCard } from "./friend-request-card";
import { SentRequestCard } from "./sent-request-card";

export default async function ExplorePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch all three data sets in parallel for performance
  const [suggestedUsers, incomingRequests, sentRequests] = await Promise.all([
    getSuggestedFriends(),
    getIncomingFriendRequests(),
    getSentFriendRequests(),
  ]);

  const hasAnyContent =
    suggestedUsers.length > 0 ||
    incomingRequests.length > 0 ||
    sentRequests.length > 0;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-black">
        <div className="sticky top-0 z-20 bg-black/80 px-4 py-4 backdrop-blur-md border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Explore</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Find and connect with people</p>
        </div>

        <div className="p-4 lg:p-6 space-y-8">
          {/* ── Section 1: Incoming Friend Requests ── */}
          {incomingRequests.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Friend Requests
                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-emerald-500 text-black text-xs font-bold">
                      {incomingRequests.length}
                    </span>
                  </h3>
                  <p className="text-zinc-500 text-sm">
                    People who want to connect with you
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {incomingRequests.map((req) => (
                  <FriendRequestCard
                    key={req.user.id}
                    user={req.user}
                    createdAt={req.createdAt}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Section 2: Sent Requests (Pending) ── */}
          {sentRequests.length > 0 && (
            <section>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Sent Requests
                  <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                    {sentRequests.length}
                  </span>
                </h3>
                <p className="text-zinc-500 text-sm">
                  People you&apos;ve sent friend requests to
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sentRequests.map((req) => (
                  <SentRequestCard
                    key={req.user.id}
                    user={req.user}
                    createdAt={req.createdAt}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Divider between requests and suggestions ── */}
          {(incomingRequests.length > 0 || sentRequests.length > 0) &&
            suggestedUsers.length > 0 && (
              <div className="border-t border-zinc-800" />
            )}

          {/* ── Section 3: People You May Know ── */}
          {suggestedUsers.length > 0 && (
            <section>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">
                  People You May Know
                </h3>
                <p className="text-zinc-500 text-sm">
                  Based on your activity and network
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {suggestedUsers.map((user) => (
                  <ExploreUserCard
                    key={user.id}
                    user={user}
                    currentUserId={session?.user.id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ── */}
          {!hasAnyContent && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No suggestions right now
              </h3>
              <p className="text-zinc-500 max-w-sm">
                We&apos;re looking for more people you might know. Check back
                later!
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
