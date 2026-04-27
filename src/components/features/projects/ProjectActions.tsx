"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

interface ProjectActionsProps {
  projectId: string;
  likeCount?: number;
}

export function ProjectActions({ projectId, likeCount = 0 }: ProjectActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(likeCount);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);

      // Check if already liked (favorites table)
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("userId", session.user.id)
        .eq("portfolioProjectId", projectId)
        .maybeSingle();
      setLiked(!!data);
    };
    init();
  }, [projectId]);

  const handleLike = async () => {
    if (!userId) {
      toast.error("Bəyənmək üçün daxil olun");
      return;
    }
    const supabase = createClient();
    if (liked) {
      await supabase
        .from("favorites")
        .delete()
        .eq("userId", userId)
        .eq("portfolioProjectId", projectId);
      setLiked(false);
      const newCount = Math.max(0, likes - 1);
      setLikes(newCount);
      // Update likeCount directly
      await supabase
        .from("portfolioProjects")
        .update({ likeCount: newCount })
        .eq("id", projectId);
    } else {
      await supabase.from("favorites").insert({
        userId,
        portfolioProjectId: projectId,
      });
      setLiked(true);
      const newCount = likes + 1;
      setLikes(newCount);
      await supabase
        .from("portfolioProjects")
        .update({ likeCount: newCount })
        .eq("id", projectId);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link kopyalandı!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="icon-sm"
        onClick={handleLike}
        className={
          liked
            ? "bg-red-500/90 text-white hover:bg-red-500"
            : "bg-white/20 text-white hover:bg-white/30"
        }
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
      </Button>
      <Button
        size="icon-sm"
        onClick={handleShare}
        className="bg-white/20 text-white hover:bg-white/30"
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}
