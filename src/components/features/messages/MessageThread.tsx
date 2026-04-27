"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sendMessage } from "@/server/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  createdAt: Date;
  senderId: string;
  senderName: string | null;
  senderImage: string | null;
  isRead: boolean;
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: MessageThreadProps) {
  const [msgs, setMsgs] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  const [pendingAttachmentName, setPendingAttachmentName] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Yalnız şəkil faylları dəstəklənir");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Maksimum fayl ölçüsü 5 MB-dır");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `chat/${conversationId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file);

    if (error) {
      alert("Şəkil yüklənmədi: " + error.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from("attachments").getPublicUrl(path);
      setPendingAttachment(publicUrl);
      setPendingAttachmentName(file.name);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && !pendingAttachment) || isPending) return;

    const optimisticMsg: Message = {
      id: crypto.randomUUID(),
      content: trimmed,
      attachmentUrl: pendingAttachment,
      createdAt: new Date(),
      senderId: currentUserId,
      senderName: "Siz",
      senderImage: null,
      isRead: false,
    };
    setMsgs((prev) => [...prev, optimisticMsg]);
    const att = pendingAttachment;
    setText("");
    setPendingAttachment(null);
    setPendingAttachmentName("");

    startTransition(async () => {
      await sendMessage(currentUserId, conversationId, trimmed, att ?? undefined);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2 pr-1">
        {msgs.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-10">
            Söhbəti başlatmaq üçün mesaj göndərin
          </div>
        )}
        {msgs.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-end gap-2",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              {!isMe && (
                <Avatar className="w-7 h-7 shrink-0">
                  <AvatarImage src={msg.senderImage ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(msg.senderName ?? "?")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isMe
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                {msg.attachmentUrl && (
                  <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                    <Image
                      src={msg.attachmentUrl}
                      alt="Şəkil"
                      width={240}
                      height={160}
                      className="rounded-xl object-cover max-h-48 w-auto"
                    />
                  </a>
                )}
                {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                <p
                  className={cn(
                    "text-[10px] mt-1",
                    isMe ? "text-white/60 text-right" : "text-muted-foreground"
                  )}
                >
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Attachment preview */}
      {pendingAttachment && (
        <div className="flex items-center gap-2 px-1 py-2 border-t border-border">
          <ImageIcon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs text-muted-foreground truncate flex-1">{pendingAttachmentName}</span>
          <button onClick={() => { setPendingAttachment(null); setPendingAttachmentName(""); }}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex items-end gap-2 border-t border-border pt-4">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Şəkil əlavə et"
        >
          <Paperclip className={cn("w-4 h-4", uploading && "animate-pulse")} />
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesaj yazın... (Enter göndərir, Shift+Enter yeni sətir)"
          className="resize-none min-h-[48px] max-h-32 bg-white"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={(!text.trim() && !pendingAttachment) || isPending || uploading}
          size="icon"
          className="shrink-0 h-12 w-12"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}
