"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { triggerWelcomeEmail } from "@/server/actions/auth";
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Building2,
  MapPin,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: "residential", label: "Yaşayış", emoji: "🏠" },
  { value: "commercial", label: "Kommersiya", emoji: "🏪" },
  { value: "office", label: "Ofis", emoji: "🏢" },
  { value: "landscape", label: "Landşaft", emoji: "🌿" },
  { value: "interior", label: "İnteryer", emoji: "🛋️" },
  { value: "other", label: "Digər", emoji: "📋" },
];

const REFERRAL_OPTIONS = [
  { value: "google", label: "Google axtarışı" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "referral", label: "Tanış tövsiyəsi" },
  { value: "other", label: "Digər" },
];

const TOTAL_STEPS = 3;

const STEP_META = [
  { id: 1, label: "Məlumatlar", icon: Building2 },
  { id: 2, label: "Layihə növü", icon: MapPin },
  { id: 3, label: "Xoş gəldiniz", icon: PartyPopper },
];

// ─── SelectCard component ─────────────────────────────────────────────────────

function SelectCard({
  label,
  emoji,
  selected,
  onToggle,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-all cursor-pointer",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      {emoji && <span className="text-xl leading-none">{emoji}</span>}
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClientOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Step 2
  const [city, setCity] = useState("");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);

  // Step 3
  const [referral, setReferral] = useState("");

  // ── Auth check ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/giris");
        return;
      }
      setUserId(session.user.id);
      const meta = session.user.user_metadata ?? {};
      if (meta.name) setFullName(meta.name);

      // Ensure users row exists — read current role first so we never overwrite it
      const { data: existingUserRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      await supabase.from("users").upsert(
        {
          id: session.user.id,
          email: session.user.email!,
          name: meta.name ?? "",
          role: existingUserRow?.role ?? meta.role ?? "client",
        },
        { onConflict: "id" }
      );

      setChecking(false);
    });
  }, [router]);

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!fullName.trim()) return "Ad mütləqdir";
    }
    if (step === 2) {
      if (!city) return "Şəhər seçin";
      if (projectTypes.length === 0) return "Ən az bir layihə növü seçin";
    }
    return null;
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const toggleProjectType = (value: string) => {
    setProjectTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // ── Final submit ────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    setLoading(true);
    const supabase = createClient();

    // Update the user's name if changed
    const { error: userErr } = await supabase
      .from("users")
      .update({ name: fullName })
      .eq("id", userId!);

    if (userErr) {
      toast.error(userErr.message);
      setLoading(false);
      return;
    }

    // Store client preferences in the profiles table
    // We use tagline for company, serviceAreas for project preferences,
    // and city for location. "referral" goes into metaDescription as a lightweight store.
    const { error: profileErr } = await supabase.from("profiles").upsert(
      {
        userId,
        username: `musteri_${userId?.slice(0, 8)}`,
        city: city || null,
        serviceAreas: projectTypes.length ? projectTypes : null,
        tagline: companyName || null,
        metaDescription: referral ? `referral:${referral}` : null,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: "userId" }
    );

    setLoading(false);

    if (profileErr) {
      toast.error(profileErr.message);
    } else {
      // Send client welcome email (fire and forget)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        triggerWelcomeEmail(session.user.email, fullName, "client");
      }

      toast.success("Xoş gəldiniz, ArchiLink-ə!");
      router.push("/panel");
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-1">
          Hesabınızı qurun
        </h1>
        <p className="text-muted-foreground text-sm">
          Addım {step} / {TOTAL_STEPS} — {STEP_META[step - 1].label}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{progressPct}% tamamlandı</span>
          <span className="text-xs text-muted-foreground">{step} / {TOTAL_STEPS}</span>
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 space-y-5">

        {/* ── Step 1: Full name + company name ──────────────────────────── */}
        {step === 1 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">Şəxsi məlumatlar</h2>
              <p className="text-sm text-muted-foreground">
                Peşəkarlara özünüzü tanıdın
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientName">Ad Soyad *</Label>
              <Input
                id="clientName"
                placeholder="Anar Hüseynov"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">
                Şirkət / Firma adı{" "}
                <span className="text-muted-foreground text-xs">(istəyə görə)</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Hüseynov İnşaat MMC"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </>
        )}

        {/* ── Step 2: City + project types ──────────────────────────────── */}
        {step === 2 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">
                Layihə məlumatları
              </h2>
              <p className="text-sm text-muted-foreground">
                Hansı şəhərdə, hansı tip layihə üçün peşəkar axtarırsınız?
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Şəhər *</Label>
              <Select onValueChange={setCity} value={city}>
                <SelectTrigger>
                  <SelectValue placeholder="Şəhər seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Layihə növü *</Label>
              <div className="grid grid-cols-3 gap-2">
                {PROJECT_TYPES.map((pt) => (
                  <SelectCard
                    key={pt.value}
                    label={pt.label}
                    emoji={pt.emoji}
                    selected={projectTypes.includes(pt.value)}
                    onToggle={() => toggleProjectType(pt.value)}
                  />
                ))}
              </div>
              {projectTypes.length > 0 && (
                <p className="text-xs text-primary">
                  {projectTypes.length} növ seçildi
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Referral + welcome message ────────────────────────── */}
        {step === 3 && (
          <>
            <div className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <PartyPopper className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-heading font-semibold text-lg">
                Xoş gəldiniz, {fullName.split(" ")[0]}!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                ArchiLink-ə qoşulduğunuz üçün təşəkkür edirik. Azərbaycanın ən
                yaxşı memarları sizi gözləyir.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Bizi haradan eşitdiniz?{" "}
                <span className="text-muted-foreground text-xs">(istəyə görə)</span>
              </Label>
              <div className="space-y-2">
                {REFERRAL_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                      referral === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="referral"
                      value={opt.value}
                      checked={referral === opt.value}
                      onChange={() => setReferral(opt.value)}
                      className="accent-primary w-4 h-4 shrink-0"
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </>
        )}

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          {step > 1 && step < TOTAL_STEPS && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
          )}

          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext} className="flex-1 gap-1.5">
              İrəli
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 gap-1.5"
              variant="gradient"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Panelə keç
                </>
              )}
            </Button>
          )}
        </div>

        {step < TOTAL_STEPS && (
          <button
            onClick={() => router.push("/panel")}
            className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            Sonra tamamla →
          </button>
        )}
      </div>
    </div>
  );
}
