"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Bell, MessageSquare, Star, Briefcase, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

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

const typeColor: Record<string, { bg: string; text: string; ring: string }> = {
  message: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/20" },
  review: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  proposal: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  system: { bg: "bg-slate-50", text: "text-slate-500", ring: "ring-slate-100" },
};

type Tab = "all" | "unread";

export default function NotificationsPage() {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const displayed = tab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t("bildirişler.now");
    if (m < 60) return `${m} ${t("bildirişler.minutesAgo")}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ${t("bildirişler.hoursAgo")}`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} ${t("bildirişler.daysAgo")}`;
    return new Date(dateStr).toLocaleDateString(locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "az-AZ");
  };

  const load = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("userId", uid)
      .order("createdAt", { ascending: false })
      .limit(50);
    setNotifications(data ?? []);
  }, []);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        await load(session.user.id);
      }
      setLoading(false);
    };
    init();
  }, [load]);

  const markAllRead = async () => {
    if (!userId || unreadCount === 0) return;
    setMarkingAll(true);
    const supabase = createClient();
    await supabase.from("notifications").update({ isRead: true }).eq("userId", userId).eq("isRead", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const markOneRead = async (id: string) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("notifications").update({ isRead: true }).eq("id", id).eq("userId", userId);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 w-20 bg-muted animate-pulse rounded-full" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="space-y-2 mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("bildirişler.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} ${t("bildirişler.unread")}`
              : t("bildirişler.allRead")}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2 mt-1" onClick={markAllRead} disabled={markingAll}>
            {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
            {t("bildirişler.markAll")}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-muted/60 p-1 rounded-xl w-fit">
        {(["all", "unread"] as Tab[]).map((tabId) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === tabId
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tabId === "all" ? t("bildirişler.tab.all") : t("bildirişler.tab.unread")}
            {tabId === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">{t("bildirişler.empty.title")}</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">{t("bildirişler.empty.desc")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border/60">
          {displayed.map((n) => {
            const Icon = typeIcon[n.type] ?? Bell;
            const colors = typeColor[n.type] ?? typeColor.system;

            const content = (
              <div
                onClick={() => { if (!n.isRead) markOneRead(n.id); }}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer",
                  n.isRead ? "hover:bg-muted/30" : "bg-primary/[0.03] hover:bg-primary/[0.06]"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ring-1",
                  colors.bg, colors.text, colors.ring
                )}>
                  <Icon className="w-4.5 h-4.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className={cn(
                      "text-sm font-semibold leading-tight",
                      n.isRead ? "text-slate-500 font-medium" : "text-slate-900"
                    )}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                </div>
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
