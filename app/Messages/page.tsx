import { MainLayout } from "@/components/main-layout";
import { getConversations } from "@/app/actions/message";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MessagesLayout } from "./messages-layout";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const conversations = await getConversations();

  return (
    <MainLayout>
      <div className="h-full flex flex-col w-full bg-black -mt-[1px]">
        <MessagesLayout 
          initialConversations={conversations} 
          currentUserId={session.user.id} 
        />
      </div>
    </MainLayout>
  );
}
