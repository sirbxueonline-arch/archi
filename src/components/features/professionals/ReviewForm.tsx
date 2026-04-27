"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReviewFormProps {
  profileId: string;
  architectName: string;
}

export function ReviewForm({ profileId, architectName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error("Zəhmət olmasa reytinq seçin"); return; }
    setSubmitting(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Rəy yazmaq üçün daxil olun"); setSubmitting(false); return; }

    const { error } = await supabase.from("reviews").insert({
      profileId,
      reviewerId: session.user.id,
      rating,
      content: content.trim() || null,
      isPublished: false, // needs moderation
    });

    if (error) {
      toast.error("Xəta baş verdi");
    } else {
      setSubmitted(true);
      toast.success("Rəyiniz göndərildi. Yoxlamadan sonra dərc olunacaq.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
        <p className="text-emerald-700 font-medium">Rəyiniz göndərildi!</p>
        <p className="text-emerald-600 text-sm mt-1">Yoxlamadan sonra dərc olunacaq.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-heading font-semibold mb-4">{architectName} haqqında rəy yazın</h3>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hovered || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {["", "Zəif", "Normal", "Yaxşı", "Çox Yaxşı", "Əla"][rating]}
          </span>
        )}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Təcrübənizi bölüşün (ixtiyari)..."
        className="mb-4 min-h-[80px]"
        maxLength={500}
      />

      <Button
        onClick={handleSubmit}
        disabled={!rating || submitting}
        variant="gradient"
        className="w-full"
        loading={submitting}
      >
        Rəy Göndər
      </Button>
    </div>
  );
}
