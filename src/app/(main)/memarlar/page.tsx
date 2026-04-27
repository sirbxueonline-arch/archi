import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";
import { ProfessionalsGrid } from "@/components/features/professionals/ProfessionalsGrid";
import { SearchFilters } from "@/components/features/search/SearchFilters";
import { SavedSearches } from "@/components/features/search/SavedSearches";
import { ResultsToolbar } from "@/components/features/search/ResultsToolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentlyViewed } from "@/components/features/professionals/RecentlyViewed";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Azərbaycanın Ən Yaxşı Memarları | ArchiLink",
  description: "Bakı və bütün Azərbaycanda peşəkar memarlar, interyer dizaynerlər və landşaft memarları. Portfolio, reytinq və bilavasitə əlaqə.",
};

interface ResolvedSearchParams {
  ixtisas?: string;
  seher?: string;
  axtaris?: string;
  sehife?: string;
  qiymet_min?: string;
  qiymet_max?: string;
  min_reytinq?: string;
  tecrube?: string;
  tesdiqlenib?: string;
  siralama?: string;
  musaid?: string;
}

interface PageProps {
  searchParams: Promise<ResolvedSearchParams>;
}

function PaginationControls({
  page,
  total,
  limit,
  searchParams,
}: {
  page: number;
  total: number;
  limit: number;
  searchParams: ResolvedSearchParams;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.ixtisas) params.set("ixtisas", searchParams.ixtisas);
    if (searchParams.seher) params.set("seher", searchParams.seher);
    if (searchParams.axtaris) params.set("axtaris", searchParams.axtaris);
    if (searchParams.qiymet_min) params.set("qiymet_min", searchParams.qiymet_min);
    if (searchParams.qiymet_max) params.set("qiymet_max", searchParams.qiymet_max);
    if (searchParams.min_reytinq) params.set("min_reytinq", searchParams.min_reytinq);
    if (searchParams.tecrube) params.set("tecrube", searchParams.tecrube);
    if (searchParams.tesdiqlenib) params.set("tesdiqlenib", searchParams.tesdiqlenib);
    if (searchParams.siralama) params.set("siralama", searchParams.siralama);
    if (searchParams.musaid) params.set("musaid", searchParams.musaid);
    params.set("sehife", String(p));
    return `/memarlar?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted transition-colors"
        >
          ← Əvvəlki
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={buildUrl(page + 1)}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted transition-colors"
        >
          Növbəti →
        </Link>
      )}
    </div>
  );
}

/** Parse the experience range filter into min/max years */
function parseExperienceRange(tecrube: string): { min: number; max: number | null } {
  switch (tecrube) {
    case "1-3": return { min: 1, max: 3 };
    case "3-5": return { min: 3, max: 5 };
    case "5-10": return { min: 5, max: 10 };
    case "10+": return { min: 10, max: null };
    default: return { min: 0, max: null };
  }
}

async function ProfessionalsList({ searchParams }: { searchParams: ResolvedSearchParams }) {
  const {
    ixtisas, seher, axtaris, sehife = "1",
    qiymet_min, qiymet_max, min_reytinq, tecrube,
    tesdiqlenib, siralama, musaid,
  } = searchParams;
  const page = parseInt(sehife, 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  const admin = createAdminClient();

  // Use admin client to bypass RLS and get all professional user IDs
  const { data: proUsers } = await admin
    .from("users")
    .select("id")
    .eq("role", "professional");
  const proUserIds = (proUsers ?? []).map((u: any) => u.id);

  if (proUserIds.length === 0) {
    return (
      <ResultsToolbar totalCount={0}>
        <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">Peşəkar tapılmadı</p>
        </div>
      </ResultsToolbar>
    );
  }

  let query = admin
    .from("profiles")
    .select(`
      id, username, bio, tagline, city, specialization, experienceYears,
      averageRating, totalReviews, totalProjects, isAvailable, hourlyRate,
      avatarImage, coverImage, createdAt, updatedAt,
      user:users!userId(id, name, email, image, role),
      portfolioProjects(id, title, coverImage, isPublished),
      verificationBadges(id, badge, isActive)
    `)
    .in("userId", proUserIds)
    .or("isPublic.is.null,isPublic.eq.true");

  if (ixtisas) query = query.eq("specialization", ixtisas);
  if (seher) query = query.ilike("city", `%${seher}%`);
  if (axtaris) {
    const { data: matchingUsers } = await admin
      .from("users")
      .select("id")
      .ilike("name", `%${axtaris}%`);
    const matchingUserIds = (matchingUsers ?? []).map((u: any) => u.id);
    if (matchingUserIds.length > 0) {
      const inList = matchingUserIds.join(",");
      query = query.or(`bio.ilike.%${axtaris}%,tagline.ilike.%${axtaris}%,userId.in.(${inList})`);
    } else {
      query = query.or(`bio.ilike.%${axtaris}%,tagline.ilike.%${axtaris}%`);
    }
  }

  // Hourly rate filters
  if (qiymet_min) {
    const min = parseInt(qiymet_min, 10);
    if (!isNaN(min)) query = query.gte("hourlyRate", min);
  }
  if (qiymet_max) {
    const max = parseInt(qiymet_max, 10);
    if (!isNaN(max)) query = query.lte("hourlyRate", max);
  }

  // Minimum rating
  if (min_reytinq) {
    const rating = parseInt(min_reytinq, 10);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      query = query.gte("averageRating", rating);
    }
  }

  // Experience range
  if (tecrube) {
    const { min, max } = parseExperienceRange(tecrube);
    if (min > 0) query = query.gte("experienceYears", min);
    if (max !== null) query = query.lte("experienceYears", max);
  }

  // Verified only
  if (tesdiqlenib === "true") {
    // Filter profiles that have at least one active verification badge
    query = query.not("verificationBadges", "is", null);
  }

  // Availability
  if (musaid === "true") query = query.eq("isAvailable", true);
  if (musaid === "false") query = query.eq("isAvailable", false);

  // Apply sort
  switch (siralama) {
    case "reytinq":
      query = query.order("averageRating", { ascending: false, nullsFirst: false });
      break;
    case "rey":
      query = query.order("totalReviews", { ascending: false, nullsFirst: false });
      break;
    case "qiymet_asagi":
      query = query.order("hourlyRate", { ascending: true, nullsFirst: false });
      break;
    case "qiymet_yuxari":
      query = query.order("hourlyRate", { ascending: false, nullsFirst: false });
      break;
    case "yeni":
      query = query.order("createdAt", { ascending: false });
      break;
    default:
      // Relevance: sort by projects then rating
      query = query
        .order("totalProjects", { ascending: false })
        .order("averageRating", { ascending: false });
      break;
  }

  const { data: results } = await query.range(offset, offset + limit - 1);

  // Count query with same filters
  let countQuery = admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("userId", proUserIds)
    .or("isPublic.is.null,isPublic.eq.true");

  if (ixtisas) countQuery = countQuery.eq("specialization", ixtisas);
  if (seher) countQuery = countQuery.ilike("city", `%${seher}%`);
  if (axtaris) {
    const { data: matchingUsers } = await admin
      .from("users")
      .select("id")
      .ilike("name", `%${axtaris}%`);
    const matchingUserIds = (matchingUsers ?? []).map((u: any) => u.id);
    if (matchingUserIds.length > 0) {
      const inList = matchingUserIds.join(",");
      countQuery = countQuery.or(`bio.ilike.%${axtaris}%,tagline.ilike.%${axtaris}%,userId.in.(${inList})`);
    } else {
      countQuery = countQuery.or(`bio.ilike.%${axtaris}%,tagline.ilike.%${axtaris}%`);
    }
  }
  if (qiymet_min) {
    const min = parseInt(qiymet_min, 10);
    if (!isNaN(min)) countQuery = countQuery.gte("hourlyRate", min);
  }
  if (qiymet_max) {
    const max = parseInt(qiymet_max, 10);
    if (!isNaN(max)) countQuery = countQuery.lte("hourlyRate", max);
  }
  if (min_reytinq) {
    const rating = parseInt(min_reytinq, 10);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      countQuery = countQuery.gte("averageRating", rating);
    }
  }
  if (tecrube) {
    const { min, max } = parseExperienceRange(tecrube);
    if (min > 0) countQuery = countQuery.gte("experienceYears", min);
    if (max !== null) countQuery = countQuery.lte("experienceYears", max);
  }
  if (tesdiqlenib === "true") {
    countQuery = countQuery.not("verificationBadges", "is", null);
  }
  if (musaid === "true") countQuery = countQuery.eq("isAvailable", true);
  if (musaid === "false") countQuery = countQuery.eq("isAvailable", false);

  const { count } = await countQuery;

  const professionals = (results ?? []).map((pro: any) => ({
    ...pro,
    portfolioProjects: (pro.portfolioProjects ?? []).filter((p: any) => p.isPublished),
    verificationBadges: pro.verificationBadges ?? [],
  }));

  return (
    <ResultsToolbar totalCount={count ?? 0}>
      <ProfessionalsGrid professionals={professionals as any} />
      <PaginationControls
        page={page}
        total={count ?? 0}
        limit={limit}
        searchParams={searchParams}
      />
    </ResultsToolbar>
  );
}

export default async function ProfessionalsPage({ searchParams }: PageProps) {
  const resolvedSearch = await searchParams;
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Memarlar</h1>
          <p className="text-gray-500 text-sm">
            Azərbaycanın ən yaxşı memarlıq və dizayn professionallarını kəşf edin
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters — pushed below results on mobile */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <Suspense fallback={<div className="h-96 rounded-2xl bg-muted animate-pulse" />}>
              <SearchFilters />
            </Suspense>
          </aside>

          {/* Main Content — first on mobile */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Recently viewed architects */}
            <RecentlyViewed />

            {/* Saved searches toolbar -- sits above the grid */}
            <div className="flex items-center justify-end mb-4">
              <Suspense fallback={null}>
                <SavedSearches />
              </Suspense>
            </div>

            <Suspense
              fallback={
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-border">
                      <Skeleton className="h-36" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <ProfessionalsList searchParams={resolvedSearch} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
