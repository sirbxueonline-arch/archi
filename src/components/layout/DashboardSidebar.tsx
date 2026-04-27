"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Images,
  MessageSquare,
  FileText,
  Settings,
  Building2,
  BriefcaseBusiness,
  Star,
  Bell,
  Heart,
  ChevronRight,
  LogOut,
  ExternalLink,
  BarChart3,
  Plus,
  Search,
  FileSignature,
  Gift,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

function NavItem({
  href,
  icon: Icon,
  label,
  exact,
  active,
  dot,
  count,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  active: boolean;
  dot?: boolean;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative",
        active
          ? "bg-primary text-white shadow-sm shadow-primary/30"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      <span className="relative shrink-0">
        <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", active && "text-white")} />
        {dot && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count && count > 0 ? (
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center", active ? "bg-white/20 text-white" : "bg-primary text-white")}>
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
      {active && !count && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
    </Link>
  );
}

function NavSection({ title, items, pathname, messageDot, notifCount }: { title: string; items: { href: string; icon: React.ElementType; label: string; exact?: boolean }[]; pathname: string; messageDot?: boolean; notifCount?: number }) {
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };
  return (
    <div className="mb-2">
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <NavItem
              {...item}
              active={isActive(item.href, item.exact)}
              dot={messageDot && item.href === "/panel/mesajlar"}
              count={item.href === "/panel/bildirisler" ? notifCount : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardSidebar({ user, isAvailable = true }: { user: User; isAvailable?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      // Try lastSenderId first; fall back to any conversation existing
      const { data, error } = await supabase
        .from("conversations")
        .select("lastSenderId")
        .or(`participantOneId.eq.${session.user.id},participantTwoId.eq.${session.user.id}`)
        .not("lastSenderId", "is", null)
        .neq("lastSenderId", session.user.id)
        .limit(1);
      if (!error) {
        setHasUnread(!!(data && data.length > 0));
      } else {
        // Column doesn't exist yet — show dot if any conversations exist
        const { data: any } = await supabase
          .from("conversations")
          .select("id")
          .or(`participantOneId.eq.${session.user.id},participantTwoId.eq.${session.user.id}`)
          .limit(1);
        setHasUnread(!!(any && any.length > 0));
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkNotifs = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("userId", session.user.id)
        .eq("isRead", false);
      setUnreadNotifCount(count ?? 0);
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const isPro = user.role === "professional";
  const roleLabel = isPro ? t("dash.role.professional") : t("dash.role.client");
  const roleBg = isPro ? "bg-primary/10 text-primary" : "bg-emerald-100 text-emerald-700";

  const mainNav = [
    { href: "/panel", icon: LayoutDashboard, label: t("dash.nav.overview"), exact: true },
    { href: "/panel/profil", icon: User, label: t("dash.nav.profile") },
    ...(isPro ? [{ href: "/panel/portfolio", icon: Images, label: t("dash.nav.portfolio") }] : []),
  ];

  const workNav = isPro
    ? [
        { href: "/panel/mesajlar", icon: MessageSquare, label: t("dash.nav.messages") },
        { href: "/panel/teklifler", icon: FileText, label: t("dash.nav.proposals") },
        { href: "/panel/reyler", icon: Star, label: t("dash.nav.reviews") },
        { href: "/panel/analitika", icon: BarChart3, label: t("dash.nav.analytics") },
        { href: "/panel/muqavile", icon: FileSignature, label: t("dash.nav.contract") },
        { href: "/panel/referral", icon: Gift, label: t("dash.nav.referral") },
        { href: "/panel/bildirisler", icon: Bell, label: t("dash.nav.notifications") },
      ]
    : [
        { href: "/panel/mesajlar", icon: MessageSquare, label: t("dash.nav.messages") },
        { href: "/panel/tekliflerim", icon: FileText, label: "Təkliflərim" },
        { href: "/panel/layihelerim", icon: BriefcaseBusiness, label: t("dash.nav.myProjects") },
        { href: "/panel/favoriler", icon: Heart, label: t("dash.nav.favorites") },
        { href: "/panel/muqavile", icon: FileSignature, label: t("dash.nav.contract") },
        { href: "/panel/referral", icon: Gift, label: t("dash.nav.referral") },
        { href: "/panel/bildirisler", icon: Bell, label: t("dash.nav.notifications") },
      ];

  // Mobile bottom nav tabs (4 flanking tabs + 1 center CTA)
  const newHref = isPro ? "/panel/portfolio/yeni" : "/bazar/yeni";

  const leftTabs = [
    { href: "/panel", icon: LayoutDashboard, label: t("dash.nav.overview"), exact: true },
    { href: "/panel/mesajlar", icon: MessageSquare, label: t("dash.nav.messages"), badge: hasUnread },
  ];

  const rightTabs = [
    { href: "/panel/bildirisler", icon: Bell, label: t("dash.nav.notifications") },
    { href: "/panel/profil", icon: User, label: t("dash.nav.profile") },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
        {/* User Card */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="relative shrink-0">
              <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                  {getInitials(user.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white transition-colors ${isAvailable ? "bg-emerald-400" : "bg-gray-300"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-slate-900 truncate">{user.name}</p>
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold mt-0.5", roleBg)}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-3">
          <NavSection title={t("dash.nav.main")} items={mainNav} pathname={pathname} messageDot={hasUnread} notifCount={unreadNotifCount} />
          <NavSection title={t("dash.nav.work")} items={workNav} pathname={pathname} messageDot={hasUnread} notifCount={unreadNotifCount} />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <NavItem
            href="/panel/parametrler"
            icon={Settings}
            label={t("dash.nav.settings")}
            active={pathname === "/panel/parametrler"}
          />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>{t("dash.nav.backToSite")}</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t("dash.nav.signOut")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-end h-16">
          {/* Left tabs */}
          {leftTabs.map((tab) => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors min-h-[44px]",
                  active ? "text-primary" : "text-slate-400"
                )}
              >
                <span className="relative">
                  <tab.icon className={cn("w-5 h-5 transition-transform", active && "scale-110")} />
                  {"badge" in tab && tab.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </span>
                <span className={cn("leading-none", active && "font-semibold")}>{tab.label}</span>
              </Link>
            );
          })}

          {/* Center CTA button */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-3 pb-2 -mt-5">
            <Link
              href={newHref}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform border-4 border-white"
              aria-label="Yeni əlavə et"
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </Link>
            <span className="text-[9px] font-semibold text-primary mt-1 leading-none">Yeni</span>
          </div>

          {/* Right tabs */}
          {rightTabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors min-h-[44px]",
                  active ? "text-primary" : "text-slate-400"
                )}
              >
                <tab.icon className={cn("w-5 h-5 transition-transform", active && "scale-110")} />
                <span className={cn("leading-none", active && "font-semibold")}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
