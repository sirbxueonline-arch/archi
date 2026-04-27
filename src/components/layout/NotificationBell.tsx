"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, MessageSquare, Star, Briefcase, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcon: Record<string, React.ElementType> = {
  message: MessageSquare,
  review: Star,
  proposal: Briefcase,
  system: Bell,
};

const typeColor: Record<string, string> = {
  message: "bg-blue-100 text-blue-600",
  review: "bg-amber-100 text-amber-600",
  proposal: "bg-emerald-100 text-emerald-600",
  system: "bg-slate-100 text-slate-600",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "indi";
  if (m < 60) return `${m}d əvvəl`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s əvvəl`;
  return `${Math.floor(h / 24)}g əvvəl`;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(6);
    setNotifs(data ?? []);
    setUnread((data ?? []).filter((n) => !n.isRead).length);
  }, [userId]);

  React.useEffect(() => {
    load();
    // Poll every 30s for new notifications
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const markAllRead = async () => {
    if (unread === 0) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ isRead: true })
      .eq("userId", userId)
      .eq("isRead", false);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markOneRead = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ isRead: true })
      .eq("id", id)
      .eq("userId", userId);
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnread((c) => Math.max(0, c - 1));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 mt-1 shadow-premium">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Bildirişlər</span>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              Hamısını oxu
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[320px] overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Bildiriş yoxdur</p>
            </div>
          ) : (
            notifs.map((n) => {
              const Icon = typeIcon[n.type] ?? Bell;
              const color = typeColor[n.type] ?? "bg-slate-100 text-slate-600";
              return (
                <Link
                  key={n.id}
                  href={n.link ?? "/panel/bildirisler"}
                  onClick={() => {
                    if (!n.isRead) markOneRead(n.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0",
                    !n.isRead && "bg-primary/3"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      color
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs font-medium leading-tight",
                          !n.isRead && "text-foreground",
                          n.isRead && "text-muted-foreground"
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-2">
          <Link href="/panel/bildirisler" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground hover:text-primary">
              Hamısını gör
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
