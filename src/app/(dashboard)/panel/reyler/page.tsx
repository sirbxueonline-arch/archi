"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { getMyProfile } from "@/server/actions/profiles";
import { Star, Send, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Profile = Awaited<ReturnType<typeof getMyProfile>>;
type Review = NonNullable<Profile>["reviews"][number];

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { t, locale } = useI18n();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getMyProfile(session.user.id);
        setReviews((profile?.reviews ?? []) as Review[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    const supabase = createClient();
    await supabase
      .from("reviews")
      .update({ ownerReply: replyText.trim(), ownerReplyAt: new Date().toISOString() })
      .eq("id", reviewId);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, ownerReply: replyText.trim(), ownerReplyAt: new Date().toISOString() } as any
          : r
      )
    );
    setReplyingTo(null);
    setReplyText("");
    setSubmittingReply(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="space-y-4 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "az-AZ";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">{t("reviews.title")}</h1>
        <p className="text-muted-foreground text-sm">{reviews.length} {t("reviews.count")}</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">{t("reviews.empty.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("reviews.empty.desc")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {review.reviewer?.image ? (
                    <Image
                      src={review.reviewer.image}
                      alt={review.reviewer.name || "Rəyçi"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {review.reviewer?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {review.reviewer?.name || "Anonim"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString(dateLocale)}
                </p>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              {review.content && (
                <p className="text-sm text-muted-foreground">{review.content}</p>
              )}

              {/* Existing reply */}
              {(review as any).ownerReply && (
                <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-xl p-3">
                  <p className="text-xs font-semibold text-primary mb-1">Sizin cavabınız:</p>
                  <p className="text-xs text-muted-foreground">{(review as any).ownerReply}</p>
                </div>
              )}

              {/* Reply button / form */}
              {!(review as any).ownerReply && (
                replyingTo === review.id ? (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Rəyə cavabınızı yazın..."
                      className="min-h-[60px] text-sm"
                      maxLength={500}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                        Ləğv et
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        className="gap-1.5 text-xs h-7"
                        onClick={() => submitReply(review.id)}
                        disabled={!replyText.trim() || submittingReply}
                      >
                        <Send className="w-3 h-3" />
                        Göndər
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setReplyingTo(review.id); setReplyText(""); }}
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Cavab ver
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
