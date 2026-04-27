import Link from "next/link";
import { ArrowRight, MapPin, DollarSign, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase";
import { CATEGORY_LABELS, BUDGET_RANGE_LABELS, formatRelativeTime } from "@/lib/utils";

export async function FeaturedMarketplace() {
  const admin = createAdminClient();

  const { data: projects } = await admin
    .from("clientProjects")
    .select("id, title, description, category, city, budgetRange, isUrgent, createdAt, proposalCount, client:users!clientId(name)")
    .eq("status", "open")
    .order("createdAt", { ascending: false })
    .limit(6);

  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold text-[#0D9488] uppercase tracking-widest mb-3">
              Açıq Layihələr
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 leading-[1.1] mb-3">
              Layihə Bazarı
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Real müştərilər tərəfindən elan edilmiş açıq layihələr — peşəkar kimi təklif verin, müştəri kimi öz layihənizi paylaşın.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/bazar/yeni"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#0D9488] hover:bg-[#0F766E] px-5 py-2.5 rounded-full transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Elan ver
            </Link>
            <Link
              href="/bazar"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors"
            >
              Hamısına bax
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const client = project.client as { name?: string } | null;
            return (
              <Link key={project.id} href={`/bazar/${project.id}`}>
                <div className="group bg-white rounded-sm border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[project.category] ?? project.category}
                      </Badge>
                      {project.isUrgent && (
                        <Badge className="text-xs bg-red-100 text-red-700 border-0">
                          🔥 Təcili
                        </Badge>
                      )}
                    </div>
                    <Badge variant="success" className="shrink-0 text-xs">Açıq</Badge>
                  </div>

                  <h3 className="font-heading font-semibold text-sm leading-tight mb-1.5 line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                    {project.description}
                  </p>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    {project.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {project.city}
                      </span>
                    )}
                    {project.budgetRange && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        {BUDGET_RANGE_LABELS[project.budgetRange as string] ?? project.budgetRange}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px]">
                        {(client?.name?.[0] ?? "M").toUpperCase()}
                      </div>
                      <span>{client?.name ?? "Anonim"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{project.proposalCount ?? 0} təklif</span>
                      <span>{formatRelativeTime(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 sm:hidden">
          <Link
            href="/bazar/yeni"
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] px-4 py-2 rounded-full transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Elan ver
          </Link>
          <Link
            href="/bazar"
            className="flex items-center gap-1.5 text-sm font-medium text-[#0D9488]"
          >
            Hamısına bax <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
