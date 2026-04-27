"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/server/actions/follows";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

interface FollowButtonProps {
  followingId: string;
}

export function FollowButton({ followingId }: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("followerId", session.user.id)
        .eq("followingId", followingId)
        .maybeSingle();
      setFollowing(!!data);
      setLoading(false);
    });
  }, [followingId]);

  const handleClick = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Giriş tələb olunur");
      setLoading(false);
      return;
    }
    const result = await toggleFollow(session.user.id, followingId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setFollowing(result.following);
      toast.success(result.following ? "İzlənilir" : "İzləmə dayandırıldı");
    }
    setLoading(false);
  };

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      className="gap-1.5"
      onClick={handleClick}
      disabled={loading}
    >
      {following ? (
        <UserCheck className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {following ? "İzlənilir" : "İzlə"}
    </Button>
  );
}
