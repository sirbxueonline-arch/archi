import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { CATEGORY_LABELS } from "@/lib/utils";

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

export async function FeaturedProjects() {
  const supabase = createClient();

  const { data: projects } = await supabase
    .from("portfolioProjects")
    .select(`
      id, title, coverImage, category, city, likeCount, viewCount, isFeatured,
      profile:profiles!profileId(
        username, avatarImage,
        user:users!userId(name, image)
      )
    `)
    .eq("isPublished", true)
    .order("isFeatured", { ascending: false })
    .order("likeCount", { ascending: false })
    .limit(8);

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — About-style */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold text-[#0D9488] uppercase tracking-widest mb-3">
              Layihələr
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 leading-[1.1] mb-3">
              Seçilmiş işləri kəşf edin
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Azərbaycanın memar və dizaynerlərinin ən yaxşı işlərinə yaxından baxın — yaşayış, kommersiya, interyer və landşaft.
            </p>
          </div>
          <Link
            href="/layiheler"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors shrink-0"
          >
            Hamısına bax
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Behance-style grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {projects.map((project) => {
            const profile = project.profile as {
              username?: string;
              avatarImage?: string;
              user?: { name?: string; image?: string };
            } | null;
            const authorName = profile?.user?.name ?? profile?.username ?? "Memar";
            const authorAvatar = profile?.avatarImage ?? profile?.user?.image ?? null;
            const categoryLabel = CATEGORY_LABELS[project.category] ?? project.category;
            const colorClass = categoryColors[project.category] ?? "bg-gray-100 text-gray-600";

            return (
              <Link key={project.id} href={`/layiheler/${project.id}`} className="group block">
                {/* Image container — Behance style */}
                <div className="relative overflow-hidden bg-gray-100 aspect-[4/3] rounded-sm">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-emerald-100" />
                  )}

                  {/* Hover overlay — Behance style */}
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

                  {/* Category badge */}
                  <div className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                      {categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Author row — Behance style */}
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
            );
          })}
        </div>

        <div className="sm:hidden flex justify-center mt-6">
          <Link
            href="/layiheler"
            className="flex items-center gap-1.5 text-sm font-medium text-[#0D9488] hover:text-[#0F766E]"
          >
            Hamısına bax <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
