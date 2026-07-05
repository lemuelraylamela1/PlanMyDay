import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { dehydrate, QueryClient } from "@tanstack/react-query";

import { requireVerifiedUser } from "@/lib/authz";
import { getCurrentWedding, listUserWeddings } from "@/lib/wedding-context";
import { queryKeys } from "@/lib/query-keys";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { WeddingSwitcher } from "@/components/layout/wedding-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { QueryHydration } from "@/components/query-hydration";
import { ActiveWeddingCookieSync } from "@/components/layout/active-wedding-cookie-sync";
import { GlobalSearch } from "@/features/search/components/global-search";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getNotificationsPayload } from "@/features/notifications/service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireVerifiedUser();
  const { wedding } = await getCurrentWedding();
  const weddings = await listUserWeddings(user.id);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.notifications(wedding.id),
    queryFn: () => getNotificationsPayload(wedding.id, user.id),
  });

  return (
    <QueryHydration state={dehydrate(queryClient)}>
      <ActiveWeddingCookieSync weddingId={wedding.id} />
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
            <Link href="/dashboard" className="flex items-center gap-2">
              <CalendarHeart className="h-5 w-5 text-primary" />
              PlanMyDay
            </Link>
          </div>
          <div className="border-b px-3 py-3">
            <WeddingSwitcher
              weddings={weddings.map((w) => ({ id: w.id, title: w.title }))}
              activeId={wedding.id}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
        </aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
            <MobileNav />
            <div className="flex-1">
              <GlobalSearch weddingId={wedding.id} />
            </div>
            <NotificationBell weddingId={wedding.id} />
            <ThemeToggle />
            <UserMenu
              name={user.name ?? user.email}
              email={user.email}
              isAdmin={user.role === "ADMIN"}
            />
          </header>

          <main className="container max-w-7xl py-6">{children}</main>
        </div>
      </div>
    </QueryHydration>
  );
}
