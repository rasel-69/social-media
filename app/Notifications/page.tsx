import { MainLayout } from "@/components/main-layout";

export default function NotificationsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-20 bg-black/80 px-4 py-4 backdrop-blur-md border-b border-zinc-800">
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">No notifications yet</h1>
            <p className="text-zinc-500">When people interact with you, you'll see it here.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
