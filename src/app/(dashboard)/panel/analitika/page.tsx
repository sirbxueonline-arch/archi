"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getAnalyticsData } from "@/server/actions/analytics";
import {
  Eye, Star, Users, TrendingUp, Award, FileText,
  BarChart3, Heart, CheckCircle,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/utils";

type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;

function StatCard({
  label, value, icon: Icon, color, subtitle,
}: {
  label: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-border p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const result = await getAnalyticsData(session.user.id);
      setData(result);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="h-8 w-36 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse mb-3" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5">
            <div className="h-5 w-40 bg-muted animate-pulse rounded mb-5" />
            <div className="flex items-end gap-2 h-36">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-1 bg-muted animate-pulse rounded-t-md" style={{ height: `${40 + Math.random() * 60}%` }} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="h-5 w-32 bg-muted animate-pulse rounded mb-5" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                  <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Analitika məlumatı tapılmadı</p>
      </div>
    );
  }

  const { overview, topProjects, monthlyData, categoryBreakdown } = data;
  const maxViews = Math.max(...monthlyData.map((m) => m.views), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Analitika</h1>
        <p className="text-muted-foreground text-sm">Profilinizin performansını izləyin</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Profil Baxışı" value={overview.profileViews} icon={Eye} color="bg-primary" />
        <StatCard label="İzləyicilər" value={overview.followers} icon={Users} color="bg-primary" />
        <StatCard label="Orta Reytinq" value={overview.averageRating > 0 ? overview.averageRating.toFixed(1) : "—"} icon={Star} color="bg-amber-500" subtitle={`${overview.totalReviews} rəy`} />
        <StatCard label="Qəbul nisbəti" value={`${overview.conversionRate}%`} icon={CheckCircle} color="bg-emerald-500" subtitle={`${overview.acceptedProposals}/${overview.totalProposals} təklif`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold">Aylıq Baxışlar</h2>
          </div>
          <div className="flex items-end gap-2 h-36">
            {monthlyData.map((m) => {
              const pct = maxViews > 0 ? (m.views / maxViews) * 100 : 0;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">{m.views}</span>
                  <div className="w-full flex items-end" style={{ height: "80px" }}>
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all duration-500"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold">Kateqoriyalar</h2>
          </div>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Layihə yoxdur</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(({ category, count }) => {
                const maxCount = Math.max(...categoryBreakdown.map((c) => c.count));
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{CATEGORY_LABELS[category] ?? category}</span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                    <MiniBar value={count} max={maxCount} color="bg-primary" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Projects */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold">Ən Çox Görülən Layihələr</h2>
        </div>
        {topProjects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Layihə yoxdur</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {topProjects.map((proj, idx) => (
              <div key={proj.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{proj.title}</p>
                  <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[proj.category ?? ""] ?? proj.category}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {proj.viewCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {proj.likeCount ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
