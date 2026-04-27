"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris?callbackUrl=/panel");
        return;
      }

      // Always read role from users table — user_metadata can be stale
      const { data: userRow } = await supabase
        .from("users")
        .select("role, name, image")
        .eq("id", session.user.id)
        .single();

      let role = userRow?.role || session.user.user_metadata?.role || "client";

      // Self-heal: if role shows "client" but user has a professional profile, fix it
      if (role === "client") {
        const { data: proProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("userId", session.user.id)
          .not("username", "like", "musteri_%")
          .maybeSingle();
        if (proProfile) {
          role = "professional";
          await supabase.from("users").update({ role: "professional" }).eq("id", session.user.id);
        }
      }

      // Fetch availability from profile
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("isAvailable")
        .eq("userId", session.user.id)
        .maybeSingle();
      setIsAvailable(profileRow?.isAvailable ?? true);

      // Update lastSeenAt so online indicator works on public profile page
      supabase
        .from("profiles")
        .update({ lastSeenAt: new Date().toISOString() })
        .eq("userId", session.user.id)
        .then(() => {});

      setUser({
        id: session.user.id,
        name: userRow?.name || session.user.user_metadata?.name || session.user.email,
        email: session.user.email,
        image: userRow?.image || session.user.user_metadata?.avatar_url,
        role,
      });
      setLoading(false);
    };

    checkAuth();

    // Listen for direct avatar updates from the profile page
    const onAvatarUpdated = (e: Event) => {
      const url = (e as CustomEvent<string>).detail;
      setUser((prev: any) => prev ? { ...prev, image: url } : prev);
    };
    window.addEventListener("archilink:avatar-updated", onAvatarUpdated);

    // Listen for availability toggle changes from the dashboard panel
    const onAvailabilityUpdated = (e: Event) => {
      setIsAvailable((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener("archilink:availability-updated", onAvailabilityUpdated);

    // Listen for auth metadata changes (e.g. avatar update from profile page)
    // NOTE: Only update image/name — never overwrite role (role comes from users table, not metadata)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            image: session.user.user_metadata?.avatar_url ?? prev.image,
            name: session.user.user_metadata?.name || prev.name || session.user.email,
            // role is intentionally NOT updated here — it comes from the users table in checkAuth
          };
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("archilink:avatar-updated", onAvatarUpdated);
      window.removeEventListener("archilink:availability-updated", onAvailabilityUpdated);
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 rounded-lg bg-primary/30" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex pt-14 lg:pt-16">
        <DashboardSidebar user={user} isAvailable={isAvailable} />
        {/* pb-24 on mobile accounts for bottom nav bar (h-16) + safe area buffer */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)] pb-24 lg:pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
