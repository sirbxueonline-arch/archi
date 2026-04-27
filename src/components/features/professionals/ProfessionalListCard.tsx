"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, CheckCircle, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  SPECIALIZATION_LABELS,
  BADGE_LABELS,
  getInitials,
} from "@/lib/utils";

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

interface ProfessionalListCardProps {
  professional: ProfessionalWithRelations;
}

export function ProfessionalListCard({
  professional: pro,
}: ProfessionalListCardProps) {
  const avatarImg = pro.avatarImage ?? pro.user?.image;
  const name = pro.user?.name ?? "İsimsiz";
  const isVerified = pro.verificationBadges.some(
    (b) => b.badge === "verified_architect" || b.badge === "verified_studio"
  );

  return (
    <div className="group bg-white rounded-2xl border border-border shadow-card hover:shadow-premium transition-all duration-300 overflow-hidden">
      <div className="flex items-start gap-4 p-4 sm:p-5">
        {/* Avatar */}
        <Link href={`/memarlar/${pro.username}`} className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {avatarImg ? (
              <Image
                src={avatarImg}
                alt={name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-lg">
                {getInitials(name)}
              </span>
            )}
          </div>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1">
              <CheckCircle className="w-5 h-5 text-primary fill-white" />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/memarlar/${pro.username}`}>
                <h3 className="font-heading font-semibold text-base mb-0.5 leading-tight hover:text-primary transition-colors truncate">
                  {name}
                </h3>
              </Link>
              {pro.specialization && (
                <p className="text-sm text-muted-foreground mb-1">
                  {SPECIALIZATION_LABELS[pro.specialization]}
                  {pro.experienceYears ? ` · ${pro.experienceYears} il təcrübə` : ""}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="shrink-0">
              {pro.averageRating && pro.averageRating > 0 ? (
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
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
                <Badge variant="secondary" className="text-xs">
                  Yeni
                </Badge>
              )}
            </div>
          </div>

          {/* Tagline */}
          {pro.tagline && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {pro.tagline}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
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
            {pro.hourlyRate ? (
              <span className="font-semibold text-foreground">
                {pro.hourlyRate} AZN/saat
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  pro.isAvailable ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              {pro.isAvailable ? "Müsaiddir" : "Məşğul"}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {pro.verificationBadges.slice(0, 3).map((b) => (
              <Badge key={b.badge} variant="premium" className="text-xs">
                {BADGE_LABELS[b.badge] ?? b.badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
