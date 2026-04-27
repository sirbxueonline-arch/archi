"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/lib/utils";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

interface FavoriteProject {
  id: string;
  title: string;
  coverImage: string | null;
  category: string | null;
  city: string | null;
  year: number | null;
  likeCount: number | null;
  profiles?: {
    username: string | null;
    users?: { name: string | null } | null;
  } | null;
}

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteProject[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      setUserId(session.user.id);

      const { data } = await supabase
        .from("favorites")
        .select(`
          portfolioProjectId,
          portfolioProjects (
            id, title, coverImage, category, city, year, likeCount,
            profiles (
              username,
              users (name)
            )
          )
        `)
        .eq("userId", session.user.id)
        .order("createdAt", { ascending: false });

      const projects = (data ?? [])
        .map((f: any) => f.portfolioProjects)
        .filter(Boolean) as FavoriteProject[];

      setFavorites(projects);
      setLoading(false);
    };
    load();
  }, []);

  const handleRemove = async (projectId: string) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("favorites")
      .delete()
      .eq("userId", userId)
      .eq("portfolioProjectId", projectId);
    setFavorites((prev) => prev.filter((p) => p.id !== projectId));
    toast.success(t("favoriler.removed"));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">{t("favoriler.title")}</h1>
        <p className="text-muted-foreground text-sm">{favorites.length} {t("favoriler.count")}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">{t("favoriler.empty.title")}</h3>
          <p className="text-muted-foreground text-sm mb-4">{t("favoriler.empty.desc")}</p>
          <Link href="/layiheler">
            <Badge className="text-sm px-4 py-2 cursor-pointer hover:opacity-80">{t("favoriler.browse")}</Badge>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((project) => (
            <div key={project.id} className="group relative bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/layiheler/${project.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{project.title}</h3>
                    {project.year && (
                      <span className="text-xs text-muted-foreground shrink-0">{project.year}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {project.category && (
                      <Badge variant="secondary" className="text-xs border-0">
                        {CATEGORY_LABELS[project.category] ?? project.category}
                      </Badge>
                    )}
                    {project.city && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {project.city}
                      </span>
                    )}
                  </div>
                  {project.profiles && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {project.profiles.users?.name ?? project.profiles.username ?? t("favoriler.architect")}
                    </p>
                  )}
                </div>
              </Link>
              <button
                onClick={() => handleRemove(project.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
