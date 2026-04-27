"use server";


import { createClient, createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

// ─── Portfolio Projects ───────────────────────────────────────────────────────

export async function createPortfolioProject(userId: string, input: {
  title: string;
  description?: string;
  category: string;
  location?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  year?: number;
  client?: string;
  tags?: string[];
  images: { url: string; altText?: string; caption?: string; isCover?: boolean }[];
  videoUrl?: string;
}) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("userId", userId)
    .maybeSingle();

  if (!profile) return { error: "Profil tapılmadı" };

  const slug = `${slugify(input.title)}-${Date.now()}`;
  const coverImage = input.images.find((img) => img.isCover)?.url ?? input.images[0]?.url;

  const { data: project, error } = await supabase
    .from("portfolioProjects")
    .insert({
      profileId: profile.id,
      title: input.title,
      slug,
      description: input.description,
      category: input.category,
      location: input.location,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      area: input.area,
      year: input.year,
      client: input.client,
      coverImage,
      tags: input.tags,
      videoUrl: input.videoUrl,
    })
    .select("id, slug")
    .single();

  if (error || !project) return { error: error?.message ?? "Xəta baş verdi" };

  if (input.images.length > 0) {
    await supabase.from("projectImages").insert(
      input.images.map((img, i) => ({
        portfolioProjectId: project.id,
        url: img.url,
        altText: img.altText,
        caption: img.caption,
        order: i,
        isCover: img.isCover ?? i === 0,
      }))
    );
  }

  revalidatePath("/panel/portfolio");
  revalidatePath("/layiheler");

  return { success: true, projectId: project.id, slug: project.slug };
}

export async function updatePortfolioProject(userId: string, projectId: string, input: {
  title: string;
  description?: string;
  category: string;
  location?: string;
  city?: string;
  area?: number;
  year?: number;
  client?: string;
  tags?: string[];
  videoUrl?: string;
  beforeImage?: string;
  afterImage?: string;
  isPublished?: boolean;
}) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  // Verify ownership via profile join
  const { data: project } = await supabase
    .from("portfolioProjects")
    .select("id, profile:profiles!profileId(userId)")
    .eq("id", projectId)
    .maybeSingle();

  if (!project || (project.profile as any)?.userId !== userId) {
    return { error: "İcazə yoxdur" };
  }

  const { error } = await supabase
    .from("portfolioProjects")
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      city: input.city,
      area: input.area,
      year: input.year,
      client: input.client,
      tags: input.tags,
      videoUrl: input.videoUrl ?? null,
      beforeImage: input.beforeImage ?? null,
      afterImage: input.afterImage ?? null,
      isPublished: input.isPublished,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath("/panel/portfolio");
  revalidatePath(`/layiheler/${projectId}`);

  return { success: true };
}

export async function getPortfolioProjectById(userId: string, projectId: string) {
  if (!userId) return null;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("portfolioProjects")
    .select("*, images:projectImages!portfolioProjectId(*), profile:profiles!profileId(userId)")
    .eq("id", projectId)
    .maybeSingle();

  if (!data || (data.profile as any)?.userId !== userId) return null;
  return data;
}

export async function getPortfolioProjects(opts?: {
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  profileId?: string;
}) {
  const { category, city, search, page = 1, limit = 12, profileId } = opts ?? {};
  const offset = (page - 1) * limit;
  const supabase = createAdminClient();

  let query = supabase
    .from("portfolioProjects")
    .select("*, profile:profiles!profileId(*, user:users!userId(id, name, email, image))")
    .eq("isPublished", true);

  if (category) query = query.eq("category", category);
  if (city) query = query.ilike("city", `%${city}%`);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (profileId) query = query.eq("profileId", profileId);

  const { data } = await query
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  return (data ?? []).map((p: any) => ({ ...p, images: [] }));
}

// ─── Client Projects (Marketplace) ───────────────────────────────────────────

export async function createClientProject(userId: string, input: {
  title: string;
  description: string;
  category: string;
  location?: string;
  city?: string;
  area?: number;
  budgetRange?: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: Date;
  requirements?: string;
  coverImage?: string;
  referenceImages?: string[];
  isUrgent?: boolean;
}) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { data: project, error } = await supabase
    .from("clientProjects")
    .insert({
      clientId: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      city: input.city,
      area: input.area,
      budgetRange: input.budgetRange,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      deadline: input.deadline?.toISOString(),
      requirements: input.requirements,
      coverImage: input.coverImage,
      referenceImages: input.referenceImages,
      isUrgent: input.isUrgent ?? false,
    })
    .select("id")
    .single();

  if (error || !project) return { error: error?.message ?? "Xəta baş verdi" };

  revalidatePath("/bazar");
  return { success: true, projectId: project.id };
}

