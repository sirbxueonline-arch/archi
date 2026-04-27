import { Suspense } from "react";
import Link from "next/link";
import { getMarketplaceProjects } from "@/server/actions/projects";
import { Plus, BriefcaseBusiness, MapPin, DollarSign, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LABELS, BUDGET_RANGE_LABELS, formatRelativeTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Layihə Bazarı – ArchiLink",
  description: "Açıq memarlıq və dizayn layihələrini kəşf edin. Professionallar üçün real iş imkanları.",
};

interface ResolvedSearchParams {
  kateqoriya?: string;
  seher?: string;
  sehife?: string;
}

interface PageProps {
  searchParams: Promise<ResolvedSearchParams>;
}

function BazarPaginationControls({
  page,
  hasMore,
  searchParams,
}: {
  page: number;
  hasMore: boolean;
  searchParams: ResolvedSearchParams;
}) {
  if (page <= 1 && !hasMore) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.kateqoriya) params.set("kateqoriya", searchParams.kateqoriya);
    if (searchParams.seher) params.set("seher", searchParams.seher);
    params.set("sehife", String(p));
    return `/bazar?${params.toString()}`;
  };

  return (
    <div className="col-span-full flex items-center justify-center gap-3 mt-10">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="px-5 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ← Əvvəlki
        </Link>
      )}
      <span className="text-sm text-gray-400">Səhifə {page}</span>
      {hasMore && (
        <Link
          href={buildUrl(page + 1)}
          className="px-5 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Növbəti →
        </Link>
      )}
    </div>
  );
}

async function ProjectsList({ searchParams }: { searchParams: ResolvedSearchParams }) {
  const { kateqoriya, seher, sehife = "1" } = searchParams;
  const page = parseInt(sehife, 10);
  const limit = 12;

  const projects = await getMarketplaceProjects({
    category: kateqoriya,
    city: seher,
    page,
    limit,
  });

  if (projects.length === 0) {
    return (
      <>{/* Empty State */}
      <div className="col-span-full py-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mb-6">
          <BriefcaseBusiness className="w-10 h-10 text-primary/40" />
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">
          Hələ layihə yoxdur
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mb-8">
          Bu kateqoriyada açıq layihə tapılmadı. Siz ilk layihəni yerləşdirin!
        </p>
        <Link
          href="/bazar/yeni"
          className="inline-flex items-center gap-2 bg-[#0D9488] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0F766E] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Layihə Elan Et
        </Link>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-sm opacity-30 pointer-events-none">
          {/* Ghost/placeholder cards to show what listings look like */}
          {[1,2,3].map(i => (
            <div key={i} className="rounded-xl border border-border bg-white h-32 animate-pulse" />
          ))}
        </div>
      </div></>
    );
  }

  const hasMore = projects.length === limit;

  return (
    <>
      {projects.map((project) => (
        <Link key={project.id} href={`/bazar/${project.id}`}>
          <div className="group bg-white rounded-sm border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[project.category] ?? project.category}
                    </Badge>
                    {project.isUrgent && (
                      <Badge className="text-xs bg-red-100 text-red-700 border-0">
                        🔥 Təcili
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-sm leading-tight mb-1">
                    {project.title}
                  </h3>
                </div>
                <Badge variant="success" className="shrink-0 text-xs">
                  Açıq
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                {project.description}
              </p>

              <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
                {project.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {project.city}
                    {project.area && ` · ${project.area} m²`}
                  </span>
                )}
                {project.budgetRange && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {BUDGET_RANGE_LABELS[project.budgetRange]}
                  </span>
                )}
                {project.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Son tarix:{" "}
                    {new Date(project.deadline).toLocaleDateString("az-AZ")}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-xs font-bold text-[#0D9488]">
                    {project.client?.name?.[0] ?? "M"}
                  </div>
                  <span className="text-xs text-gray-500">
                    {project.client?.name ?? "Anonim"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {project.proposalCount} təklif
                  </span>
                  <span>{formatRelativeTime(project.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      <BazarPaginationControls
        page={page}
        hasMore={hasMore}
        searchParams={searchParams}
      />
    </>
  );
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const resolvedSearch = await searchParams;
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                Layihə Bazarı
              </h1>
              <p className="text-gray-500 text-sm">
                Real müştərilərin elan etdiyi layihələr
              </p>
            </div>
            <Link href="/bazar/yeni" className="shrink-0">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors w-full sm:w-auto justify-center">
                <Plus className="w-4 h-4" />
                Layihə Elan Et
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Behance-style category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {[
            { value: "", label: "Hamısı" },
            ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          ].map((cat) => {
            const isActive = resolvedSearch.kateqoriya === cat.value || (!resolvedSearch.kateqoriya && cat.value === "");
            return (
              <Link
                key={cat.value}
                href={cat.value ? `/bazar?kateqoriya=${cat.value}` : "/bazar"}
                className="shrink-0"
              >
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0D9488] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}>
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Suspense
            fallback={[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-sm border border-gray-100 p-5 space-y-3 bg-white">
                <Skeleton className="h-4 w-1/3 rounded-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          >
            <ProjectsList searchParams={resolvedSearch} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
