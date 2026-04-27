"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, Loader2, Star, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SPECIALIZATION_LABELS, getInitials } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const STYLE_OPTIONS = [
  { id: "minimalist", labelKey: "style.opt.minimalist", emoji: "◻️", descKey: "style.opt.minimalist.desc" },
  { id: "modern", labelKey: "style.opt.modern", emoji: "🏢", descKey: "style.opt.modern.desc" },
  { id: "classical", labelKey: "style.opt.classical", emoji: "🏛️", descKey: "style.opt.classical.desc" },
  { id: "industrial", labelKey: "style.opt.industrial", emoji: "🔩", descKey: "style.opt.industrial.desc" },
  { id: "scandinavian", labelKey: "style.opt.scandinavian", emoji: "🌿", descKey: "style.opt.scandinavian.desc" },
  { id: "luxury", labelKey: "style.opt.luxury", emoji: "✨", descKey: "style.opt.luxury.desc" },
  { id: "biophilic", labelKey: "style.opt.biophilic", emoji: "🌱", descKey: "style.opt.biophilic.desc" },
  { id: "mediterranean", labelKey: "style.opt.mediterranean", emoji: "🌊", descKey: "style.opt.mediterranean.desc" },
];

const SPACE_OPTIONS = [
  { id: "residential", labelKey: "style.space.residential", emoji: "🏠" },
  { id: "commercial", labelKey: "style.space.commercial", emoji: "🏪" },
  { id: "office", labelKey: "style.space.office", emoji: "💼" },
  { id: "hospitality", labelKey: "style.space.hospitality", emoji: "🏨" },
  { id: "landscape", labelKey: "style.space.landscape", emoji: "🌳" },
];

const BUDGET_OPTIONS = [
  { id: "economy", labelKey: "style.budget.economy" },
  { id: "mid", labelKey: "style.budget.mid" },
  { id: "premium", labelKey: "style.budget.premium" },
];

const STYLE_SPEC_MAP: Record<string, string[]> = {
  minimalist: ["interior_design", "architecture"],
  modern: ["architecture", "urban_planning"],
  classical: ["restoration", "architecture"],
  industrial: ["architecture", "interior_design"],
  scandinavian: ["interior_design"],
  luxury: ["interior_design", "architecture"],
  biophilic: ["landscape_architecture", "interior_design"],
  mediterranean: ["architecture", "landscape_architecture"],
  residential: ["interior_design", "architecture"],
  commercial: ["commercial_design", "architecture"],
  office: ["interior_design", "commercial_design"],
  hospitality: ["hospitality_design", "interior_design"],
  landscape: ["landscape_architecture"],
};

type Step = 1 | 2 | 3 | 4;

export default function StyleMatchPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>(1);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/giris");
      else setUserId(session.user.id);
    });
  }, [router]);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const toggleSpace = (id: string) => {
    setSelectedSpaces((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const findMatches = async () => {
    setLoading(true);
    const supabase = createClient();
    const allKeys = [...selectedStyles, ...selectedSpaces];
    const specs = new Set<string>();
    allKeys.forEach((key) => {
      (STYLE_SPEC_MAP[key] ?? []).forEach((s) => specs.add(s));
    });

    let query = supabase
      .from("profiles")
      .select(`
        id, username, bio, tagline, specialization, city, averageRating,
        totalReviews, totalProjects, isAvailable, avatarImage,
        user:users!userId(id, name, image),
        verificationBadges(badge)
      `)
      .eq("isAvailable", true)
      .order("averageRating", { ascending: false })
      .limit(6);

    if (specs.size > 0) {
      query = query.in("specialization", Array.from(specs));
    }

    if (selectedBudget === "economy") {
      query = query.lte("hourlyRate", 50);
    } else if (selectedBudget === "premium") {
      query = query.gte("hourlyRate", 150);
    }

    const { data } = await query;
    setResults(data ?? []);
    setLoading(false);
    setStep(4);
  };


  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold">{t("style.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("style.subtitle")}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all", step >= s ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-lg mb-1">{t("style.step1.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("style.step1.max")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleStyle(opt.id)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                  selectedStyles.includes(opt.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{t(`style.opt.${opt.id}`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`style.opt.${opt.id}.desc`)}</p>
                </div>
              </button>
            ))}
          </div>
          <Button onClick={() => setStep(2)} disabled={selectedStyles.length === 0} className="w-full gap-1.5">
            {t("style.next")} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-lg mb-1">{t("style.step2.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("style.step2.max")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPACE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleSpace(opt.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  selectedSpaces.includes(opt.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <p className="font-semibold text-sm">{t(`style.space.${opt.id}`)}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">{t("style.back")}</Button>
            <Button onClick={() => setStep(3)} disabled={selectedSpaces.length === 0} className="flex-1 gap-1.5">
              {t("style.next")} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-lg mb-1">{t("style.step3.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("style.step3.desc")}</p>
          </div>
          <div className="space-y-3">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedBudget(opt.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all",
                  selectedBudget === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <span className="font-medium">{t(`style.budget.${opt.id}`)}</span>
                {selectedBudget === opt.id && <div className="w-4 h-4 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>{t("style.back")}</Button>
            <Button onClick={findMatches} disabled={!selectedBudget || loading} className="flex-1 gap-1.5" variant="gradient">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {t("style.find")}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 - Results */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-semibold text-lg">{t("style.results.title")}</h2>
              <p className="text-sm text-muted-foreground">{results.length} {t("style.results.found")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setStep(1); setSelectedStyles([]); setSelectedSpaces([]); setSelectedBudget(""); }}>
              {t("style.results.reset")}
            </Button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-border">
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t("style.results.empty")}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((profile, idx) => {
                const name = profile.user?.name ?? profile.username ?? t("favoriler.architect");
                return (
                  <Link key={profile.id} href={`/memarlar/${profile.username}`}>
                    <div className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={profile.avatarImage ?? profile.user?.image} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        {idx === 0 && (
                          <div className="absolute -top-1 -right-1 bg-amber-400 text-white text-[9px] font-bold px-1 rounded-full">#1</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{name}</p>
                          {(profile.verificationBadges?.length ?? 0) > 0 && (
                            <Badge variant="premium" className="text-[10px]">Verified</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {profile.specialization && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {SPECIALIZATION_LABELS[profile.specialization] ?? profile.specialization}
                            </span>
                          )}
                          {profile.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {profile.city}
                            </span>
                          )}
                          {profile.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {profile.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {profile.tagline && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{profile.tagline}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
