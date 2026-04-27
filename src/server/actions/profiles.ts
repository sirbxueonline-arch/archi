"use server";

import { createClient, createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface UpdateProfileInput {
  username?: string;
  bio?: string;
  tagline?: string;
  city?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  specialization?: string;
  experienceYears?: number;
  experienceLevel?: string;
  isAvailable?: boolean;
  hourlyRate?: number;
  coverImage?: string;
  avatarImage?: string;
  studioName?: string;
  teamSize?: number;
  minProjectBudget?: number;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!userId) return { error: "Giriş tələb olunur" };

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("userId", userId)
      .maybeSingle();

    if (!profile) return { error: "Profil tapılmadı" };

    if (input.username && input.username !== profile.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", input.username)
        .maybeSingle();
      if (existing) return { error: "Bu istifadəçi adı artıq mövcuddur" };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ ...input, updatedAt: new Date().toISOString() })
      .eq("userId", userId);

    if (updateErr) return { error: updateErr.message };

    revalidatePath("/panel/profil");
    revalidatePath(`/memarlar/${input.username ?? profile.username}`);

    return { success: true };
  } catch (error) {
    console.error("[updateProfile]", error);
    return { error: "Profil yenilənərkən xəta baş verdi" };
  }
}

export async function getProfileByUsername(username: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      user:users!userId(id, name, email, image),
      portfolioProjects(*),
      profileSkills(*, skill:skills!skillId(*)),
      verificationBadges(*)
    `)
    .eq("username", username)
    .maybeSingle();

  if (!profile) return null;

  // Fetch published reviews with reviewer info
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:users!reviewerId(id, name, image)")
    .eq("profileId", profile.id)
    .eq("isPublished", true)
    .order("createdAt", { ascending: false })
    .limit(10);

  return {
    ...profile,
    portfolioProjects: ((profile.portfolioProjects as any[]) ?? [])
      .filter((p) => p.isPublished)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    verificationBadges: ((profile.verificationBadges as any[]) ?? []).filter((b) => b.isActive),
    reviews: reviews ?? [],
  };
}

export async function getMyProfile(userId: string) {
  if (!userId) return null;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      profileSkills(*, skill:skills!skillId(*)),
      portfolioProjects(*),
      reviews(*, reviewer:users!reviewerId(id, name, image))
    `)
    .eq("userId", userId)
    .maybeSingle();

  if (!profile) return null;

  return {
    ...profile,
    portfolioProjects: ((profile.portfolioProjects as any[]) ?? [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20),
    reviews: ((profile.reviews as any[]) ?? []).filter((r) => r.isPublished),
  };
}
