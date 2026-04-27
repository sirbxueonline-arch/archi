"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getDashboardData } from "@/server/actions/dashboard";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MessageSquare,
  Eye,
  Star,
  FileText,
  Plus,
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  Heart,
  Search,
  BriefcaseBusiness,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, CATEGORY_LABELS } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { ProfileCompletionScore } from "@/components/features/professionals/ProfileCompletionScore";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const { t } = useI18n();

  const setAvailability = async (next: boolean) => {
    if (!user?.id || togglingAvail) return;
    setAvailOpen(false);
    setTogglingAvail(true);
    setIsAvailable(next);
    const supabase = createClient();
    await supabase.from("profiles").update({ isAvailable: next }).eq("userId", user.id);
    // Notify the sidebar to update its availability indicator
    window.dispatchEvent(new CustomEvent("archilink:availability-updated", { detail: next }));
    setTogglingAvail(false);
  };

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Read role from users table (source of truth), fall back to metadata
      const { data: userRow } = await supabase
        .from("users")
        .select("role, name")
        .eq("id", session.user.id)
        .single();

      const u = {
        id: session.user.id,
        name: userRow?.name || session.user.user_metadata?.name || session.user.email,
        role: userRow?.role || session.user.user_metadata?.role || "client",
      };
      setUser(u);

      const dashData = await getDashboardData(session.user.id);
      setData(dashData);
      setIsAvailable(dashData?.profile?.isAvailable ?? true);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 sm:h-36 bg-white rounded-2xl border border-slate-100" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 sm:h-28 bg-white rounded-2xl border border-slate-100" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          <div className="h-56 sm:h-64 bg-white rounded-2xl border border-slate-100" />
          <div className="h-56 sm:h-64 bg-white rounded-2xl border border-slate-100" />
        </div>
      </div>
    );
  }

  const { profile, messageConvos, pendingProposals, recentProjects } = data ?? {};
  const firstName = (user?.name?.split(" ")[0] ?? t("dash.user"))?.trim() ?? t("dash.user");
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("dash.greeting.morning") : hour < 18 ? t("dash.greeting.afternoon") : t("dash.greeting.evening");

  const isPro = user?.role === "professional";

  const profileComplete = Boolean(
    profile?.specialization && profile?.bio && profile?.city
  );

  // Messages panel shared between both roles
  const MessagesPanel = () => (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-50">
        <h2 className="font-heading font-semibold text-slate-900 text-sm">{t("dash.messages.title")}</h2>
        <Link href="/panel/mesajlar">
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-400 hover:text-primary h-7 px-2">
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {messageConvos?.length > 0 ? (
          /* Show only 2 conversations on mobile, 3 on desktop */
          messageConvos.slice(0, 3).map((convo: any, idx: number) => {
            const other =
              convo.participantOne?.id === user?.id
                ? convo.participantTwo
                : convo.participantOne;
            return (
              <Link
                key={convo.id}
                href={`/panel/mesajlar/${convo.id}`}
                className={idx >= 2 ? "hidden sm:block" : ""}
              >
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50/80 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {other?.name ?? t("dash.user")}
                    </p>
                    <p className="text-[11px] text-slate-400">{t("dash.messages.open")}</p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-7 px-5">
            <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">{t("dash.messages.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isPro) {
    // ---- PROFESSIONAL DASHBOARD ----
    const stats = [
      {
        label: t("dash.pro.stat.views"),
        value: profile?.profileViews ?? 0,
        icon: Eye,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
      },
      {
        label: t("dash.pro.stat.portfolio"),
        value: profile?.portfolioProjects?.length ?? 0,
        icon: Building2,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        href: "/panel/portfolio",
      },
      {
        label: t("dash.pro.stat.messages"),
        value: messageConvos?.length ?? 0,
        icon: MessageSquare,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        href: "/panel/mesajlar",
      },
      {
        label: t("dash.pro.stat.rating"),
        value: profile?.averageRating
          ? `${profile.averageRating.toFixed(1)} ★`
          : "—",
        icon: Star,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
      },
    ];

    const quickActions = [
      { href: "/panel/portfolio/yeni", label: t("dash.pro.action.addProject"), icon: Plus, color: "bg-primary text-white" },
      { href: "/panel/mesajlar", label: t("dash.pro.action.messages"), icon: MessageSquare, color: "bg-white text-slate-700 border border-slate-200" },
      { href: "/bazar", label: t("dash.pro.action.marketplace"), icon: FileText, color: "bg-white text-slate-700 border border-slate-200" },
      { href: "/panel/profil", label: t("dash.pro.action.editProfile"), icon: Sparkles, color: "bg-white text-slate-700 border border-slate-200" },
    ];

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-primary/90 to-accent/80 p-5 sm:p-6 text-white">
          {/* Decorative circles clipped within their own layer so the dropdown can overflow */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 right-16 w-56 h-56 rounded-full bg-white/5" />
            <div className="absolute top-4 right-32 w-16 h-16 rounded-full bg-white/5" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-white/60 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {greeting}
              </p>
              <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                {firstName}! 👋
              </h1>
              {profileComplete ? (
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs sm:text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{t("dash.profileComplete")}</span>
                </div>
              ) : (
                <p className="text-white/70 text-xs sm:text-sm">{t("dash.profileIncomplete")}</p>
              )}
            </div>

            {!profileComplete && (
              <Link href="/panel/profil" className="shrink-0">
                <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg shadow-black/10 text-xs sm:text-sm h-8 sm:h-9">
                  {t("dash.completeProfile")}
                </Button>
              </Link>
            )}
          </div>

          {/* Availability toggle */}
          <div className="relative z-50 mt-3 sm:mt-4">
            <button
              onClick={() => setAvailOpen((o) => !o)}
              disabled={togglingAvail}
              className={`group inline-flex items-center rounded-full text-xs font-semibold transition-all border overflow-hidden ${
                isAvailable
                  ? "border-emerald-400/40 text-emerald-300"
                  : "border-white/20 text-white/60"
              }`}
            >
              {/* Status side */}
              <span className={`flex items-center gap-2 px-3 py-1.5 ${
                isAvailable ? "bg-emerald-500/20" : "bg-white/10"
              }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-white/40"}`} />
                {isAvailable ? "Onlayn" : "Oflayn"}
              </span>
              {/* Divider */}
              <span className={`w-px self-stretch ${isAvailable ? "bg-emerald-400/30" : "bg-white/20"}`} />
              {/* Action side */}
              <span className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                isAvailable
                  ? "bg-emerald-500/10 group-hover:bg-emerald-500/30"
                  : "bg-white/5 group-hover:bg-white/20"
              }`}>
                <Pencil className="w-3 h-3 opacity-70" />
              </span>
            </button>

            {/* Dropdown */}
            {availOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50 min-w-[120px]">
                <button
                  onClick={() => setAvailability(true)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors ${isAvailable ? "text-emerald-600 bg-emerald-50" : "text-foreground"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  Onlayn
                </button>
                <button
                  onClick={() => setAvailability(false)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors ${!isAvailable ? "text-gray-700 bg-gray-100" : "text-foreground"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                  Oflayn
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions: 2 per row on mobile, wrap naturally on larger screens */}
          <div className="relative z-10 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-4 sm:mt-5">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <button
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${action.color} ${action.color.includes("bg-primary") ? "shadow-md shadow-primary/30" : "shadow-sm"}`}
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href ?? "#"} className={stat.href ? "group" : "cursor-default"}>
              <div className={`bg-white rounded-2xl border ${stat.border} p-3 sm:p-4 transition-all duration-200 ${stat.href ? "group-hover:shadow-md group-hover:-translate-y-0.5" : ""}`}>
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  {stat.href && (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  )}
                </div>
                <p className={`text-xl sm:text-2xl font-heading font-bold ${stat.color} mb-0.5 leading-none`}>
                  {stat.value}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-4 sm:gap-5">
          {/* Portfolio Projects */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-50">
              <div>
                <h2 className="font-heading font-semibold text-slate-900 text-sm sm:text-base">{t("dash.pro.portfolio.title")}</h2>
                <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{t("dash.pro.portfolio.subtitle")}</p>
              </div>
              <Link href="/panel/portfolio">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-500 hover:text-primary">
                  {t("dash.pro.portfolio.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {profile?.portfolioProjects?.length > 0 ? (
                profile.portfolioProjects.map((proj: any) => (
                  <div
                    key={proj.id}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      {proj.coverImage ? (
                        <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{proj.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {proj.category && (
                          <span className="text-[10px] sm:text-[11px] text-slate-400">
                            {CATEGORY_LABELS[proj.category] ?? proj.category}
                          </span>
                        )}
                        {proj.year && (
                          <>
                            <span className="text-slate-200">·</span>
                            <span className="text-[10px] sm:text-[11px] text-slate-400">{proj.year}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 shrink-0">
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="text-xs font-medium">{proj.viewCount ?? 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-10 px-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{t("dash.pro.portfolio.empty")}</p>
                  <p className="text-xs text-slate-400 mb-4">{t("dash.pro.portfolio.emptyDesc")}</p>
                  <Link href="/panel/portfolio/yeni">
                    <Button size="sm" className="gap-1.5 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      {t("dash.pro.portfolio.add")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Profile Completion Score */}
            {profile && <ProfileCompletionScore profile={profile} />}

            {/* Pending Proposals */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-50">
                <h2 className="font-heading font-semibold text-slate-900 text-sm">{t("dash.pro.proposals.title")}</h2>
                <Link href="/panel/teklifler">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-400 hover:text-primary h-7 px-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {pendingProposals?.length > 0 ? (
                  pendingProposals.slice(0, 3).map((proposal: any) => (
                    <div key={proposal.id} className="px-4 sm:px-5 py-3 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-slate-800 truncate leading-snug">
                          {proposal.clientProject?.title}
                        </p>
                        <Badge variant="warning" className="text-[10px] shrink-0 py-0">
                          {t("dash.pro.proposals.waiting")}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{formatRelativeTime(proposal.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-7 px-5">
                    <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">{t("dash.pro.proposals.empty")}</p>
                  </div>
                )}
              </div>
            </div>

            <MessagesPanel />
          </div>
        </div>
      </div>
    );
  }

  // ---- CLIENT DASHBOARD ----
  const totalProposals = recentProjects?.reduce((sum: number, p: any) => sum + (p.proposalCount ?? 0), 0) ?? 0;

  const clientStats = [
    {
      label: t("dash.client.stat.projects"),
      value: recentProjects?.filter((p: any) => p.status === "open").length ?? 0,
      icon: BriefcaseBusiness,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      href: "/panel/layihelerim",
    },
    {
      label: t("dash.client.stat.proposals"),
      value: totalProposals,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: t("dash.client.stat.favorites"),
      value: profile?.savedProfiles?.length ?? 0,
      icon: Heart,
      color: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-100",
      href: "/panel/favoriler",
    },
    {
      label: t("dash.client.stat.messages"),
      value: messageConvos?.length ?? 0,
      icon: MessageSquare,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      href: "/panel/mesajlar",
    },
  ];

  const clientQuickActions = [
    { href: "/bazar/yeni", label: t("dash.client.action.postProject"), icon: Plus, color: "bg-primary text-white" },
    { href: "/memarlar", label: t("dash.client.action.findArchitect"), icon: Search, color: "bg-white text-slate-700 border border-slate-200" },
    { href: "/panel/mesajlar", label: t("dash.client.action.messages"), icon: MessageSquare, color: "bg-white text-slate-700 border border-slate-200" },
    { href: "/panel/favoriler", label: t("dash.client.action.favorites"), icon: Heart, color: "bg-white text-slate-700 border border-slate-200" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-900/80 to-teal-800/80 p-5 sm:p-6 text-white">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 right-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-4 right-32 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-white/60 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {greeting}
            </p>
            <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              {firstName}! 👋
            </h1>
            <p className="text-white/70 text-xs sm:text-sm">
              {t("dash.role.client")}
            </p>
          </div>

          <Link href="/bazar/yeni" className="shrink-0">
            <Button size="sm" className="bg-white text-emerald-800 hover:bg-white/90 font-semibold shadow-lg shadow-black/10 text-xs sm:text-sm h-8 sm:h-9">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span className="hidden xs:inline">{t("dash.client.action.postProject")}</span>
              <span className="xs:hidden">Yeni</span>
            </Button>
          </Link>
        </div>

        {/* Quick Actions: 2 per row on mobile */}
        <div className="relative z-10 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-4 sm:mt-5">
          {clientQuickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <button
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${action.color} ${action.color.includes("bg-primary") ? "shadow-md shadow-primary/30" : "shadow-sm"}`}
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid: 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {clientStats.map((stat) => (
          <Link key={stat.label} href={stat.href ?? "#"} className={stat.href ? "group" : "cursor-default"}>
            <div className={`bg-white rounded-2xl border ${stat.border} p-3 sm:p-4 transition-all duration-200 ${stat.href ? "group-hover:shadow-md group-hover:-translate-y-0.5" : ""}`}>
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                {stat.href && (
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                )}
              </div>
              <p className={`text-xl sm:text-2xl font-heading font-bold ${stat.color} mb-0.5 leading-none`}>
                {stat.value}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-5">
        {/* My Projects */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-50">
            <div>
              <h2 className="font-heading font-semibold text-slate-900 text-sm sm:text-base">{t("dash.client.projects.title")}</h2>
            </div>
            <Link href="/panel/layihelerim">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-500 hover:text-primary">
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {recentProjects?.length > 0 ? (
              recentProjects.slice(0, 5).map((proj: any) => (
                <div key={proj.id} className="px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate leading-snug">{proj.title}</p>
                    <Badge
                      variant={proj.status === "open" ? "success" : "secondary"}
                      className="text-[10px] shrink-0 py-0"
                    >
                      {proj.status === "open"
                        ? t("dash.client.projects.status.open")
                        : t("dash.client.projects.status.closed")}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    {proj.proposalCount} {t("dash.client.proposals.count")} · {formatRelativeTime(proj.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-10 px-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-3">
                  <BriefcaseBusiness className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">{t("dash.client.projects.empty")}</p>
                <p className="text-xs text-slate-400 mb-4">{t("dash.client.projects.emptyDesc")}</p>
                <Link href="/bazar/yeni">
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    {t("dash.client.projects.post")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Find Architect CTA */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:block">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 sm:mb-3">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 sm:block">
                <h3 className="font-heading font-semibold text-slate-900 text-sm mb-0.5 sm:mb-1">
                  {t("dash.client.action.findArchitect")}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed hidden sm:block sm:mb-4">
                  {t("dash.client.projects.emptyDesc")}
                </p>
              </div>
              <Link href="/memarlar" className="shrink-0 sm:hidden">
                <Button size="sm" className="gap-1.5 text-xs h-8">
                  <Search className="w-3.5 h-3.5" />
                  Axtar
                </Button>
              </Link>
            </div>
            <Link href="/memarlar" className="hidden sm:block">
              <Button size="sm" className="w-full gap-1.5 text-xs">
                <Search className="w-3.5 h-3.5" />
                {t("dash.client.action.findArchitect")}
              </Button>
            </Link>
          </div>

          <MessagesPanel />
        </div>
      </div>
    </div>
  );
}
