"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
} from "@/server/actions/messages";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send, Paperclip, FileText, File, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendBrowserNotification } from "@/lib/push";

type Message = Exclude<
  Awaited<ReturnType<typeof getConversationMessages>>,
  { error: string }
>["messages"][number];

interface PageProps {
  params: Promise<{ id: string }>;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isImageFile(name: string | null | undefined): boolean {
  if (!name) return false;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

function isPdfFile(name: string | null | undefined): boolean {
  if (!name) return false;
  return name.toLowerCase().endsWith(".pdf");
}

// Typing indicator dots animation
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="text-xs text-muted-foreground italic">yazır</span>
      <span className="flex gap-0.5">
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );
}

// Read receipt component
function ReadReceipt({
  isOwn,
  readAt,
}: {
  isOwn: boolean;
  readAt: string | null | undefined;
}) {
  if (!isOwn) return null;
  const isRead = !!readAt;
  return (
    <span
      className={`text-[10px] ml-1 ${
        isRead ? "text-blue-500" : "text-gray-400"
      }`}
      title={isRead ? "Oxunub" : "Göndərilib"}
    >
      {isRead ? "✓✓" : "✓"}
    </span>
  );
}

// Attachment display in messages
function AttachmentDisplay({
  url,
  name,
}: {
  url: string;
  name: string | null | undefined;
}) {
  const fileName = name ?? "fayl";

  if (isImageFile(fileName)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1.5">
        <img
          src={url}
          alt={fileName}
          className="max-w-[300px] w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </a>
    );
  }

  if (isPdfFile(fileName)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-1.5 p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
      >
        <FileText className="w-5 h-5 text-red-500 shrink-0" />
        <span className="text-xs truncate flex-1">{fileName}</span>
        <Download className="w-4 h-4 shrink-0 opacity-60" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 mt-1.5 p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
    >
      <File className="w-5 h-5 text-muted-foreground shrink-0" />
      <span className="text-xs truncate flex-1">{fileName}</span>
      <Download className="w-4 h-4 shrink-0 opacity-60" />
    </a>
  );
}

