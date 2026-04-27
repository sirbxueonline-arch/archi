"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getMyClientProjects } from "@/server/actions/projects";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, formatRelativeTime } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

type ClientProject = Awaited<ReturnType<typeof getMyClientProjects>>[number];

export default function MyProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const data = await getMyClientProjects(session.user.id);
        setProjects(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return t("layihelerim.status.open");
      case "in_progress": return t("layihelerim.status.in_progress");
      case "completed": return t("layihelerim.status.completed");
      default: return t("layihelerim.status.cancelled");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-9 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="space-y-4 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("layihelerim.title")}</h1>
          <p className="text-muted-foreground text-sm">{projects.length} {t("layihelerim.count")}</p>
        </div>
        <Link href="/bazar/yeni">
          <Button variant="gradient" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            {t("layihelerim.add")}
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">{t("layihelerim.empty.title")}</h3>
          <p className="text-muted-foreground text-sm mb-6">{t("layihelerim.empty.desc")}</p>
          <Link href="/bazar/yeni">
            <Button variant="gradient" className="gap-1.5">
              <Plus className="w-4 h-4" />
              {t("layihelerim.create")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold truncate">{proj.title}</h3>
                <Badge
                  variant={proj.status === "open" ? "success" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {getStatusLabel(proj.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{proj.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{CATEGORY_LABELS[proj.category] ?? proj.category}</span>
                <div className="flex items-center gap-3">
                  <span>{proj.proposalCount} {t("layihelerim.proposals")} · {formatRelativeTime(proj.createdAt.toISOString())}</span>
                  <Link href={`/panel/layihelerim/${proj.id}`} className="text-primary font-semibold hover:underline">
                    {t("layihelerim.view")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
