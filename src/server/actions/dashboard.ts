"use server";

import { createAdminClient } from "@/lib/supabase";

export async function getDashboardData(userId: string) {
  if (!userId) return null;

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("userId", userId)
    .maybeSingle();

  const [portfolioResult, convosResult, proposalsResult, projectsResult] = await Promise.all([
    profile
      ? supabase
          .from("portfolioProjects")
          .select("*")
          .eq("profileId", profile.id)
          .order("createdAt", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),
    supabase
      .from("conversations")
      .select("*")
      .or(`participantOneId.eq.${userId},participantTwoId.eq.${userId}`)
      .order("lastMessageAt", { ascending: false })
      .limit(3),
    profile
      ? supabase
          .from("proposals")
          .select("*, clientProject:clientProjects!clientProjectId(*)")
          .eq("professionalId", profile.id)
          .eq("status", "pending")
          .order("createdAt", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    supabase
      .from("clientProjects")
      .select("*")
      .eq("clientId", userId)
      .order("createdAt", { ascending: false })
      .limit(5),
  ]);

  return {
    profile: profile
      ? { ...profile, portfolioProjects: portfolioResult.data ?? [] }
      : null,
    messageConvos: convosResult.data ?? [],
    pendingProposals: proposalsResult.data ?? [],
    recentProjects: projectsResult.data ?? [],
  };
}
