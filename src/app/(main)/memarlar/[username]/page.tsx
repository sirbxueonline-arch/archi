import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  CheckCircle,
  Building2,
  Globe,
  Phone,
  Instagram,
  Linkedin,
  Clock,
  Briefcase,
  MessageSquare,
  Award,
  Calendar,
  Play,
  GraduationCap,
  Package,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getProfileByUsername } from "@/server/actions/profiles";
import { ProfileHeaderActions } from "@/components/features/professionals/ProfileHeaderActions";
import { ShareProfileButton } from "@/components/features/professionals/ShareProfileButton";
import { WhatsAppButton } from "@/components/features/professionals/WhatsAppButton";
import { QASection } from "@/components/features/professionals/QASection";
import { ReviewForm } from "@/components/features/professionals/ReviewForm";
import { ReviewReply } from "@/components/features/professionals/ReviewReply";
import { ProtectedContactInfo } from "@/components/features/professionals/ProtectedContactInfo";
import { TrackView } from "@/components/features/professionals/TrackView";
import { StickyContactButton } from "@/components/features/professionals/StickyContactButton";
import { BookingButton } from "@/components/features/professionals/BookingButton";
import { PortfolioLikeButton } from "@/components/features/professionals/PortfolioLikeButton";
import {
  SPECIALIZATION_LABELS,
  BADGE_LABELS,
  CATEGORY_LABELS,
  formatDate,
  getInitials,
} from "@/lib/utils";
import type { Metadata } from "next";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string }>;
}

interface EducationEntry {
  institution: string;
  degree: string;
  year?: number;
}

interface ServicePackage {
  name: string;
  price: number;
  deliverables: string[];
  duration: string;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Profil tapılmadı" };
  return {
    title: `${profile.user?.name ?? profile.username} – Memar`,
    description: profile.bio ?? undefined,
  };
}


