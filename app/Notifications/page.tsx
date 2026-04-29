import { MainLayout } from "@/components/main-layout";
import { getNotifications } from "@/app/actions";
import { NotificationList } from "@/components/notification-list";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/Notifications");
  }

  const notifications = await getNotifications();

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen border-r border-zinc-800">
        <div className="sticky top-0 z-20 bg-black/80 px-4 py-4 backdrop-blur-md border-b border-zinc-800">
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <NotificationList initialNotifications={notifications} />
        </div>
      </div>
    </MainLayout>
  );
}
