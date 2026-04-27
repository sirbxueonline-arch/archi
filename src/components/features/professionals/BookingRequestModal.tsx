"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Calendar, Clock, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getOrCreateConversation, sendMessage } from "@/server/actions/messages";

interface BookingRequestModalProps {
  profileUserId: string;
  professionalName: string;
  onClose: () => void;
}

export function BookingRequestModal({ profileUserId, professionalName, onClose }: BookingRequestModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!date) { toast.error("Tarix seçin"); return; }
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Giriş edin"); setSending(false); return; }

      const result = await getOrCreateConversation(session.user.id, profileUserId);
      if ("error" in result) { toast.error(result.error); setSending(false); return; }
      const messageText = `📅 Görüş Tələbi\n\nTarix: ${date}${time ? `\nSaat: ${time}` : ""}\n${note ? `\nQeyd: ${note}` : ""}`;
      await sendMessage(session.user.id, result.conversationId, messageText);

      toast.success("Görüş tələbi göndərildi!");
      onClose();
    } catch {
      toast.error("Xəta baş verdi");
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-lg">Görüş Planla</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{professionalName} ilə görüş tarixi seçin</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tarix *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Saat</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Qeyd (istəyə bağlı)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Görüşün məqsədini qısaca izah edin..." className="min-h-[80px] text-sm resize-none" maxLength={300} />
          </div>
          <Button onClick={handleSend} disabled={!date || sending} loading={sending} variant="gradient" className="w-full gap-2">
            <Send className="w-4 h-4" />
            Tələb Göndər
          </Button>
        </div>
      </div>
    </div>
  );
}
