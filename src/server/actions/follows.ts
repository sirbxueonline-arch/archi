"use server";

import { createAdminClient } from "@/lib/supabase";

export async function toggleFollow(userId: string, followingId: string): Promise<{ following: boolean; error?: string }> {
  if (!userId) return { following: false, error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("followerId", userId)
    .eq("followingId", followingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete()
      .eq("followerId", userId)
      .eq("followingId", followingId);
    return { following: false };
  } else {
    await supabase.from("follows").insert({ followerId: userId, followingId });
    return { following: true };
  }
}

export async function getFollowState(userId: string, followingId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("followerId", userId)
    .eq("followingId", followingId)
    .maybeSingle();

  return !!data;
}
