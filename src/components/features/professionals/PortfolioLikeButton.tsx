"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface PortfolioLikeButtonProps {
  projectId: string;
  initialLikeCount: number;
}

export function PortfolioLikeButton({ projectId, initialLikeCount }: PortfolioLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikeCount ?? 0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    try {
      const key = `archilink_likes`;
      const liked = JSON.parse(localStorage.getItem(key) || "[]");
      setLiked(liked.includes(projectId));
    } catch {}
  }, [projectId]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const key = `archilink_likes`;
    let likedList: string[] = [];
    try { likedList = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}

    const newLiked = !liked;
    setLiked(newLiked);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    const newCount = newLiked ? count + 1 : Math.max(0, count - 1);
    setCount(newCount);

    if (newLiked) {
      likedList.push(projectId);
    } else {
      likedList = likedList.filter((id) => id !== projectId);
    }
    try { localStorage.setItem(key, JSON.stringify(likedList)); } catch {}

    // Update DB
    const supabase = createClient();
    await supabase
      .from("portfolioProjects")
      .update({ likeCount: newCount })
      .eq("id", projectId);
  };

  return (
    <button
      onClick={toggleLike}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all",
        liked
          ? "text-red-500 bg-red-50 hover:bg-red-100"
          : "text-muted-foreground bg-white/80 hover:bg-muted"
      )}
      title={liked ? "Bəyənildi" : "Bəyən"}
    >
      <Heart
        className={cn(
          "w-3.5 h-3.5 transition-transform",
          liked && "fill-current",
          animating && "scale-125"
        )}
      />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
