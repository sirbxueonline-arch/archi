"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Star, CheckCircle, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewReply } from "./ReviewReply";
import { ReviewForm } from "./ReviewForm";
import { formatDate, getInitials } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReviewData {
  id: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  isVerified?: boolean;
  ownerReply?: string | null;
  ownerReplyAt?: string | Date | null;
  createdAt: string | Date;
  reviewer?: {
    id?: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

interface ReviewsSectionProps {
  reviews: ReviewData[];
  profileId: string;
  profileUserId: string;
  architectName: string;
  avatarImage?: string | null;
  userImage?: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const REVIEWS_PER_PAGE = 5;
const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

// ─── Component ──────────────────────────────────────────────────────────────

export function ReviewsSection({
  reviews,
  profileId,
  profileUserId,
  architectName,
  avatarImage,
  userImage,
}: ReviewsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  // ── Star breakdown counts ──
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating]!++;
      }
    }
    return counts;
  }, [reviews]);

  const maxCount = useMemo(
    () => Math.max(...Object.values(starCounts), 1),
    [starCounts]
  );

  // ── Average rating ──
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  // ── Filtered reviews ──
  const filteredReviews = useMemo(() => {
    if (activeFilter === null) return reviews;
    return reviews.filter((r) => r.rating === activeFilter);
  }, [reviews, activeFilter]);

  // ── Visible (paginated) reviews ──
  const visibleReviews = useMemo(
    () => filteredReviews.slice(0, visibleCount),
    [filteredReviews, visibleCount]
  );

  const hasMore = visibleCount < filteredReviews.length;

  // Reset pagination when filter changes
  const handleFilterChange = (star: number | null) => {
    setActiveFilter(star);
    setVisibleCount(REVIEWS_PER_PAGE);
  };

  const ownerAvatar = avatarImage ?? userImage;

  if (reviews.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="text-center py-16 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Hələ rəy yoxdur</p>
        </div>
        <ReviewForm profileId={profileId} architectName={architectName} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Rating Overview & Star Breakdown ── */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Overall rating */}
          <div className="flex flex-col items-center justify-center shrink-0 sm:min-w-[120px]">
            <p className="text-4xl font-heading font-bold text-foreground">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex items-center gap-0.5 mt-1 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {reviews.length} rəy
            </p>
          </div>

          {/* Star breakdown bars */}
          <div className="flex-1 space-y-1.5">
            {STAR_LEVELS.map((star) => {
              const count = starCounts[star] ?? 0;
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <button
                  key={star}
                  onClick={() =>
                    handleFilterChange(activeFilter === star ? null : star)
                  }
                  className={`w-full flex items-center gap-2.5 group py-0.5 rounded transition-colors ${
                    activeFilter === star
                      ? "bg-amber-50"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-xs font-medium text-muted-foreground w-8 text-right shrink-0">
                    {star} ★
                  </span>
                  <div className="flex-1 h-2.5 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        activeFilter === star
                          ? "bg-amber-500"
                          : "bg-amber-400 group-hover:bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-left shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Star Filter Buttons ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            activeFilter === null
              ? "bg-primary text-white border-primary"
              : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}
        >
          Hamısı ({reviews.length})
        </button>
        {STAR_LEVELS.map((star) => {
          const count = starCounts[star] ?? 0;
          return (
            <button
              key={star}
              onClick={() =>
                handleFilterChange(activeFilter === star ? null : star)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                activeFilter === star
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {star} ★ ({count})
            </button>
          );
        })}
      </div>

      {/* ── Reviews List ── */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-border p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-semibold text-primary">
                    {getInitials(review.reviewer?.name ?? "R")}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm">
                        {review.reviewer?.name ?? "Anonim"}
                      </p>
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Təsdiqlənmiş
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.title && (
                <p className="font-semibold text-sm mb-1">{review.title}</p>
              )}
              {review.content && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.content}
                </p>
              )}

              {/* Owner reply display */}
              {review.ownerReply && (
                <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/20 bg-primary/5 rounded-r-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                      {ownerAvatar ? (
                        <Image
                          src={ownerAvatar}
                          alt={architectName}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-primary">
                          {getInitials(architectName)}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-xs text-primary">
                      {architectName}
                    </p>
                    {review.ownerReplyAt && (
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(review.ownerReplyAt)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.ownerReply}
                  </p>
                </div>
              )}

              {/* Reply button/form for profile owner */}
              {!review.ownerReply && (
                <ReviewReply
                  reviewId={review.id}
                  profileUserId={profileUserId}
                />
              )}
            </div>
          ))}

          {/* ── Show More Button ── */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() =>
                  setVisibleCount((prev) => prev + REVIEWS_PER_PAGE)
                }
                className="text-sm"
              >
                Daha çox göstər ({filteredReviews.length - visibleCount} rəy
                qalıb)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {activeFilter} ★ reytinqli rəy yoxdur
          </p>
          <button
            onClick={() => handleFilterChange(null)}
            className="text-xs text-primary hover:underline mt-1"
          >
            Bütün rəyləri göstər
          </button>
        </div>
      )}

      {/* Review submission form */}
      <ReviewForm profileId={profileId} architectName={architectName} />
    </div>
  );
}
