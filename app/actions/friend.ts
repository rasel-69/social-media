"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export type FriendStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIENDS" | "SELF";

export async function getFriendStatus(targetUserId: string): Promise<FriendStatus> {
  const session = await getSession();
  if (!session) return "NONE";

  const currentUserId = session.user.id;
  if (currentUserId === targetUserId) return "SELF";

  // Check if they are already friends
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId1: currentUserId, userId2: targetUserId },
        { userId1: targetUserId, userId2: currentUserId },
      ],
    },
  });

  if (friendship) return "FRIENDS";

  // Check if there's a pending request sent by the current user
  const sentRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: currentUserId,
      receiverId: targetUserId,
      status: "PENDING",
    },
  });

  if (sentRequest) return "PENDING_SENT";

  // Check if there's a pending request received by the current user
  const receivedRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: targetUserId,
      receiverId: currentUserId,
      status: "PENDING",
    },
  });

  if (receivedRequest) return "PENDING_RECEIVED";

  return "NONE";
}

export async function sendFriendRequest(receiverId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const senderId = session.user.id;
    if (senderId === receiverId) throw new Error("Cannot send request to yourself");

    const status = await getFriendStatus(receiverId);
    if (status !== "NONE") return { success: false, error: "Action not allowed" };

    await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: senderId,
        type: "FRIEND_REQUEST",
      },
    });

    revalidatePath(`/Profile/${receiverId}`);
    revalidatePath(`/Explore`);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending friend request:", error);
    return { success: false, error: "Failed to send request" };
  }
}

export async function acceptFriendRequest(senderId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const receiverId = session.user.id;

    // Find the pending request
    const request = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    if (!request) throw new Error("Request not found");

    // Start a transaction: Update request status and create Friendship
    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: request.id },
        data: { status: "ACCEPTED" },
      }),
      prisma.friendship.create({
        data: {
          userId1: senderId,
          userId2: receiverId,
        },
      }),
      // Delete the friend request notification if it exists
      prisma.notification.deleteMany({
        where: {
          userId: receiverId,
          actorId: senderId,
          type: "FRIEND_REQUEST",
        },
      }),
    ]);

    revalidatePath(`/Profile/${senderId}`);
    revalidatePath(`/Explore`);
    return { success: true };
  } catch (error: any) {
    console.error("Error accepting friend request:", error);
    return { success: false, error: "Failed to accept request" };
  }
}

export async function rejectFriendRequest(senderId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const receiverId = session.user.id;

    const request = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    if (!request) return { success: true };

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: request.id },
        data: { status: "REJECTED" },
      }),
      prisma.notification.deleteMany({
        where: {
          userId: receiverId,
          actorId: senderId,
          type: "FRIEND_REQUEST",
        },
      }),
    ]);

    revalidatePath(`/Profile/${senderId}`);
    revalidatePath(`/Explore`);
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting friend request:", error);
    return { success: false, error: "Failed to reject request" };
  }
}

export async function cancelFriendRequest(receiverId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const senderId = session.user.id;

    const request = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    if (request) {
      await prisma.$transaction([
        prisma.friendRequest.delete({
          where: { id: request.id },
        }),
        prisma.notification.deleteMany({
          where: {
            userId: receiverId,
            actorId: senderId,
            type: "FRIEND_REQUEST",
          },
        }),
      ]);
    }

    revalidatePath(`/Profile/${receiverId}`);
    revalidatePath(`/Explore`);
    return { success: true };
  } catch (error: any) {
    console.error("Error canceling friend request:", error);
    return { success: false, error: "Failed to cancel request" };
  }
}

export async function removeFriend(friendId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const currentUserId = session.user.id;

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId1: currentUserId, userId2: friendId },
          { userId1: friendId, userId2: currentUserId },
        ],
      },
    });

    if (friendship) {
      await prisma.friendship.delete({
        where: { id: friendship.id },
      });
      
      // Also delete the accepted request to keep data clean
      await prisma.friendRequest.deleteMany({
        where: {
          OR: [
             { senderId: currentUserId, receiverId: friendId },
             { senderId: friendId, receiverId: currentUserId }
          ]
        }
      });
    }

    revalidatePath(`/Profile/${friendId}`);
    revalidatePath(`/Explore`);
    return { success: true };
  } catch (error: any) {
    console.error("Error removing friend:", error);
    return { success: false, error: "Failed to remove friend" };
  }
}

export async function getSuggestedFriends() {
  try {
    const session = await getSession();
    if (!session) return [];

    const currentUserId = session.user.id;

    // Get IDs of all current friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId1: currentUserId },
          { userId2: currentUserId },
        ],
      },
    });

    const friendIds = friendships.flatMap((f) => 
      f.userId1 === currentUserId ? [f.userId2] : [f.userId1]
    );

    // Get IDs of people we've sent requests to or received from
    const requests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
    });

    const requestedIds = requests.flatMap((r) => 
      r.senderId === currentUserId ? [r.receiverId] : [r.senderId]
    );

    const excludeIds = [currentUserId, ...friendIds, ...requestedIds];

    // Find users not in the exclude list
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
      take: 20, // Limit to 20 suggestions
      orderBy: { createdAt: 'desc' }
    });

    return suggestedUsers;
  } catch (error) {
    console.error("Error getting suggested friends:", error);
    return [];
  }
}

export async function getIncomingFriendRequests() {
  try {
    const session = await getSession();
    if (!session) return [];

    const currentUserId = session.user.id;

    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: currentUserId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((r) => ({
      requestId: r.id,
      user: r.sender,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("Error getting incoming friend requests:", error);
    return [];
  }
}

export async function getSentFriendRequests() {
  try {
    const session = await getSession();
    if (!session) return [];

    const currentUserId = session.user.id;

    const requests = await prisma.friendRequest.findMany({
      where: {
        senderId: currentUserId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((r) => ({
      requestId: r.id,
      user: r.receiver,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("Error getting sent friend requests:", error);
    return [];
  }
}

export async function getUserFriends(userId: string) {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId1: userId },
          { userId2: userId },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, username: true, image: true } },
        user2: { select: { id: true, name: true, username: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const friends = friendships.map((f) => 
      f.userId1 === userId ? f.user2 : f.user1
    );

    return friends;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}
