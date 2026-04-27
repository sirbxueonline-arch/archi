"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getMyNotifications(userId: string) {
  if (!userId) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function getUnreadCount(userId: string) {
  if (!userId) return 0;
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("userId", userId)
    .eq("isRead", false);
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("notifications")
    .update({ isRead: true })
    .eq("id", notificationId)
    .eq("userId", userId);
  revalidatePath("/panel/bildirişler");
}

export async function markAllNotificationsRead(userId: string) {
  if (!userId) return;
  const supabase = createAdminClient();
  await supabase
    .from("notifications")
    .update({ isRead: true })
    .eq("userId", userId)
    .eq("isRead", false);
  revalidatePath("/panel/bildirişler");
}

export async function createNotification(input: {
  userId: string;
  type: "message" | "review" | "proposal" | "system";
  title: string;
  message: string;
  link?: string;
}) {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    isRead: false,
  });
}
