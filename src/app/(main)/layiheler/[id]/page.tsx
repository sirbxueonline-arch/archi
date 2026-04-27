import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  MapPin,
  Calendar,
  Ruler,
  User,
  ArrowLeft,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectActions } from "@/components/features/projects/ProjectActions";
import { VideoPlayer } from "@/components/features/projects/VideoPlayer";
import { LightboxGallery } from "@/components/features/projects/LightboxGallery";
import { BeforeAfterSlider } from "@/components/features/projects/BeforeAfterSlider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORY_LABELS, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  const { data: project } = await supabase
    .from("portfolioProjects")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();
  return {
    title: project?.title ?? "Layihə",
    description: project?.description ?? undefined,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient();

  const { data: project } = await supabase
    .from("portfolioProjects")
    .select(`
      *,
      profile:profiles!profileId(
        id, username, avatarImage, coverImage, city,
        user:users!userId(id, name, image)
      ),
      images:projectImages!portfolioProjectId(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!project || !project.isPublished) notFound();

  const images = ((project.images as any[]) ?? []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const profile = project.profile as any;
  const authorName = profile?.user?.name ?? profile?.username ?? "Memar";

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Image */}
      <div className="relative h-[60vh] bg-black overflow-hidden">
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover opacity-90"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-4 sm:left-8">
          <Link href="/layiheler">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
          </Link>
        </div>

        {/* Video play button */}
        {(project as any).videoUrl && (
          <VideoPlayer videoUrl={(project as any).videoUrl} />
        )}

        {/* Actions */}
        <div className="absolute top-6 right-4 sm:right-8">
          <ProjectActions projectId={project.id} likeCount={project.likeCount ?? 0} />
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-4xl">
            <Badge
              className="mb-3 text-xs border-0 text-white"
              style={{
                background:
                  project.category === "architecture"
                    ? "rgba(30,58,138,0.8)"
                    : project.category === "interior"
                    ? "rgba(124,58,237,0.8)"
                    : project.category === "landscape"
                    ? "rgba(5,150,105,0.8)"
                    : "rgba(217,119,6,0.8)",
              }}
            >
              {CATEGORY_LABELS[project.category] ?? project.category}
            </Badge>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {project.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {project.location ?? project.city}
                </span>
              )}
              {project.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {project.year}
                </span>
              )}
              {project.area && (
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4" />
                  {project.area} m²
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {project.description && (
              <div>
                <h2 className="font-heading font-semibold text-xl mb-4">
                  Layihə Haqqında
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {project.beforeImage && project.afterImage && (
              <div>
                <h2 className="font-heading font-semibold text-xl mb-4">
                  Əvvəl / Sonra
                </h2>
                <BeforeAfterSlider
                  beforeImage={project.beforeImage}
                  afterImage={project.afterImage}
                />
              </div>
            )}

            {images.length > 1 && (
              <div>
                <h2 className="font-heading font-semibold text-xl mb-4">
                  Foto Qalereyası
                </h2>
                <LightboxGallery
                  images={images.map((img: any) => ({
                    src: img.url,
                    alt: img.caption || img.altText || project.title,
                  }))}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {profile && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-4">
                  Memar
                </p>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={profile.avatarImage ?? profile.user?.image ?? undefined}
                    />
                    <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{authorName}</p>
                    <p className="text-xs text-muted-foreground">{profile.city}</p>
                  </div>
                </div>
                <Link href={`/memarlar/${profile.username}`}>
                  <Button className="w-full" variant="gradient" size="sm">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    Profili Gör
                  </Button>
                </Link>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-4">
                Layihə Detalları
              </p>
              <div className="space-y-3 text-sm">
                {[
                  {
                    label: "Kateqoriya",
                    value: CATEGORY_LABELS[project.category] ?? project.category,
                  },
                  { label: "Şəhər", value: project.city },
                  { label: "İl", value: project.year },
                  { label: "Sahə", value: project.area ? `${project.area} m²` : null },
                  { label: "Sifarişçi", value: project.client },
                ]
                  .filter((d) => d.value)
                  .map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{detail.label}</span>
                      <span className="font-medium text-right">{detail.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
