"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { getMyConversations } from "@/server/actions/messages";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

type Conversation = Awaited<ReturnType<typeof getMyConversations>>[number];

function SwipeableConversation({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const [startX, setStartX] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiped(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null) return;
    const diff = startX - e.touches[0].clientX;
    if (diff > 0) setTranslateX(Math.min(diff, 120));
    else setTranslateX(0);
  };

  const handleTouchEnd = () => {
    if (translateX >= THRESHOLD) {
      setSwiped(true);
      setTranslateX(100);
    } else {
      setTranslateX(0);
    }
    setStartX(null);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete action revealed on swipe */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end bg-red-500 w-24 px-3">
        <button onClick={handleConfirmDelete} className="text-white text-xs font-semibold flex flex-col items-center gap-0.5">
          <span className="text-lg">🗑</span>
          Sil
        </button>
      </div>
      <div
        style={{ transform: `translateX(-${translateX}px)`, transition: startX === null ? "transform 0.2s ease" : "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { t } = useI18n();
  const presenceChannelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  useEffect(() => {
    const load = async (initial = false) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (initial) setLoading(false);
        return;
      }
      if (initial) setUserId(session.user.id);
      const data = await getMyConversations(session.user.id);
      setConversations(data);

      // Set up presence tracking on first load
      if (initial) {
        const presenceChannel = supabase.channel("online-users", {
          config: { presence: { key: session.user.id } },
        });

        presenceChannel
          .on("presence", { event: "sync" }, () => {
            const state = presenceChannel.presenceState();
            const ids = new Set<string>(Object.keys(state));
            setOnlineUsers(ids);
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await presenceChannel.track({
                user_id: session.user.id,
                online_at: new Date().toISOString(),
              });
            }
          });

        presenceChannelRef.current = presenceChannel;
      }

      if (initial) setLoading(false);
    };

    load(true);
    const interval = setInterval(() => load(false), 10000);

    return () => {
      clearInterval(interval);
      if (presenceChannelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, []);

  const deleteConversation = async (convoId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convoId));
    // Note: actual deletion from DB would require a server action
    // For now this just removes from local state (user refreshes to restore)
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="bg-white rounded-2xl border border-border overflow-hidden mt-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-border last:border-0"
            >
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">
          {t("mesajlar.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {conversations.length} {t("mesajlar.count")}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">
            {t("mesajlar.empty.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("mesajlar.empty.desc")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {conversations.map((convo) => {
            // Determine the other participant
            const other =
              (convo as any).participantOneId === userId
                ? (convo as any).participantTwo
                : (convo as any).participantOne;
            const rawName: string | null | undefined = other?.name;
            const isUUID = rawName ? /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(rawName) : false;
            const otherName: string = (!rawName || isUUID)
              ? (other?.email ? (other.email as string).split("@")[0] : "İstifadəçi")
              : rawName;
            const otherId: string | undefined = other?.id;
            const initials = getInitials(otherName);
            const isUnread =
              (convo as any).lastSenderId &&
              (convo as any).lastSenderId !== userId &&
              !!(convo as any).lastMessageAt;
            const isOnline = otherId ? onlineUsers.has(otherId) : false;

            return (
              <SwipeableConversation
                key={convo.id}
                onDelete={() => deleteConversation(convo.id)}
              >
                <Link
                  href={`/panel/mesajlar/${convo.id}`}
                  className={`flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-semibold text-sm text-primary">
                      {initials}
                    </div>
                    {/* Online indicator (green dot) */}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                    {/* Unread indicator (red dot, top-right) */}
                    {isUnread && !isOnline && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                    {isUnread && isOnline && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        isUnread
                          ? "font-semibold text-foreground"
                          : "font-medium"
                      }`}
                    >
                      {otherName}
                    </p>
                    {(convo as any).lastMessagePreview && (
                      <p
                        className={`text-xs truncate ${
                          isUnread
                            ? "text-foreground/70 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {(convo as any).lastMessagePreview}
                      </p>
                    )}
                  </div>

                  {(convo as any).lastMessageAt && (
                    <p
                      className={`text-xs shrink-0 ${
                        isUnread
                          ? "text-red-500 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatRelativeTime((convo as any).lastMessageAt)}
                    </p>
                  )}
                </Link>
              </SwipeableConversation>
            );
          })}
        </div>
      )}
    </div>
  );
}
