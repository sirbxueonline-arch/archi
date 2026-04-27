"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  User,
  MapPin,
  Briefcase,
  Building2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Languages,
  Wrench,
  GraduationCap,
  Clock,
  Star,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const SERVICE_TYPE_OPTIONS = [
  "Memarlıq layihələndirmə",
  "İnteryer dizayn",
  "Landşaft dizaynı",
  "Eksteryer dizayn",
  "3D vizualizasiya",
  "Planlaşdırma",
  "BIM xidmətləri",
  "Tikinti nəzarəti",
  "Müəllif nəzarəti",
  "Təmir layihələri",
  "Mebel dizaynı",
  "Kommersiya obyektləri",
  "Yaşayış layihələri",
];

const OBJECT_TYPE_OPTIONS = [
  "Mənzil",
  "Villa / fərdi ev",
  "Ofis",
  "Restoran / kafe",
  "Otel",
  "Mağaza / showroom",
  "Klinika",
  "Təhsil obyekti",
  "İctimai bina",
  "Sənaye obyekti",
  "Masterplan / urbanistika",
];

const EXPERIENCE_OPTIONS = [
  { value: "1", label: "1–2 il", years: 1 },
  { value: "3", label: "3–5 il", years: 3 },
  { value: "6", label: "6–10 il", years: 6 },
  { value: "10", label: "10+ il", years: 10 },
];

const SERVICE_AREA_OPTIONS = [
  "Bakı",
  "Sumqayıt",
  "Gəncə",
  "Abşeron",
  "Şirvan",
  "Lənkəran",
  "Şəki",
  "Naxçıvan",
  "Mingəçevir",
  "Yevlax",
  "Bütün Azərbaycan",
  "Beynəlxalq",
];

const SKILL_OPTIONS = [
  "Archicad",
  "AutoCAD",
  "Revit",
  "3ds Max",
  "SketchUp",
  "Rhino",
  "Lumion",
  "D5",
  "Corona",
  "V-Ray",
  "Photoshop",
  "Illustrator",
  "InDesign",
  "BIM biliyi",
];

const LANGUAGE_OPTIONS = [
  { value: "az", label: "Azərbaycan", countryCode: "az" },
  { value: "ru", label: "Rus", countryCode: "ru" },
  { value: "en", label: "İngilis", countryCode: "gb" },
  { value: "tr", label: "Türk", countryCode: "tr" },
  { value: "de", label: "Alman", countryCode: "de" },
  { value: "fr", label: "Fransız", countryCode: "fr" },
  { value: "es", label: "İspan", countryCode: "es" },
  { value: "it", label: "İtalyan", countryCode: "it" },
  { value: "zh", label: "Çin", countryCode: "cn" },
  { value: "ja", label: "Yapon", countryCode: "jp" },
  { value: "ko", label: "Koreya", countryCode: "kr" },
  { value: "ar", label: "Ərəb", countryCode: "sa" },
  { value: "fa", label: "Fars", countryCode: "ir" },
  { value: "hi", label: "Hind", countryCode: "in" },
  { value: "pt", label: "Portuqal", countryCode: "pt" },
  { value: "pl", label: "Polyak", countryCode: "pl" },
  { value: "uk", label: "Ukrayna", countryCode: "ua" },
  { value: "nl", label: "Hollandiya", countryCode: "nl" },
  { value: "sv", label: "İsveç", countryCode: "se" },
  { value: "no", label: "Norveç", countryCode: "no" },
  { value: "da", label: "Danimarka", countryCode: "dk" },
  { value: "fi", label: "Fin", countryCode: "fi" },
  { value: "cs", label: "Çex", countryCode: "cz" },
  { value: "ro", label: "Rumın", countryCode: "ro" },
  { value: "hu", label: "Macar", countryCode: "hu" },
  { value: "el", label: "Yunan", countryCode: "gr" },
  { value: "he", label: "İvrit", countryCode: "il" },
  { value: "id", label: "İndoneziya", countryCode: "id" },
  { value: "ms", label: "Malay", countryCode: "my" },
  { value: "th", label: "Tailand", countryCode: "th" },
  { value: "vi", label: "Vyetnam", countryCode: "vn" },
  { value: "ka", label: "Gürcü", countryCode: "ge" },
  { value: "uz", label: "Özbək", countryCode: "uz" },
  { value: "kk", label: "Qazax", countryCode: "kz" },
];

