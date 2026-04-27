"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReviewReplyProps {
  reviewId: string;
  profileUserId: string;
}

export function ReviewReply({ reviewId, profileUserId }: ReviewReplyProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && session.user.id === profileUserId) {
        setIsOwner(true);
      }
    };
    check();
  }, [profileUserId]);

  if (!isOwner || submitted) return null;

  const handleSubmit = async () => {
    if (!reply.trim()) {
      toast.error("Cavab boş ola bilməz");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("reviews")
      .update({
        ownerReply: reply.trim(),
        ownerReplyAt: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      toast.error("Xəta baş verdi");
    } else {
      toast.success("Cavabınız göndərildi");
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Cavab ver
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Rəyə cavabınızı yazın..."
        className="min-h-[60px] text-sm"
        maxLength={500}
      />
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(false)}
          className="text-xs"
        >
          Ləğv et
        </Button>
        <Button
          variant="gradient"
          size="sm"
          onClick={handleSubmit}
          disabled={!reply.trim() || submitting}
          loading={submitting}
          className="gap-1.5 text-xs"
        >
          <Send className="w-3 h-3" />
          Göndər
        </Button>
      </div>
    </div>
  );
}
