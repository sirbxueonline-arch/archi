"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface NavBadgesProps {
  userId: string;
}

export function NavBadges({ userId }: NavBadgesProps) {
  const [unreadMessages, setUnreadMessages] = React.useState(0);

  const loadUnreadMessages = React.useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();

    // Get all conversations where this user participates
    const { data: convos } = await supabase
      .from("conversations")
      .select("id")
      .or(`participantOneId.eq.${userId},participantTwoId.eq.${userId}`);

    if (!convos || convos.length === 0) {
      setUnreadMessages(0);
      return;
    }

    const convoIds = convos.map((c) => c.id);

    // Count messages sent by others that haven't been read yet
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversationId", convoIds)
      .neq("senderId", userId)
      .is("readAt", null);

    setUnreadMessages(count ?? 0);
  }, [userId]);

  React.useEffect(() => {
    if (!userId) return;

    loadUnreadMessages();

    const supabase = createClient();

    // Subscribe to real-time inserts on messages table
    const channel = supabase
      .channel(`nav-messages-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // Only count if the new message was sent by someone else
          if (payload.new && payload.new.senderId !== userId) {
            setUnreadMessages((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refresh count when messages are marked as read
          loadUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadUnreadMessages]);

  return (
    <>
      <Link href="/panel/mesajlar">
        <Button variant="ghost" size="icon-sm" className="relative">
          <MessageSquare className="w-4 h-4" />
          {unreadMessages > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          )}
        </Button>
      </Link>
      <NotificationBell userId={userId} />
    </>
  );
}