export default function ConversationPage({ params }: PageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const userIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingChannelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(
    async (uid: string) => {
      const result = await getConversationMessages(uid, id);
      if ("messages" in result) setMessages(result.messages ?? []);
    },
    [id]
  );

  // Mark messages as read when conversation opens or new messages arrive
  useEffect(() => {
    if (userId && messages.length > 0) {
      const hasUnread = messages.some(
        (m) => (m as any).senderId !== userId && !(m as any).readAt
      );
      if (hasUnread) {
        markMessagesAsRead(userId, id);
      }
    }
  }, [userId, messages, id]);

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
      userIdRef.current = session.user.id;
      if (initial) {
        setUserId(session.user.id);
        // Fetch other participant's name
        const supabase2 = createClient();
        const { data: convo } = await supabase2
          .from("conversations")
          .select(
            "participantOneId, participantTwoId, participantOne:users!participantOneId(name, email), participantTwo:users!participantTwoId(name, email)"
          )
          .eq("id", id)
          .single();
        if (convo) {
          const other =
            (convo as any).participantOneId === session.user.id
              ? (convo as any).participantTwo
              : (convo as any).participantOne;
          const rawName: string | null | undefined = other?.name;
          const isUUID = rawName ? /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(rawName) : false;
          const displayName = (!rawName || isUUID)
            ? (other?.email ? (other.email as string).split("@")[0] : "İstifadəçi")
            : rawName;
          setOtherName(displayName);
        }
      }
      await fetchMessages(session.user.id);
      if (initial) setLoading(false);
    };

    load(true);

    // Realtime: listen for new messages & read receipt updates
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversationId=eq.${id}`,
        },
        async (payload) => {
          if (userIdRef.current) {
            await fetchMessages(userIdRef.current);

            // Fire browser notification when tab is not focused and message is from the other user
            if (
              document.hidden &&
              payload.eventType === "INSERT" &&
              payload.new?.senderId !== userIdRef.current
            ) {
              const senderName = payload.new?.sender?.name ?? "Yeni mesaj";
              const msgPreview: string =
                (payload.new?.content as string | null | undefined)?.slice(0, 80) ||
                (payload.new?.attachmentName ? `📎 ${payload.new.attachmentName}` : "Yeni mesaj");
              sendBrowserNotification(senderName, msgPreview, `/panel/mesajlar/${id}`);
            }
          }
        }
      )
      .subscribe();

    // Typing presence channel
    const typingChannel = supabase.channel(`typing:${id}`, {
      config: { presence: { key: "typing" } },
    });

    typingChannel
      .on("presence", { event: "sync" }, () => {
        const state = typingChannel.presenceState();
        const typingUsers = Object.values(state).flat() as any[];
        const someoneElseTyping = typingUsers.some(
          (u: any) => u.user_id !== userIdRef.current && u.typing
        );
        setOtherIsTyping(someoneElseTyping);
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
      typingChannelRef.current = null;
    };
  }, [id, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherIsTyping]);

  // Broadcast typing presence
  const broadcastTyping = useCallback(() => {
    if (!typingChannelRef.current || !userIdRef.current) return;
    typingChannelRef.current.track({
      user_id: userIdRef.current,
      typing: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      typingChannelRef.current?.untrack();
    }, 3000);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Yalnız JPG, PNG, PDF və ZIP faylları dəstəklənir");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Fayl ölçüsü 10MB-dan çox ola bilməz");
      return;
    }

    setSelectedFile(file);
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file: globalThis.File): Promise<{ url: string; name: string } | null> => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const filePath = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("message-attachments")
      .upload(filePath, file);

    if (error) {
      toast.error("Fayl yüklənərkən xəta baş verdi");
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("message-attachments").getPublicUrl(filePath);

    return { url: publicUrl, name: file.name };
  };

  const handleSend = async () => {
    if ((!content.trim() && !selectedFile) || !userId) return;
    setSending(true);
    setUploading(!!selectedFile);

    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;

    // Upload file if selected
    if (selectedFile) {
      const result = await uploadFile(selectedFile);
      if (result) {
        attachmentUrl = result.url;
        attachmentName = result.name;
      } else {
        setSending(false);
        setUploading(false);
        return;
      }
    }

    const result = await sendMessage(
      userId,
      id,
      content.trim(),
      attachmentUrl,
      attachmentName
    );
    if (result.error) {
      toast.error(result.error);
    } else {
      setContent("");
      setSelectedFile(null);
      // Stop typing indicator
      typingChannelRef.current?.untrack();
      // Reload messages
      await fetchMessages(userId);
    }
    setSending(false);
    setUploading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    broadcastTyping();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="w-5 h-5 bg-muted animate-pulse rounded" />
          <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className="h-12 w-48 bg-muted animate-pulse rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border shrink-0">
        <Link
          href="/panel/mesajlar"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">
            {otherName ? otherName.charAt(0).toUpperCase() : "?"}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{otherName || "İstifadəçi"}</p>
          {otherIsTyping && (
            <p className="text-xs text-muted-foreground italic">yazır...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Hələ mesaj yoxdur. Söhbəti başladın!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === userId;
          const msgAny = msg as any;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {/* Message text */}
                {msg.content && <p>{msg.content}</p>}

                {/* Attachment */}
                {msgAny.attachmentUrl && (
                  <AttachmentDisplay
                    url={msgAny.attachmentUrl}
                    name={msgAny.attachmentName}
                  />
                )}

                {/* Timestamp + read receipt */}
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    isOwn
                      ? "text-primary-foreground/70 justify-end"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="text-xs">
                    {new Date(msg.createdAt).toLocaleTimeString("az-AZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <ReadReceipt isOwn={isOwn} readAt={msgAny.readAt} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator below last message */}
        {otherIsTyping && <TypingDots />}

        <div ref={bottomRef} />
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div className="shrink-0 px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-3">
          {isImageFile(selectedFile.name) ? (
            <div className="w-10 h-10 rounded bg-muted overflow-hidden">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : isPdfFile(selectedFile.name) ? (
            <FileText className="w-5 h-5 text-red-500 shrink-0" />
          ) : (
            <File className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
          <span className="text-xs truncate flex-1">{selectedFile.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
          </span>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 pt-4 border-t border-border flex gap-3 items-end">
        {/* File upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.zip"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 w-11 h-11 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Textarea
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın... (Enter ilə göndərin)"
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && !selectedFile) || sending}
          size="icon"
          variant="gradient"
          className="shrink-0 w-11 h-11"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
