"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  User,
  Search,
  Plus,
  Home,
  MessageSquare,
  Building2,
  BriefcaseBusiness,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NavBadges } from "@/components/layout/NavBadges";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

const navLinkDefs = [
  { href: "/memarlar", key: "nav.architects", icon: User },
  { href: "/layiheler", key: "nav.projects", icon: Building2 },
  { href: "/bazar", key: "nav.bazar", icon: BriefcaseBusiness },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = React.useState<any>(null);
  const [status, setStatus] = React.useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      if (supabaseSession) {
        setSession({
          user: {
            id: supabaseSession.user.id,
            name: supabaseSession.user.user_metadata?.name || supabaseSession.user.email,
            email: supabaseSession.user.email,
            image: supabaseSession.user.user_metadata?.avatar_url,
            role: supabaseSession.user.user_metadata?.role || "client",
          }
        });
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (supabaseSession) {
        setSession({
          user: {
            id: supabaseSession.user.id,
            name: supabaseSession.user.user_metadata?.name || supabaseSession.user.email,
            email: supabaseSession.user.email,
            image: supabaseSession.user.user_metadata?.avatar_url,
            role: supabaseSession.user.user_metadata?.role || "client",
          }
        });
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const { t } = useI18n();
  const navLinks = navLinkDefs.map((l) => ({ ...l, label: t(l.key) }));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/ArchiLink.png"
                alt="ArchiLink"
                width={480}
                height={144}
                className="h-20 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Center Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                    isActive(link.href)
                      ? "text-[#0D9488] bg-[#0D9488]/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
              ) : session ? (
                <>
                  {searchOpen ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchQuery.trim()) {
                          router.push(`/memarlar?axtaris=${encodeURIComponent(searchQuery.trim())}`);
                        }
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-1"
                    >
                      <input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                        placeholder="Memar axtar..."
                        className="h-8 w-44 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]/40"
                      />
                      <button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                  <NavBadges userId={session.user.id} />
                  <LanguageSwitcher />

                  {session.user.role === "client" ? (
                    <Link href="/bazar/yeni">
                      <Button size="sm" className="gap-1.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white px-4">
                        <Plus className="w-3.5 h-3.5" />
                        {t("nav.postProject")}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/panel/portfolio/yeni">
                      <Button size="sm" className="gap-1.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white px-4">
                        <Plus className="w-3.5 h-3.5" />
                        {t("nav.addProject")}
                      </Button>
                    </Link>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-[#0D9488]/20 transition-all p-0.5 ml-1">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={session.user.image ?? undefined} />
                          <AvatarFallback className="bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold">
                            {getInitials(session.user.name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-lg border border-gray-100">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-semibold text-sm truncate">{session.user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/panel" className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" /> Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/panel/profil" className="flex items-center gap-2">
                          <User className="w-4 h-4" /> Profilim
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/panel/mesajlar" className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Mesajlar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500 gap-2"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-4 h-4" /> Çıxış
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {searchOpen && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchQuery.trim()) {
                          router.push(`/memarlar?axtaris=${encodeURIComponent(searchQuery.trim())}`);
                        }
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                        placeholder="Memar axtar..."
                        className="h-8 w-40 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-[#0D9488]/20"
                      />
                    </form>
                  )}
                  <LanguageSwitcher />
                  <Link href="/giris">
                    <button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                      {t("nav.signIn")}
                    </button>
                  </Link>
                  <Link href="/qeydiyyat">
                    <button className="px-4 py-1.5 text-sm font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-full transition-colors">
                      {t("nav.signUp")}
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Right */}
            <div className="lg:hidden flex items-center gap-2">
              {status === "authenticated" && session && (
                <NavBadges userId={session.user.id} />
              )}
              <button
                className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Menyu aç"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Slide-In Drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-[300px] max-w-[85vw] bg-white flex flex-col shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image src="/ArchiLink.png" alt="ArchiLink" width={120} height={36} className="h-8 w-auto object-contain" />
          </Link>
          <button
            className="p-2 rounded-md text-gray-400 hover:bg-gray-50 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-4 px-5 py-4 text-sm font-medium border-b border-gray-50 transition-colors",
              pathname === "/" ? "text-[#0D9488] bg-[#0D9488]/5" : "text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Ana Səhifə</span>
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-5 py-4 text-sm font-medium border-b border-gray-50 transition-colors",
                isActive(link.href)
                  ? "text-[#0D9488] bg-[#0D9488]/5"
                  : "text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => setMobileOpen(false)}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-100" />

        <div className="p-4 space-y-3" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          {status === "loading" ? (
            <div className="h-10 bg-gray-100 rounded-full animate-pulse" />
          ) : session ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback className="text-xs bg-[#0D9488]/10 text-[#0D9488] font-semibold">
                    {getInitials(session.user.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{session.user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                </div>
              </div>

              <Link href="/panel" onClick={() => setMobileOpen(false)} className="block">
                <button className="w-full flex items-center gap-3 px-4 h-10 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Panel
                </button>
              </Link>
              <button
                className="w-full flex items-center gap-3 px-4 h-10 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border border-red-100"
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
              >
                <LogOut className="w-4 h-4 shrink-0" /> Çıxış
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" onClick={() => setMobileOpen(false)} className="block">
                <button className="w-full h-10 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Giriş
                </button>
              </Link>
              <Link href="/qeydiyyat" onClick={() => setMobileOpen(false)} className="block">
                <button className="w-full h-10 rounded-full text-sm font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors">
                  Qeydiyyat
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
