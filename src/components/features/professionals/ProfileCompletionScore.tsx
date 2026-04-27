"use client";

import Link from "next/link";
import {
  Camera,
  Image as ImageIcon,
  AlignLeft,
  Briefcase,
  MapPin,
  Clock,
  FolderOpen,
  Phone,
  DollarSign,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface ProfileData {
  avatarImage?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  tagline?: string | null;
  specialization?: string | null;
  city?: string | null;
  experienceYears?: number | null;
  hourlyRate?: number | null;
  website?: string | null;
  phone?: string | null;
  portfolioProjects?: any[] | null;
}

interface CompletionField {
  key: string;
  label: string;
  tip: string;
  icon: React.ElementType;
  weight: number;
  check: (p: ProfileData) => boolean;
  href: string;
}

const fields: CompletionField[] = [
  {
    key: "avatar",
    label: "Profil şəkli",
    tip: "Profil şəkli əlavə edin",
    icon: Camera,
    weight: 15,
    check: (p) => !!p.avatarImage,
    href: "/panel/profil",
  },
  {
    key: "cover",
    label: "Üz qabığı şəkli",
    tip: "Üz qabığı şəkli yükləyin",
    icon: ImageIcon,
    weight: 10,
    check: (p) => !!p.coverImage,
    href: "/panel/profil",
  },
  {
    key: "bio",
    label: "Haqqında / Təqdimat",
    tip: "Bio və ya təqdimat yazısı əlavə edin",
    icon: AlignLeft,
    weight: 10,
    check: (p) => !!(p.bio || p.tagline),
    href: "/panel/profil",
  },
  {
    key: "specialization",
    label: "İxtisas",
    tip: "İxtisasınızı seçin",
    icon: Briefcase,
    weight: 10,
    check: (p) => !!p.specialization,
    href: "/panel/profil",
  },
  {
    key: "city",
    label: "Şəhər",
    tip: "Şəhərinizi göstərin",
    icon: MapPin,
    weight: 10,
    check: (p) => !!p.city,
    href: "/panel/profil",
  },
  {
    key: "experience",
    label: "Təcrübə ili",
    tip: "Təcrübə ilinizi daxil edin",
    icon: Clock,
    weight: 10,
    check: (p) => p.experienceYears != null && p.experienceYears > 0,
    href: "/panel/profil",
  },
  {
    key: "portfolio",
    label: "Portfolio layihəsi",
    tip: "Ən azı 1 portfolio layihəsi əlavə edin",
    icon: FolderOpen,
    weight: 15,
    check: (p) => (p.portfolioProjects?.length ?? 0) > 0,
    href: "/panel/portfolio/yeni",
  },
  {
    key: "contact",
    label: "Əlaqə məlumatı",
    tip: "Telefon və ya vebsayt əlavə edin",
    icon: Phone,
    weight: 10,
    check: (p) => !!(p.phone || p.website),
    href: "/panel/profil",
  },
  {
    key: "rate",
    label: "Saatlıq qiymət",
    tip: "Saatlıq qiymətinizi təyin edin",
    icon: DollarSign,
    weight: 10,
    check: (p) => p.hourlyRate != null && p.hourlyRate > 0,
    href: "/panel/profil",
  },
];

export function ProfileCompletionScore({
  profile,
}: {
  profile: ProfileData;
}) {
  const completed = fields.filter((f) => f.check(profile));
  const missing = fields.filter((f) => !f.check(profile));
  const percentage = completed.reduce((sum, f) => sum + f.weight, 0);

  if (percentage === 100) return null;

  // Colour scheme based on completion
  const barColor =
    percentage >= 80
      ? "bg-emerald-500"
      : percentage >= 50
      ? "bg-amber-500"
      : "bg-rose-500";

  const barBg =
    percentage >= 80
      ? "bg-emerald-100"
      : percentage >= 50
      ? "bg-amber-100"
      : "bg-rose-100";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-slate-900 text-sm">
            Profilinizi 100% tamamlayın
          </h2>
          <span className="text-sm font-bold text-slate-700">{percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className={`w-full h-2 rounded-full ${barBg}`}>
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Missing field suggestions */}
      <div className="divide-y divide-slate-50">
        {missing.slice(0, 4).map((field) => (
          <Link key={field.key} href={field.href}>
            <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <field.icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">
                  {field.tip}
                </p>
                <p className="text-[11px] text-slate-400">+{field.weight}%</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Completed count */}
      {completed.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-50 flex items-center gap-1.5 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          {completed.length}/{fields.length} tamamlandı
        </div>
      )}
    </div>
  );
}