export async function getMarketplaceProjects(opts?: {
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { category, city, search, page = 1, limit = 12 } = opts ?? {};
  const offset = (page - 1) * limit;
  const supabase = createAdminClient();

  let query = supabase
    .from("clientProjects")
    .select("*, client:users!clientId(*)")
    .eq("status", "open");

  if (category) query = query.eq("category", category);
  if (city) query = query.ilike("city", `%${city}%`);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const { data } = await query
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  return data ?? [];
}

export async function getClientProjectById(id: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("clientProjects")
    .select("*, client:users!clientId(*)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getMyProposals(userId: string) {
  if (!userId) return [];
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("userId", userId)
    .maybeSingle();

  if (!profile) return [];

  const { data } = await supabase
    .from("proposals")
    .select("*, clientProject:clientProjects!clientProjectId(*)")
    .eq("professionalId", profile.id)
    .order("createdAt", { ascending: false });

  return data ?? [];
}

export async function getMyClientProjects(userId: string) {
  if (!userId) return [];
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("clientProjects")
    .select("*")
    .eq("clientId", userId)
    .order("createdAt", { ascending: false });

  return data ?? [];
}

// ─── Proposals ───────────────────────────────────────────────────────────────

export async function submitProposal(userId: string, input: {
  clientProjectId: string;
  message: string;
  proposedPrice?: number;
  estimatedDuration?: string;
}) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("userId", userId)
    .maybeSingle();

  if (!profile) return { error: "Profil tapılmadı" };

  const { data: existing } = await supabase
    .from("proposals")
    .select("id")
    .eq("clientProjectId", input.clientProjectId)
    .eq("professionalId", profile.id)
    .maybeSingle();

  if (existing) return { error: "Artıq bu layihəyə təklif göndərdiniz" };

  const { error } = await supabase.from("proposals").insert({
    clientProjectId: input.clientProjectId,
    professionalId: profile.id,
    message: input.message,
    proposedPrice: input.proposedPrice,
    estimatedDuration: input.estimatedDuration,
  });

  if (error) return { error: error.message };

  // Increment proposal count
  const { data: proj } = await supabase
    .from("clientProjects")
    .select("proposalCount")
    .eq("id", input.clientProjectId)
    .single();

  if (proj) {
    await supabase
      .from("clientProjects")
      .update({ proposalCount: (proj.proposalCount ?? 0) + 1 })
      .eq("id", input.clientProjectId);
  }

  revalidatePath(`/bazar/${input.clientProjectId}`);
  return { success: true };
}

export async function getProjectProposals(projectId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select(`
      *,
      professional:profiles!professionalId(
        id, username, avatarImage, specialization, city, averageRating,
        user:users!userId(name, image)
      )
    `)
    .eq("clientProjectId", projectId)
    .order("createdAt", { ascending: false });
  return data ?? [];
}

export async function respondToProposal(
  userId: string,
  proposalId: string,
  status: "accepted" | "rejected"
) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("clientProjectId")
    .eq("id", proposalId)
    .maybeSingle();

  if (!proposal) return { error: "Təklif tapılmadı" };

  const { error } = await supabase
    .from("proposals")
    .update({ status })
    .eq("id", proposalId);

  if (error) return { error: error.message };

  if (status === "accepted") {
    await supabase
      .from("clientProjects")
      .update({ status: "in_progress" })
      .eq("id", proposal.clientProjectId);
  }

  revalidatePath(`/panel/layihelerim`);
  revalidatePath(`/bazar/${proposal.clientProjectId}`);
  return { success: true };
}

export async function updateProjectStatus(
  userId: string,
  projectId: string,
  status: "open" | "in_progress" | "completed" | "cancelled"
) {
  if (!userId) return { error: "Giriş tələb olunur" };
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("clientProjects")
    .update({ status })
    .eq("id", projectId)
    .eq("clientId", userId);

  if (error) return { error: error.message };

  revalidatePath("/panel/layihelerim");
  revalidatePath(`/bazar/${projectId}`);
  return { success: true };
}