const STEP_META = [
  { id: 1,  label: "Ad & Başlıq",      icon: User },
  { id: 2,  label: "Xidmət sahələri",  icon: Briefcase },
  { id: 3,  label: "Obyekt növləri",   icon: Building2 },
  { id: 4,  label: "Təcrübə",          icon: Clock },
  { id: 5,  label: "Yer",              icon: MapPin },
  { id: 6,  label: "Bacarıqlar",       icon: Wrench },
  { id: 7,  label: "Dillər",           icon: Languages },
  { id: 8,  label: "Təhsil",           icon: GraduationCap },
  { id: 9,  label: "Foto",             icon: ImageIcon },
  { id: 10, label: "Haqqında",         icon: FileText },
];

const TOTAL_STEPS = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type EducationEntry = { institution: string; degree: string; year: string };

// ─── Reusable multi-select card ───────────────────────────────────────────────

function SelectCard({
  value,
  label,
  emoji,
  selected,
  onToggle,
}: {
  value: string;
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

// ─── Checkbox list step (reusable) ───────────────────────────────────────────

function CheckboxListStep({
  title,
  subtitle,
  options,
  selected,
  onToggle,
  selectedLabel,
}: {
  title: string;
  subtitle: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  selectedLabel: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <>
      <div>
        <h2 className="font-heading font-semibold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Axtar..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-2 pr-1">
        {filtered.length === 0 && (
          <p className="col-span-2 text-sm text-muted-foreground text-center py-4">Nəticə tapılmadı</p>
        )}
        {filtered.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "text-left px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer",
              selected.includes(opt)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-primary">{selectedLabel}: {selected.length}</p>
      )}
    </>
  );
}

// ─── Checkbox pill ────────────────────────────────────────────────────────────

function CheckPill({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground hover:border-primary/50"
      )}
    >
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompleteProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Step 2
  const [specialties, setSpecialties] = useState<string[]>([]);

  // Step 3
  const [objectTypes, setObjectTypes] = useState<string[]>([]);

  // Step 4
  const [experienceYears, setExperienceYears] = useState("");

  // Step 4
  const [city, setCity] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);

  // Step 5
  const [skillsList, setSkillsList] = useState<string[]>([]);

  // Step 6
  const [languages, setLanguages] = useState<string[]>([]);

  // Step 7 (Education)

  // Step 8
  const [education, setEducation] = useState<EducationEntry[]>([
    { institution: "", degree: "", year: "" },
  ]);

  // Step 9
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 10
  const [bio, setBio] = useState("");

  // ── Auth check ────────────────────────────────────────────────────────────

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

      // Ensure users row exists — preserve existing role, only default to professional for NEW users
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
          role: existingUserRow?.role ?? "professional",
        },
        { onConflict: "id" }
      );

      // Load any existing draft
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("userId", session.user.id)
        .maybeSingle();

      if (existing) {
        if (existing.username) setUsername(existing.username);
        if (existing.professionalTitle) setProfessionalTitle(existing.professionalTitle);
        if (existing.specialization) setSpecialties([existing.specialization]);
        if (existing.experienceYears) setExperienceYears(String(existing.experienceYears));
        if (existing.city) setCity(existing.city);
        if (existing.serviceAreas) setServiceAreas(existing.serviceAreas);
        if (existing.skillsList) setSkillsList(existing.skillsList);
        if (existing.languages) setLanguages(existing.languages);
        if (existing.education && Array.isArray(existing.education)) {
          setEducation(
            existing.education.map((e: { institution: string; degree: string; year?: number }) => ({
              institution: e.institution ?? "",
              degree: e.degree ?? "",
              year: e.year != null ? String(e.year) : "",
            }))
          );
        }
        if (existing.avatarImage) setAvatarPreview(existing.avatarImage);
        if (existing.bio) setBio(existing.bio);
      }

      setChecking(false);
    });
  }, [router]);

  // ── Validation ────────────────────────────────────────────────────────────

  const validateStep = (): string | null => {
    switch (step) {
      case 1:
        if (!fullName.trim()) return "Ad mütləqdir";
        if (username.length < 3) return "İstifadəçi adı ən az 3 simvol olmalıdır";
        if (!/^[a-z0-9._-]+$/.test(username))
          return "Yalnız kiçik hərf, rəqəm, nöqtə, tire";
        return null;
      case 2:
        if (specialties.length === 0) return "Ən az bir xidmət sahəsi seçin";
        return null;
      case 4:
        if (!experienceYears) return "Təcrübə ilini seçin";
        return null;
      case 5:
        if (!city) return "Şəhər seçin";
        return null;
      case 10:
        if (bio.trim().length < 50) return `Bio ən az 50 simvol olmalıdır (hazırda: ${bio.trim().length})`;
        return null;
      default:
        return null;
    }
  };

  // ── Save draft to Supabase ────────────────────────────────────────────────

  const buildPayload = () => ({
    userId,
    username: username || `user_${userId?.slice(0, 8)}`,
    professionalTitle: professionalTitle || null,
    specialization: null,
    experienceYears: experienceYears ? parseInt(experienceYears) : 0,
    city: city || null,
    serviceAreas: serviceAreas.length ? serviceAreas : null,
    skillsList: [...specialties, ...objectTypes, ...skillsList].length ? [...specialties, ...objectTypes, ...skillsList] : null,
    languages: languages.length ? languages : null,
    hourlyRate: null,
    education: education.filter((e) => e.institution || e.degree).map((e) => ({
      institution: e.institution,
      degree: e.degree,
      year: e.year ? parseInt(e.year) : undefined,
    })),
    bio: bio || null,
    updatedAt: new Date().toISOString(),
  });

  const saveDraft = async (quiet = false) => {
    if (!userId) return;
    if (!quiet) setSavingDraft(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert(buildPayload(), { onConflict: "userId" });
    if (!quiet) {
      setSavingDraft(false);
      if (error) toast.error(error.message);
      else toast.success("Qaralama saxlanıldı");
    }
  };

  const handleFinishLater = async () => {
    await saveDraft();
    router.push("/panel");
  };

  // ── Avatar upload ─────────────────────────────────────────────────────────

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !userId) return null;
    const supabase = createClient();
    const ext = avatarFile.name.split(".").pop();
    const path = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, avatarFile, { upsert: true });
    if (error) {
      toast.error("Şəkil yüklənmədi: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("profiles").getPublicUrl(path);
    return data.publicUrl;
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    // Auto-save on each step advance (silent)
    await saveDraft(true);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  // ── Final publish ─────────────────────────────────────────────────────────

  const handlePublish = async () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    const supabase = createClient();

    let avatarUrl: string | null = null;
    if (avatarFile) avatarUrl = await uploadAvatar();

    const payload: Record<string, unknown> = {
      ...buildPayload(),
    };
    if (avatarUrl) payload.avatarImage = avatarUrl;

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "userId" });

    setLoading(false);
    if (error) {
      console.error("Profile upsert error:", error.message, error.code, error.details, error.hint);
      toast.error(error.message || error.code || "Profil saxlanılmadı");
      return;
    }

    // Update users table name if changed
    await supabase
      .from("users")
      .update({ name: fullName })
      .eq("id", userId!);

    // Send welcome email (fire and forget — don't block the redirect)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      triggerWelcomeEmail(session.user.email, fullName, "professional");
    }

    toast.success("Profil yayımlandı!");
    router.push("/panel");
  };

  // ── Education helpers ─────────────────────────────────────────────────────

  const addEducation = () =>
    setEducation((prev) => [...prev, { institution: "", degree: "", year: "" }]);

  const removeEducation = (idx: number) =>
    setEducation((prev) => prev.filter((_, i) => i !== idx));

  const updateEducation = (
    idx: number,
    field: keyof EducationEntry,
    value: string
  ) =>
    setEducation((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );

  const toggleMulti = <T extends string>(
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    value: T
  ) =>
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  // ── Loading state ─────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Progress bar ──────────────────────────────────────────────────────────

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-1">
          Peşəkar Profil
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

        {/* ── Step 1: Full name + username + professional title ──────────── */}
        {step === 1 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">Ad və Başlıq</h2>
              <p className="text-sm text-muted-foreground">
                Profiliniz üçün əsas məlumatlar
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Ad Soyad *</Label>
              <Input
                id="fullName"
                placeholder="Kamran Əliyev"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">İstifadəçi adı *</Label>
              <Input
                id="username"
                placeholder="kamran.aliyev"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase());
                  setUsernameError("");
                }}
              />
              {usernameError && (
                <p className="text-xs text-destructive">{usernameError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                archilink.az/memarlar/{username || "..."}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profTitle">Peşəkar Başlıq</Label>
              <Input
                id="profTitle"
                placeholder='Məs: "Baş Memar" və ya "İnteryer Dizayneri"'
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
              />
            </div>
          </>
        )}

        {/* ── Step 2: Service types ─────────────────────────────────────── */}
        {step === 2 && (
          <CheckboxListStep
            title="Xidmət sahələri"
            subtitle="Bir və ya bir neçə xidmət sahəsi seçin"
            options={SERVICE_TYPE_OPTIONS}
            selected={specialties}
            onToggle={(val) => toggleMulti(specialties, setSpecialties, val)}
            selectedLabel="Seçildi"
          />
        )}

        {/* ── Step 3: Object types ──────────────────────────────────────── */}
        {step === 3 && (
          <CheckboxListStep
            title="İşlədiyi obyekt növləri"
            subtitle="Hansı növ obyektlərlə işləyirsiniz?"
            options={OBJECT_TYPE_OPTIONS}
            selected={objectTypes}
            onToggle={(val) => toggleMulti(objectTypes, setObjectTypes, val)}
            selectedLabel="Seçildi"
          />
        )}

        {/* ── Step 4: Years of experience ───────────────────────────────── */}
        {step === 4 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">
                Təcrübə müddəti
              </h2>
              <p className="text-sm text-muted-foreground">
                Sahədəki iş təcrübəniz
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExperienceYears(opt.value)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    experienceYears === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="font-semibold text-base">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {opt.years === 1
                      ? "Başlanğıc səviyyə"
                      : opt.years === 3
                      ? "Orta səviyyə"
                      : opt.years === 6
                      ? "Yüksək səviyyə"
                      : "Ekspert"}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Step 5: City + service areas ──────────────────────────────── */}
        {step === 5 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">Yer məlumatı</h2>
              <p className="text-sm text-muted-foreground">
                Xidmət göstərdiyin ərazilər
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Əsas şəhər *</Label>
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
              <Label>Xidmət əraziləri (çoxlu seçim)</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_AREA_OPTIONS.map((area) => (
                  <CheckPill
                    key={area}
                    label={area}
                    selected={serviceAreas.includes(area)}
                    onToggle={() =>
                      toggleMulti(serviceAreas, setServiceAreas, area)
                    }
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Step 6: Technical skills ───────────────────────────────────── */}
        {step === 6 && (
          <CheckboxListStep
            title="Texniki bacarıqlar"
            subtitle="İstifadə etdiyin proqramları seçin"
            options={SKILL_OPTIONS}
            selected={skillsList}
            onToggle={(val) => toggleMulti(skillsList, setSkillsList, val)}
            selectedLabel="Seçildi"
          />
        )}

        {/* ── Step 7: Languages ──────────────────────────────────────────── */}
        {step === 7 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">
                Danışdığınız dillər
              </h2>
              <p className="text-sm text-muted-foreground">
                Müştərilərlə hansı dillərdə ünsiyyət qura bilərsiniz?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => toggleMulti(languages, setLanguages, lang.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                    languages.includes(lang.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  <img
                    src={`https://flagcdn.com/${lang.countryCode}.svg`}
                    width={24}
                    height={16}
                    alt={lang.label}
                    className="rounded-sm object-cover flex-shrink-0"
                  />
                  {lang.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Step 8: Education & certifications ────────────────────────── */}
        {step === 8 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">
                Təhsil və sertifikatlar
              </h2>
              <p className="text-sm text-muted-foreground">
                Diplom, kurs, sertifikat
              </p>
            </div>
            <div className="space-y-3">
              {education.map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border p-4 space-y-3 relative"
                >
                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Müəssisə adı</Label>
                    <Input
                      placeholder="Azərbaycan Memarlıq və İnşaat Universiteti"
                      value={entry.institution}
                      onChange={(e) =>
                        updateEducation(idx, "institution", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Dərəcə / Başlıq</Label>
                      <Input
                        placeholder="Bakalavr"
                        value={entry.degree}
                        onChange={(e) =>
                          updateEducation(idx, "degree", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">İl</Label>
                      <Input
                        placeholder="2018"
                        type="number"
                        min={1970}
                        max={new Date().getFullYear()}
                        value={entry.year}
                        onChange={(e) =>
                          updateEducation(idx, "year", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEducation}
              className="w-full gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Daha bir əlavə et
            </Button>
          </>
        )}

        {/* ── Step 9: Profile photo ──────────────────────────────────────── */}
        {step === 9 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">Profil şəkli</h2>
              <p className="text-sm text-muted-foreground">
                Peşəkar görünüşlü bir foto seçin
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {avatarPreview ? "Şəkli dəyişdir" : "Şəkil yüklə"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG, WEBP — maks. 5 MB. Bu addımı keçə bilərsiniz.
              </p>
            </div>
          </>
        )}

        {/* ── Step 10: Bio + summary ─────────────────────────────────────── */}
        {step === 10 && (
          <>
            <div>
              <h2 className="font-heading font-semibold mb-1">
                Haqqında / Bio
              </h2>
              <p className="text-sm text-muted-foreground">
                Özünüzü müştərilərə tanıdın
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                placeholder="Özünüz, iş yanaşmanız və güclü tərəfləriniz haqqında yazın..."
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimum 50 simvol</span>
                <span className={bio.trim().length >= 50 ? "text-primary" : ""}>
                  {bio.trim().length} simvol
                </span>
              </div>
            </div>

            {/* Summary card */}
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-sm">
              <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Xülasə
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {fullName && (
                  <span>
                    <span className="text-muted-foreground">Ad:</span>{" "}
                    {fullName}
                  </span>
                )}
                {professionalTitle && (
                  <span>
                    <span className="text-muted-foreground">Başlıq:</span>{" "}
                    {professionalTitle}
                  </span>
                )}
                {city && (
                  <span>
                    <span className="text-muted-foreground">Şəhər:</span>{" "}
                    {city}
                  </span>
                )}
                {experienceYears && (
                  <span>
                    <span className="text-muted-foreground">Təcrübə:</span>{" "}
                    {
                      EXPERIENCE_OPTIONS.find(
                        (o) => o.value === experienceYears
                      )?.label
                    }
                  </span>
                )}
              </div>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {specialties.map((sp) => (
                    <span
                      key={sp}
                      className="rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          {step > 1 && (
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
            <Button
              onClick={handleNext}
              className="flex-1 gap-1.5"
              disabled={savingDraft}
            >
              {savingDraft ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  İrəli
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 gap-1.5"
              variant="gradient"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  Profili Yayımla
                </>
              )}
            </Button>
          )}
        </div>

        {/* Finish later */}
        <button
          onClick={handleFinishLater}
          disabled={savingDraft}
          className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          {savingDraft ? (
            <span className="flex items-center justify-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saxlanılır...
            </span>
          ) : (
            "Sonra tamamla → (irəliləyiş saxlanılır)"
          )}
        </button>
      </div>
    </div>
  );
}
