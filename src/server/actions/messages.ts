"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { sendNewMessageEmail } from "@/lib/email";

export async function getMyConversations(userId: string) {
  if (!userId) return [];
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("conversations")
    .select(`
      id, lastMessageAt, lastMessagePreview, lastSenderId,
      participantOneId, participantTwoId,
      participantOne:users!participantOneId(id, name, email, image),
      participantTwo:users!participantTwoId(id, name, email, image)
    `)
    .or(`participantOneId.eq.${userId},participantTwoId.eq.${userId}`)
    .order("lastMessageAt", { ascending: false });

  return data ?? [];
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { data: byOne } = await supabase
    .from("conversations")
    .select("id")
    .eq("participantOneId", userId)
    .eq("participantTwoId", otherUserId)
    .maybeSingle();

  if (byOne) return { conversationId: byOne.id };

  const { data: byTwo } = await supabase
    .from("conversations")
    .select("id")
    .eq("participantOneId", otherUserId)
    .eq("participantTwoId", userId)
    .maybeSingle();

  if (byTwo) return { conversationId: byTwo.id };

  const { data: newConvo, error } = await supabase
    .from("conversations")
    .insert({ participantOneId: userId, participantTwoId: otherUserId })
    .select("id")
    .single();

  if (error || !newConvo) return { error: error?.message ?? "Xəta baş verdi" };

  return { conversationId: newConvo.id };
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  content: string,
  attachmentUrl?: string,
  attachmentName?: string
) {
  if (!userId) return { error: "Giriş tələb olunur" };
  if (!content.trim() && !attachmentUrl) return { error: "Mesaj boş ola bilməz" };

  const supabase = createAdminClient();

  const payload: Record<string, any> = {
    conversationId,
    senderId: userId,
    content: content.trim() || "",
  };
  if (attachmentUrl) payload.attachmentUrl = attachmentUrl;
  if (attachmentName) payload.attachmentName = attachmentName;

  const { error } = await supabase.from("messages").insert(payload);

  if (error) return { error: error.message };

  let preview = content.slice(0, 100);
  if (attachmentUrl && !content.trim()) {
    const ext = attachmentName?.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      preview = "\uD83D\uDCF7 Şəkil";
    } else if (ext === "pdf") {
      preview = "\uD83D\uDCC4 PDF fayl";
    } else {
      preview = "\uD83D\uDCCE " + (attachmentName ?? "Fayl");
    }
  }

  await supabase
    .from("conversations")
    .update({
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: preview,
      lastSenderId: userId,
    })
    .eq("id", conversationId);

  // Send email notification to receiver
  try {
    const { data: convo } = await supabase
      .from("conversations")
      .select(
        "participantOneId, participantTwoId, participantOne:users!participantOneId(id, name, email), participantTwo:users!participantTwoId(id, name, email)"
      )
      .eq("id", conversationId)
      .single();

    if (convo) {
      const convoAny = convo as any;
      const receiver =
        convoAny.participantOneId === userId
          ? convoAny.participantTwo
          : convoAny.participantOne;
      const sender =
        convoAny.participantOneId === userId
          ? convoAny.participantOne
          : convoAny.participantTwo;

      if (receiver?.email) {
        await sendNewMessageEmail(
          receiver.email,
          sender?.name ?? "Bir istifadəçi",
          preview,
          conversationId,
          receiver?.name ?? undefined
        );
      }
    }
  } catch {
    // Email errors should not block the message send
  }

  revalidatePath(`/panel/mesajlar/${conversationId}`);
  return { success: true };
}

export async function markMessagesAsRead(userId: string, conversationId: string) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  await supabase
    .from("messages")
    .update({ readAt: new Date().toISOString(), isRead: true })
    .eq("conversationId", conversationId)
    .neq("senderId", userId)
    .is("readAt", null);

  return { success: true };
}

export async function getConversationMessages(userId: string, conversationId: string) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("messages")
    .select("*, sender:users!senderId(id, name, image)")
    .eq("conversationId", conversationId)
    .order("createdAt", { ascending: true })
    .limit(50);

  return { messages: data ?? [] };
}
