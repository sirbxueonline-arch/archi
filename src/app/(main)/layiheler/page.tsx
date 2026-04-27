import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPortfolioProjects } from "@/server/actions/projects";
import { CATEGORY_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memarlıq Layihələri | ArchiLink",
  description: "Azərbaycanın ən yaxşı memarlıq və dizayn layihələri. Résidensiya, kommersiya, landşaft və interyer layihələri.",
};

interface ResolvedSearchParams {
  kateqoriya?: string;
  seher?: string;
  axtaris?: string;
  sehife?: string;
}

interface PageProps {
  searchParams: Promise<ResolvedSearchParams>;
}

const categories = [
  { value: "", label: "Hamısı" },
  { value: "architecture", label: "Memarlıq" },
  { value: "interior", label: "İnteryer" },
  { value: "landscape", label: "Landşaft" },
  { value: "urban", label: "Urban Dizayn" },
  { value: "residential", label: "Yaşayış" },
  { value: "commercial", label: "Kommersiya" },
];

const categoryColors: Record<string, string> = {
  architecture: "bg-blue-100 text-blue-700",
  urban: "bg-orange-100 text-orange-700",
  interior: "bg-violet-100 text-violet-700",
  landscape: "bg-emerald-100 text-emerald-700",
  renovation: "bg-yellow-100 text-yellow-700",
  commercial: "bg-sky-100 text-sky-700",
  residential: "bg-indigo-100 text-indigo-700",
  mixed_use: "bg-pink-100 text-pink-700",
};

async function ProjectsGallery({ searchParams }: { searchParams: ResolvedSearchParams }) {
  const projects = await getPortfolioProjects({
    category: searchParams.kateqoriya,
    city: searchParams.seher,
    search: searchParams.axtaris,
    page: parseInt(searchParams.sehife ?? "1", 10),
    limit: 18,
  });

  if (projects.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p className="text-lg font-medium">Layihə tapılmadı</p>
        <p className="text-sm mt-1">Digər filtrlər seçin</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {projects.map((project, i) => {
        const coverImg = project.coverImage ?? project.images?.[0]?.url;
        const authorName = project.profile?.user?.name ?? project.profile?.username ?? "Memar";
        const authorAvatar = (project.profile as any)?.avatarImage ?? project.profile?.user?.image ?? null;
        const colorClass = categoryColors[project.category] ?? "bg-gray-100 text-gray-600";

        return (
          <div key={project.id} className="masonry-item">
            <Link href={`/layiheler/${project.id}`} className="group block">
              {/* Image */}
              <div
                className="relative overflow-hidden bg-gray-100 rounded-sm"
                style={{
                  aspectRatio: i % 5 === 0 ? "3/4" : i % 5 === 2 ? "16/9" : "4/3",
                }}
              >
                {coverImg ? (
                  <Image
                    src={coverImg}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-50 to-emerald-100" />
                )}

                {/* Behance-style hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm line-clamp-2 mb-2 leading-snug">
                      {project.title}
                    </p>
                    <div className="flex items-center gap-4 text-white/80 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {project.likeCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {project.viewCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category badge — shown on hover */}
                <div className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                    {CATEGORY_LABELS[project.category] ?? project.category}
                  </span>
                </div>
              </div>

              {/* Author row */}
              <div className="flex items-center justify-between mt-2.5 px-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    {authorAvatar ? (
                      <Image
                        src={authorAvatar}
                        alt={authorName}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] text-[9px] font-bold">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 truncate font-medium">{authorName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {project.likeCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {project.viewCount ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const resolvedSearch = await searchParams;
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Page header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Layihələr</h1>
          <p className="text-gray-500 text-sm">
            Azərbaycanın ən gözəl memarlıq işlərini kəşf edin
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Behance-style category filter bar */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-10 scrollbar-hide">
          {categories.map((cat) => {
            const isActive =
              resolvedSearch.kateqoriya === cat.value ||
              (!resolvedSearch.kateqoriya && cat.value === "");
            return (
              <Link
                key={cat.value}
                href={cat.value ? `/layiheler?kateqoriya=${cat.value}` : "/layiheler"}
                className="shrink-0"
              >
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#0D9488] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                  }`}
                >
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Suspense
          fallback={
            <div className="masonry-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="masonry-item">
                  <Skeleton
                    className="w-full rounded-sm"
                    style={{
                      height: i % 3 === 0 ? "280px" : i % 3 === 1 ? "220px" : "200px",
                    }}
                  />
                  <div className="flex items-center gap-2 mt-2.5 px-0.5">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <ProjectsGallery searchParams={resolvedSearch} />
        </Suspense>
      </div>
    </div>
  );
}
