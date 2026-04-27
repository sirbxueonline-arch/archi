"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Loader2, HardHat, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { triggerWelcomeEmail } from "@/server/actions/auth";

export default function RolSecPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"professional" | "client" | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/giris");
        return;
      }
      setUserId(session.user.id);
      setChecking(false);
    });
  }, [router]);

  const handleContinue = async () => {
    if (!selected || !userId) return;
    setLoading(true);
    const supabase = createClient();

    await supabase
      .from("users")
      .update({ role: selected })
      .eq("id", userId);

    // Send welcome email for Google OAuth users (email/password users get it at signup)
    const { data: { session } } = await supabase.auth.getSession();
    const isGoogleUser = session?.user?.app_metadata?.provider === "google";
    if (isGoogleUser && session?.user?.email) {
      const name = session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? "";
      triggerWelcomeEmail(session.user.email, name, selected);
    }

    if (selected === "professional") {
      router.push("/qeydiyyat/tamamla");
    } else {
      router.push("/qeydiyyat/musteri-tamamla");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl font-bold mb-2">Hesab növünü seçin</h1>
        <p className="text-muted-foreground text-sm">
          ArchiLink-ə necə qoşulmaq istəyirsiniz?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Customer */}
        <button
          type="button"
          onClick={() => setSelected("client")}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer",
            selected === "client"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:border-primary/50 hover:bg-muted/40 text-foreground"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            selected === "client" ? "bg-primary/20" : "bg-muted"
          )}>
            <Search className="w-7 h-7" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base">Müştəri</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Memar və dizayner axtarıram
            </p>
          </div>
        </button>

        {/* Professional */}
        <button
          type="button"
          onClick={() => setSelected("professional")}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer",
            selected === "professional"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:border-primary/50 hover:bg-muted/40 text-foreground"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            selected === "professional" ? "bg-primary/20" : "bg-muted"
          )}>
            <HardHat className="w-7 h-7" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base">Peşəkar</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Memar, dizayner və ya mütəxəssisəm
            </p>
          </div>
        </button>
      </div>

      <Button
        className="w-full"
        disabled={!selected || loading}
        onClick={handleContinue}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Davam et"
        )}
      </Button>
    </div>
  );
}
