"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, CheckCircle, Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  SPECIALIZATION_LABELS,
  BADGE_LABELS,
  getInitials,
} from "@/lib/utils";
import { ProfessionalListCard } from "./ProfessionalListCard";
import { useViewMode } from "@/components/features/search/ViewModeContext";

interface ProfessionalWithRelations {
  id: string;
  username: string | null;
  bio: string | null;
  tagline: string | null;
  city: string | null;
  specialization: string | null;
  experienceYears: number | null;
  averageRating: number | null;
  totalReviews: number | null;
  totalProjects: number | null;
  isAvailable: boolean | null;
  hourlyRate: number | null;
  avatarImage: string | null;
  coverImage: string | null;
  user: { name: string | null; email?: string; image: string | null } | null;
  portfolioProjects: Array<{ id: string; title: string; coverImage: string | null }>;
  verificationBadges: Array<{ badge: string; isActive: boolean }>;
}

export function ProfessionalsGrid({
  professionals,
}: {
  professionals: ProfessionalWithRelations[];
}) {
  const viewMode = useViewMode();

  if (professionals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-lg font-semibold mb-2">
          Professional tapılmadı
        </h3>
        <p className="text-muted-foreground text-sm">
          Filterleri dəyişdirərək axtarın
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === "list" ? (
        <div className="flex flex-col gap-4">
          {professionals.map((pro) => (
            <ProfessionalListCard
              key={pro.id}
              professional={pro}
            />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {professionals.map((pro) => (
            <ProfessionalCard
              key={pro.id}
              professional={pro}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ProfessionalCard({
  professional: pro,
}: {
  professional: ProfessionalWithRelations;
}) {
  const coverImg =
    pro.coverImage ??
    pro.portfolioProjects[0]?.coverImage;

  const avatarImg = pro.avatarImage ?? pro.user?.image;
  const name = pro.user?.name ?? "İsimsiz";
  const isVerified = pro.verificationBadges.some(
    (b) => b.badge === "verified_architect" || b.badge === "verified_studio"
  );
  const isFeatured = pro.verificationBadges.length > 0;

  return (
    <div className="group bg-white rounded-2xl border border-border shadow-card hover:shadow-premium hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Cover */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        <Link href={`/memarlar/${pro.username}`} className="absolute inset-0">
          {coverImg ? (
            <Image
              src={coverImg}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Building2 className="w-16 h-16 text-primary" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </Link>

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center border border-amber-100" title="Seçilmiş">
            <svg className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </div>
        )}

        {/* Availability indicator */}
        {pro.isAvailable && (
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm ring-2 ring-white" title="Müsaiddir" />
        )}

        {/* Mini portfolio thumbnails */}
        {pro.portfolioProjects.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {pro.portfolioProjects.slice(1, 3).map((p) => {
              const img = p.coverImage;
              return img ? (
                <div
                  key={p.id}
                  className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-sm"
                >
                  <Image
                    src={img}
                    alt={p.title}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <Link href={`/memarlar/${pro.username}`} className="relative">
            <div className="w-14 h-14 rounded-xl border-4 border-white shadow-card overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {avatarImg ? (
                <Image
                  src={avatarImg}
                  alt={name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary font-bold text-base">
                  {getInitials(name)}
                </span>
              )}
            </div>
            {isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <CheckCircle className="w-4.5 h-4.5 text-primary fill-white" />
              </div>
            )}
          </Link>

          {pro.averageRating && pro.averageRating > 0 ? (
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg mb-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-sm font-semibold">
                {pro.averageRating.toFixed(1)}
              </span>
              {pro.totalReviews ? (
                <span className="text-xs text-amber-600/70">
                  ({pro.totalReviews})
                </span>
              ) : null}
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs mb-1">
              Yeni
            </Badge>
          )}
        </div>

        {/* Name & title */}
        <Link href={`/memarlar/${pro.username}`}>
          <h3 className="font-heading font-semibold text-base mb-0.5 leading-tight hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        {pro.specialization && (
          <p className="text-sm text-muted-foreground mb-2">
            {SPECIALIZATION_LABELS[pro.specialization]}
            {pro.experienceYears
              ? ` · ${pro.experienceYears} il`
              : ""}
          </p>
        )}

        {/* Location & projects */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {pro.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {pro.city}
            </span>
          )}
          {pro.totalProjects ? (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {pro.totalProjects} layihə
            </span>
          ) : null}
        </div>

        {/* Badges */}
        {pro.verificationBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pro.verificationBadges.slice(0, 2).map((b) => (
              <Badge key={b.badge} variant="premium" className="text-xs">
                {BADGE_LABELS[b.badge] ?? b.badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Bottom row: availability */}
        <div className="flex items-center gap-1.5 mt-auto">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              pro.isAvailable ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {pro.isAvailable ? "Müsaiddir" : "Məşğul"}
          </span>
          {pro.hourlyRate ? (
            <span className="text-xs font-semibold text-foreground ml-2">
              {pro.hourlyRate} AZN/saat
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
