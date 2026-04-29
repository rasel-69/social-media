import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const lastMessageId = searchParams.get("lastMessageId");

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    // Verify user is in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true }
    });

    if (!conversation || (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If lastMessageId is provided, fetch messages after it
    let newMessages: any[] = [];
    if (lastMessageId) {
      const lastMsg = await prisma.message.findUnique({
        where: { id: lastMessageId },
        select: { createdAt: true }
      });

      if (lastMsg) {
        newMessages = await prisma.message.findMany({
          where: {
            conversationId,
            createdAt: { gt: lastMsg.createdAt }
          },
          include: {
            sender: { select: { id: true, name: true, image: true, username: true } },
          },
          orderBy: { createdAt: "asc" }
        });
      }
    }

    // Mark these as read immediately if they aren't from the current user
    if (newMessages.length > 0) {
      const unreadIds = newMessages
        .filter(m => m.senderId !== currentUserId && !m.isRead)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await prisma.message.updateMany({
          where: { id: { in: unreadIds } },
          data: { isRead: true }
        });
      }
    }

    return NextResponse.json({ messages: newMessages });
  } catch (error) {
    console.error("Polling error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
