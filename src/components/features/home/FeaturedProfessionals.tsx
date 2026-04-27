import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ArrowRight, Briefcase } from "lucide-react";
import { createAdminClient } from "@/lib/supabase";
import { SPECIALIZATION_LABELS } from "@/lib/utils";

export async function FeaturedProfessionals() {
  const admin = createAdminClient();

  const { data: proUsers } = await admin
    .from("users")
    .select("id")
    .eq("role", "professional");
  const proUserIds = (proUsers ?? []).map((u: any) => u.id);

  if (proUserIds.length === 0) return null;

  const { data: professionals, error } = await admin
    .from("profiles")
    .select(`
      username, tagline, city, experienceYears, averageRating, totalReviews,
      totalProjects, coverImage, avatarImage, specialization,
      users:users!userId(name, image)
    `)
    .in("userId", proUserIds)
    .or("isPublic.is.null,isPublic.eq.true")
    .order("averageRating", { ascending: false, nullsFirst: false })
    .limit(4);

  if (error) {
    console.error("[FeaturedProfessionals] query error:", error.message);
  }

  if (!professionals || professionals.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — About-style */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold text-[#0D9488] uppercase tracking-widest mb-3">
              Peşəkarlar
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 leading-[1.1] mb-3">
              Top reytinqli memarlarla tanış olun
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Yoxlanılmış portfoliosu, real müştəri rəyləri və sübut olunmuş təcrübəsi olan dizaynerlər — birbaşa əlaqə saxlayın.
            </p>
          </div>
          <Link
            href="/memarlar"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors shrink-0"
          >
            Hamısına bax
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Behance creator cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {professionals.map((pro) => {
            const user = (pro as any).users as { name?: string; image?: string } | null;
            const name = user?.name ?? pro.username ?? "Memar";
            const avatarSrc = pro.avatarImage ?? user?.image ?? null;
            const specializationLabel = pro.specialization
              ? (SPECIALIZATION_LABELS[pro.specialization] ?? pro.specialization)
              : null;

            return (
              <Link
                key={pro.username ?? name}
                href={pro.username ? `/memarlar/${pro.username}` : "/memarlar"}
                className="group block"
              >
                <div className="bg-white overflow-hidden rounded-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                  {/* Cover image */}
                  <div className="relative h-32 overflow-hidden bg-gray-100">
                    {pro.coverImage ? (
                      <Image
                        src={pro.coverImage}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-50 to-emerald-100" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                    {(pro.averageRating ?? 0) > 0 && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {(pro.averageRating ?? 0).toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Profile info */}
                  <div className="px-4 pb-4 pt-0">
                    {/* Avatar overlap + action */}
                    <div className="flex items-end justify-between -mt-5 mb-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm">
                        {avatarSrc ? (
                          <Image
                            src={avatarSrc}
                            alt={name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] font-bold text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#0D9488]/30 text-[#0D9488] font-medium group-hover:bg-[#0D9488] group-hover:text-white group-hover:border-[#0D9488] transition-all duration-200">
                        Profilə bax
                      </span>
                    </div>

                    <h3 className="font-heading font-semibold text-sm text-gray-900 mb-0.5 leading-tight">{name}</h3>
                    <p className="text-[12px] text-gray-500 mb-2.5">
                      {specializationLabel ?? pro.tagline ?? "Memar"}
                      {pro.experienceYears ? ` · ${pro.experienceYears} il` : ""}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      {pro.city && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {pro.city}
                        </span>
                      )}
                      {(pro.totalProjects ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 font-medium text-gray-600">
                          <Briefcase className="w-2.5 h-2.5" />
                          {pro.totalProjects} layihə
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="sm:hidden flex justify-center mt-6">
          <Link
            href="/memarlar"
            className="flex items-center gap-1.5 text-sm font-medium text-[#0D9488] hover:text-[#0F766E]"
          >
            Hamısına bax <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