function normalizeWebsiteUrl(website?: string | null) {
  if (!website) return null;
  const value = website.trim();
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function normalizeInstagramHandle(instagram?: string | null) {
  if (!instagram) return null;
  let value = instagram.trim();
  if (!value) return null;
  value = value.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  value = value.split(/[/?#]/)[0] ?? "";
  value = value.replace(/^@+/, "").trim();
  return value || null;
}

function normalizeLinkedinHandle(linkedin?: string | null) {
  if (!linkedin) return null;
  let value = linkedin.trim();
  if (!value) return null;
  value = value.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "");
  value = value.replace(/^https?:\/\/(www\.)?linkedin\.com\/company\//i, "");
  value = value.split(/[/?#]/)[0] ?? "";
  value = value.replace(/^@+/, "").trim();
  return value || null;
}

// ─── Availability helpers ────────────────────────────────────────────────────

const AVAILABILITY_CONFIG: Record<
  string,
  { label: string; dotColor: string; textColor: string }
> = {
  available: {
    label: "Müsaiddir",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-700",
  },
  busy: {
    label: "Məşğuldur",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
  },
  vacation: {
    label: "İstirahətdə",
    dotColor: "bg-red-500",
    textColor: "text-red-700",
  },
};

function getOnlineStatus(lastSeenAt: string | null | undefined): { label: string; isOnline: boolean } {
  if (!lastSeenAt) return { label: "Məlumat yoxdur", isOnline: false };
  const diff = Date.now() - new Date(lastSeenAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 5) return { label: "İndi onlayn", isOnline: true };
  if (minutes < 60) return { label: `${minutes} dəq. əvvəl`, isOnline: false };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { label: `${hours} saat əvvəl`, isOnline: false };
  const days = Math.floor(hours / 24);
  if (days < 7) return { label: `${days} gün əvvəl`, isOnline: false };
  return { label: "Həftədən artıqdır", isOnline: false };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfessionalProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) notFound();

  const name = profile.user?.name ?? profile.username;
  const portfolioProjects = profile.portfolioProjects ?? [];
  const skills = profile.profileSkills ?? [];
  const badges = profile.verificationBadges ?? [];
  const reviews = profile.reviews ?? [];
  const websiteHref = normalizeWebsiteUrl(profile.website);
  const instagramHandle = normalizeInstagramHandle(profile.instagram);
  const linkedinHandle = normalizeLinkedinHandle(profile.linkedin);

  // New data fields
  const education: EducationEntry[] = (profile as any).education ?? [];
  const servicePackages: ServicePackage[] = (profile as any).servicePackages ?? [];
  const availabilityStatus: string | null = (profile as any).availabilityStatus ?? null;
  const availabilityInfo = availabilityStatus
    ? AVAILABILITY_CONFIG[availabilityStatus] ?? null
    : null;

  // Determine which extra tabs to show
  const hasEducation = education.length > 0;
  const hasPackages = servicePackages.length > 0;

  return (
    <div className="min-h-screen bg-background pt-16">
      <TrackView
        profile={{
          username: profile.username,
          name,
          specialization: profile.specialization ?? null,
          avatarImage: profile.avatarImage ?? null,
          city: profile.city ?? null,
        }}
      />

      {/* ── Feature 5: Sticky Contact Button (desktop only) ── */}
      {profile.userId && (
        <StickyContactButton profileUserId={profile.userId} />
      )}

      {/* ── Cover Image ── */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-accent/10 to-background overflow-hidden">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* ── Profile Header ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-3xl border-4 border-background shadow-premium overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {profile.avatarImage ?? profile.user?.image ? (
                <Image
                  src={(profile.avatarImage ?? profile.user?.image)!}
                  alt={name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <span className="text-3xl font-heading font-bold text-primary">
                  {getInitials(name)}
                </span>
              )}
            </div>
            {badges.some(
              (b: any) =>
                b.badge === "verified_architect" || b.badge === "verified_studio"
            ) && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-sm">
                <CheckCircle className="w-5 h-5 fill-white" />
              </div>
            )}
          </div>

          {/* Name & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-heading text-3xl font-bold">{name}</h1>
                  {badges.map((b: any) => (
                    <Badge key={b.badge} variant="premium" className="text-xs">
                      {BADGE_LABELS[b.badge] ?? b.badge}
                    </Badge>
                  ))}
                </div>

                {/* ── Feature 1: Hourly Rate Display (prominent, near name) ── */}
                {profile.hourlyRate != null && profile.hourlyRate > 0 && (
                  <p className="text-lg mb-1">
                    <span className="font-heading font-bold text-primary">
                      {profile.hourlyRate} AZN
                    </span>
                    <span className="text-muted-foreground text-sm">/saat</span>
                  </p>
                )}
                {(profile as any).minProjectBudget != null && (profile as any).minProjectBudget > 0 && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Layihə minimum: <span className="font-semibold text-foreground">{(profile as any).minProjectBudget} AZN</span>
                  </p>
                )}

                {/* ── Feature 4: Availability Status Display ── */}
                {availabilityInfo && (
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${availabilityInfo.dotColor} animate-pulse`}
                    />
                    <span
                      className={`text-sm font-medium ${availabilityInfo.textColor}`}
                    >
                      {availabilityInfo.label}
                    </span>
                  </div>
                )}
                {(profile as any).lastSeenAt && (() => {
                  const status = getOnlineStatus((profile as any).lastSeenAt);
                  return (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${status.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                      {status.label}
                    </span>
                  );
                })()}

                {profile.tagline && (
                  <p className="text-muted-foreground mb-2">{profile.tagline}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.specialization && (
                    <span className="font-medium text-foreground">
                      {SPECIALIZATION_LABELS[profile.specialization]}
                    </span>
                  )}
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.city}
                    </span>
                  )}
                  {profile.experienceYears !== undefined &&
                    profile.experienceYears > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {profile.experienceYears} il təcrübə
                      </span>
                    )}
                  {profile.totalProjects && profile.totalProjects > 0 ? (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {profile.totalProjects} layihə
                    </span>
                  ) : null}
                </div>
                <ProtectedContactInfo
                  instagram={instagramHandle}
                  linkedin={linkedinHandle}
                  variant="inline"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0" data-contact-section>
                {profile.userId && (
                  <ProfileHeaderActions profileUserId={profile.userId} profileId={profile.id} />
                )}
                {profile.userId && (
                  <BookingButton profileUserId={profile.userId} professionalName={name} />
                )}
                {profile.phone && (
                  <WhatsAppButton phone={profile.phone} />
                )}
                <ShareProfileButton />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {(
            [
              {
                icon: Star,
                value:
                  profile.averageRating && profile.averageRating > 0
                    ? profile.averageRating.toFixed(1)
                    : "—",
                label: "Reytinq",
                color: "text-amber-500",
              },
              {
                icon: Award,
                value: profile.totalReviews ?? 0,
                label: "Rəy",
                color: "text-primary",
              },
              {
                icon: Building2,
                value: portfolioProjects.length,
                label: "Portfolio",
                color: "text-accent",
              },
              {
                icon: Calendar,
                value:
                  formatDate(profile.createdAt, "az-AZ").split(" ")[2] ?? "2024",
                label: "Qoşulma ili",
                color: "text-teal-500",
              },
            ] as const
          ).map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-border p-4 text-center"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1.5`} />
              <p className={`text-xl font-heading font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main layout: tabs + sidebar ── */}
        <div className="grid lg:grid-cols-3 gap-8 pb-16">

          {/* ── Left: Tabs ── */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio">
              <TabsList className="mb-8">
                <TabsTrigger value="portfolio">
                  Portfolio ({portfolioProjects.length})
                </TabsTrigger>
                {hasPackages && (
                  <TabsTrigger value="packages">Xidmət Paketləri</TabsTrigger>
                )}
                {hasEducation && (
                  <TabsTrigger value="education">Təhsil</TabsTrigger>
                )}
                <TabsTrigger value="reviews">
                  Rəylər ({reviews.length})
                </TabsTrigger>
              </TabsList>

              {/* ── Portfolio Tab ── */}
              <TabsContent value="portfolio">
                {portfolioProjects.length > 0 ? (
                  <div className="masonry-grid mb-10">
                    {portfolioProjects.map((project: any) => {
                      const coverImg = project.coverImage;
                      return (
                        <div key={project.id} className="masonry-item">
                          <Link href={`/layiheler/${project.id}`}>
                            <div className="group bg-white rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                              {coverImg && (
                                <div className="relative aspect-[4/3] overflow-hidden">
                                  <Image
                                    src={coverImg}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  />
                                  {project.videoUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                        <Play className="w-4 h-4 fill-white ml-0.5" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="font-semibold text-sm leading-tight">
                                    {project.title}
                                  </h3>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {project.year}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs border-0">
                                      {CATEGORY_LABELS[project.category] ?? project.category}
                                    </Badge>
                                    {project.city && (
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        {project.city}
                                      </span>
                                    )}
                                  </div>
                                  <PortfolioLikeButton projectId={project.id} initialLikeCount={project.likeCount ?? 0} />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground mb-8">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Hələ portfolio layihəsi yoxdur</p>
                  </div>
                )}
                <QASection profileId={profile.id} ownerUserId={profile.userId ?? null} architectName={name} />
              </TabsContent>

              {/* ── Service Packages Tab ── */}
              {hasPackages && (
                <TabsContent value="packages">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                {servicePackages.map((pkg, idx) => {
                  const tierStyles = [
                    {
                      tierLabel: "Əsas",
                      border: "border-border",
                      headerBg: "bg-gray-50",
                      accent: "text-foreground",
                    },
                    {
                      tierLabel: "Standart",
                      border: "border-primary/30",
                      headerBg: "bg-primary/5",
                      accent: "text-primary",
                    },
                    {
                      tierLabel: "Premium",
                      border: "border-amber-300",
                      headerBg: "bg-amber-50",
                      accent: "text-amber-700",
                    },
                  ];
                  const style = tierStyles[idx] ?? tierStyles[0];

                  return (
                    <div
                      key={pkg.name}
                      className={`bg-white rounded-2xl border-2 ${style.border} overflow-hidden flex flex-col`}
                    >
                      <div className={`${style.headerBg} p-5`}>
                        <p className={`text-xs font-medium uppercase tracking-wide ${style.accent} mb-1`}>
                          {style.tierLabel}
                        </p>
                        <h3 className="font-heading font-bold text-lg mb-2">
                          {pkg.name}
                        </h3>
                        <p className={`text-2xl font-heading font-bold ${style.accent}`}>
                          {pkg.price} AZN
                        </p>
                        {pkg.duration && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {pkg.duration}
                          </p>
                        )}
                      </div>
                      <div className="p-5 flex-1">
                        <ul className="space-y-2.5">
                          {pkg.deliverables.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
                </TabsContent>
              )}

              {/* ── Education & Certifications Tab ── */}
              {hasEducation && (
                <TabsContent value="education">
              <div className="max-w-2xl">
                <h3 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Təhsil və Sertifikatlar
                </h3>
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                  {education.map((entry, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[calc(1.5rem+5px)] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
                      <div className="bg-white rounded-xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-sm">
                              {entry.degree}
                            </h4>
                            <p className="text-muted-foreground text-sm mt-0.5">
                              {entry.institution}
                            </p>
                          </div>
                          {entry.year && (
                            <span className="text-xs text-muted-foreground bg-gray-100 rounded-full px-2.5 py-1 shrink-0">
                              {entry.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                </TabsContent>
              )}

              {/* ── Reviews Tab ── */}
              <TabsContent value="reviews">
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div
                          key={review.id}
                          className="bg-white rounded-2xl border border-border p-5"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-semibold text-primary">
                                {getInitials(review.reviewer?.name ?? "R")}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {review.reviewer?.name ?? "Anonim"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <p className="font-semibold text-sm mb-1">{review.title}</p>
                          )}
                          {review.content && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {review.content}
                            </p>
                          )}
                          {review.ownerReply && (
                            <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/20 bg-primary/5 rounded-r-xl p-3">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                                  {(profile.avatarImage ?? profile.user?.image) ? (
                                    <Image
                                      src={(profile.avatarImage ?? profile.user?.image)!}
                                      alt={name}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold text-primary">
                                      {getInitials(name)}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium text-xs text-primary">{name}</p>
                                {review.ownerReplyAt && (
                                  <p className="text-[10px] text-muted-foreground">
                                    {formatDate(review.ownerReplyAt)}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {review.ownerReply}
                              </p>
                            </div>
                          )}
                          {!review.ownerReply && (
                            <ReviewReply
                              reviewId={review.id}
                              profileUserId={profile.userId ?? ""}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Hələ rəy yoxdur</p>
                    </div>
                  )}
                  <ReviewForm profileId={profile.id} architectName={name} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-heading font-semibold mb-3">Haqqında</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-heading font-semibold mb-3">Bacarıqlar</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((ps: any) => (
                    <span
                      key={ps.skillId}
                      className="px-3 py-1.5 bg-primary/8 text-primary rounded-full text-sm font-medium"
                    >
                      {ps.skill?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-heading font-semibold mb-4">Əlaqə</h3>
              <ProtectedContactInfo
                phone={profile.phone}
                website={websiteHref}
                instagram={instagramHandle}
                linkedin={linkedinHandle}
                variant="list"
              />
              {profile.isAvailable && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-emerald-700 font-medium">
                      Yeni layihələr üçün müsaitdir
                    </span>
                  </div>
                </>
              )}
              {profile.hourlyRate && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Saatlıq tarif</p>
                    <p className="font-heading font-bold text-lg">{profile.hourlyRate} AZN</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
