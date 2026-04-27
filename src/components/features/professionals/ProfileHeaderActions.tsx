"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Briefcase, X, Loader2, Plus, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

interface ProfileHeaderActionsProps {
  profileUserId: string;
  profileId: string;
}

interface OfferForm {
  title: string;
  description: string;
  budget: string;
  duration: string;
}

interface QuoteForm {
  subject: string;
  message: string;
  budgetRange: string;
}

export function ProfileHeaderActions({ profileUserId, profileId }: ProfileHeaderActionsProps) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<OfferForm>({ title: "", description: "", budget: "", duration: "" });
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({ subject: "", message: "", budgetRange: "" });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setIsOwner(false); return; }
      setUserId(session.user.id);
      setIsOwner(session.user.id === profileUserId);
      // Get role from public users table
      const { data } = await supabase.from("users").select("role").eq("id", session.user.id).single();
      setUserRole(data?.role ?? null);
    });
  }, [profileUserId]);

  const handleOfferSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Başlıq və təsvir mütləqdir");
      return;
    }
    if (!userId) {
      toast.error("Zəhmət olmasa daxil olun");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("clientOffers").insert({
      clientId: userId,
      architectProfileId: profileId,
      title: form.title.trim(),
      description: form.description.trim(),
      budget: form.budget ? parseFloat(form.budget) : null,
      duration: form.duration.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Təklif göndərilə bilmədi: " + error.message);
    } else {
      toast.success("Təklifiniz göndərildi!");
      setOfferOpen(false);
      setForm({ title: "", description: "", budget: "", duration: "" });
    }
  };

  const handleQuoteSubmit = async () => {
    if (!quoteForm.subject.trim() || !quoteForm.message.trim()) {
      toast.error("Mövzu və mesaj mütləqdir");
      return;
    }
    if (!userId) {
      toast.error("Zəhmət olmasa daxil olun");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();

    // Build the first message content with budget info if provided
    let messageContent = `[Qiymət Sorğusu] ${quoteForm.subject}\n\n${quoteForm.message}`;
    if (quoteForm.budgetRange.trim()) {
      messageContent += `\n\nBüdcə aralığı: ${quoteForm.budgetRange.trim()}`;
    }

    // Check for existing conversation between the two users
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participantOneId.eq.${userId},participantTwoId.eq.${profileUserId}),and(participantOneId.eq.${profileUserId},participantTwoId.eq.${userId})`
      )
      .eq("isActive", true)
      .limit(1)
      .single();

    let conversationId: string;

    if (existingConv) {
      conversationId = existingConv.id;
      // Update last message preview
      await supabase
        .from("conversations")
        .update({ lastMessagePreview: messageContent.slice(0, 255) })
        .eq("id", conversationId);
    } else {
      // Create a new conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          participantOneId: userId,
          participantTwoId: profileUserId,
          lastMessagePreview: messageContent.slice(0, 255),
        })
        .select("id")
        .single();

      if (convError || !newConv) {
        toast.error("Söhbət yaradıla bilmədi: " + (convError?.message ?? ""));
        setSubmitting(false);
        return;
      }
      conversationId = newConv.id;
    }

    // Send the first message
    const { error: msgError } = await supabase.from("messages").insert({
      conversationId,
      senderId: userId,
      content: messageContent,
    });

    setSubmitting(false);

    if (msgError) {
      toast.error("Mesaj göndərilə bilmədi: " + msgError.message);
    } else {
      toast.success("Qiymət sorğunuz göndərildi!");
      setQuoteOpen(false);
      setQuoteForm({ subject: "", message: "", budgetRange: "" });
    }
  };

  if (isOwner === null) return null;

  if (isOwner) {
    return (
      <>
        <Link href="/panel/profil">
          <Button variant="outline" size="sm">Profili Düzəlt</Button>
        </Link>
        <Link href="/panel/portfolio/yeni">
          <Button size="sm" variant="gradient" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Portfolio Yarat
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href={`/panel/mesajlar/yeni?to=${profileUserId}`}>
        <Button variant="outline" size="sm" className="gap-1.5">
          <MessageCircle className="w-4 h-4" />
          Mesaj Göndər
        </Button>
      </Link>

      {/* Only clients (non-professionals) see the offer & quote buttons */}
      {userRole !== "professional" && (
        <>
          <Button
            size="sm"
            variant="gradient"
            className="gap-1.5"
            onClick={() => setOfferOpen(true)}
          >
            <Briefcase className="w-4 h-4" />
            İş Təklif Et
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setQuoteOpen(true)}
          >
            <DollarSign className="w-4 h-4" />
            Qiymət Sor
          </Button>
        </>
      )}

      {/* Quote Modal */}
      {quoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setQuoteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold">Qiymət Sor</h2>
              <button onClick={() => setQuoteOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Mövzu *</Label>
                <Input
                  placeholder="Məs: Mənzil dizaynı üçün qiymət"
                  value={quoteForm.subject}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, subject: e.target.value }))}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Mesaj *</Label>
                <Textarea
                  placeholder="Layihəniz haqqında qısa məlumat verin..."
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, message: e.target.value }))}
                  disabled={submitting}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Büdcə aralığı (istəyə bağlı)</Label>
                <Input
                  placeholder="Məs: 5000 - 15000 AZN"
                  value={quoteForm.budgetRange}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, budgetRange: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="gradient"
                className="flex-1 gap-1.5"
                onClick={handleQuoteSubmit}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                {submitting ? "Göndərilir..." : "Göndər"}
              </Button>
              <Button variant="outline" onClick={() => setQuoteOpen(false)} disabled={submitting}>
                Ləğv et
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {offerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOfferOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold">İş Təklifi Göndər</h2>
              <button onClick={() => setOfferOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Layihə Adı *</Label>
                <Input
                  placeholder="Məs: Mənzil renovasiyası"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Təsvir *</Label>
                <Textarea
                  placeholder="Layihə haqqında ətraflı məlumat verin..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  disabled={submitting}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Büdcə (AZN)</Label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Müddət</Label>
                  <Input
                    placeholder="3 ay"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="gradient"
                className="flex-1 gap-1.5"
                onClick={handleOfferSubmit}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                {submitting ? "Göndərilir..." : "Göndər"}
              </Button>
              <Button variant="outline" onClick={() => setOfferOpen(false)} disabled={submitting}>
                Ləğv et
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
