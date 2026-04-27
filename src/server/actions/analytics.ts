"use server";

import { createAdminClient } from "@/lib/supabase";

export async function getAnalyticsData(userId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, profileViews, averageRating, totalReviews, totalProjects")
    .eq("userId", userId)
    .maybeSingle();

  if (!profile) return null;

  const [portfolioRes, proposalsRes, reviewsRes, followersRes] = await Promise.all([
    supabase
      .from("portfolioProjects")
      .select("id, title, viewCount, likeCount, category, createdAt")
      .eq("profileId", profile.id)
      .order("viewCount", { ascending: false }),
    supabase
      .from("proposals")
      .select("id, status, createdAt")
      .eq("professionalId", profile.id)
      .order("createdAt", { ascending: false }),
    supabase
      .from("reviews")
      .select("id, rating, createdAt")
      .eq("profileId", profile.id)
      .order("createdAt", { ascending: false }),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("followingId", profile.id),
  ]);

  const projects = portfolioRes.data ?? [];
  const proposals = proposalsRes.data ?? [];
  const reviews = reviewsRes.data ?? [];

  // Proposal conversion rate
  const totalProposals = proposals.length;
  const acceptedProposals = proposals.filter((p) => p.status === "accepted").length;
  const conversionRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;

  // Monthly views (last 6 months from projects)
  const now = new Date();
  const monthlyData: { month: string; views: number; likes: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData.push({
      month: d.toLocaleDateString("az-AZ", { month: "short" }),
      views: 0,
      likes: 0,
    });
  }
  // Sum project views/likes into months (approximation using createdAt)
  projects.forEach((p) => {
    const created = new Date(p.createdAt);
    const monthsAgo = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 6) {
      const idx = 5 - monthsAgo;
      monthlyData[idx].views += p.viewCount ?? 0;
      monthlyData[idx].likes += p.likeCount ?? 0;
    }
  });

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  projects.forEach((p) => {
    if (p.category) categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1;
  });

  return {
    overview: {
      profileViews: profile.profileViews ?? 0,
      averageRating: profile.averageRating ?? 0,
      totalReviews: profile.totalReviews ?? 0,
      totalProjects: projects.length,
      followers: followersRes.count ?? 0,
      totalProposals,
      acceptedProposals,
      conversionRate,
    },
    topProjects: projects.slice(0, 5),
    monthlyData,
    categoryBreakdown: Object.entries(categoryMap).map(([cat, count]) => ({ category: cat, count })),
    recentReviews: reviews.slice(0, 5),
  };
}
