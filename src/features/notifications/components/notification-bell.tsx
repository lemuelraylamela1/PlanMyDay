"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";

export function NotificationBell({ weddingId }: { weddingId: string }) {
  const { data, isLoading, isFetching } = useNotifications(weddingId);

  const unread = data?.unread ?? 0;
  const items = data?.items ?? [];
  const showSpinner = isLoading || isFetching;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          {showSpinner && !data ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          <Link href="/notifications" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            items.slice(0, 8).map((n) => (
              <div
                key={n.id}
                className={`border-b px-4 py-3 text-sm last:border-0 ${n.readAt ? "opacity-70" : ""}`}
              >
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
