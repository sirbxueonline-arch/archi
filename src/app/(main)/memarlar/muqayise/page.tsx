"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { SPECIALIZATION_LABELS } from "@/lib/utils";
import {
  Star, MapPin, Briefcase, CheckCircle, XCircle,
  UserPlus, Copy, Check, Search, Loader2, Users,
} from "lucide-react";

interface Architect {
  id: string;
  username: string;
  bio: string | null;
  tagline: string | null;
  city: string | null;
  specialization: string | null;
  averageRating: number | null;
  totalReviews: number | null;
  totalProjects: number | null;
  isAvailable: boolean | null;
  avatarImage: string | null;
  user?: { name: string | null } | null;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 justify-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>
    </div>
  );
}

function AvatarPlaceholder({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const cls = size === "lg" ? "w-20 h-20 text-2xl" : "w-14 h-14 text-lg";
  return (
    <div className={`${cls} rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-primary mx-auto`}>
      {initials || "?"}
    </div>
  );
}

function SkeletonColumn() {
  return (
    <div className="flex flex-col gap-4 items-center animate-pulse">
      <div className="h-20 w-20 rounded-full bg-muted" />
      <div className="h-4 w-28 bg-muted rounded" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

function AddSlot({ onAdd }: { onAdd: (username: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Architect[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, username, tagline, city, specialization, avatarImage, user:users!userId(name)")
      .ilike("username", `%${q}%`)
      .limit(5);
    setResults((data ?? []) as unknown as Architect[]);
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-border flex items-center justify-center">
        <UserPlus className="w-7 h-7 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">Memar əlavə edin</p>
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İstifadəçi adı axtar..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>
      {results.length > 0 && (
        <div className="w-full rounded-xl border border-border bg-white shadow-md overflow-hidden">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => { onAdd(r.username); setQuery(""); setResults([]); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors border-b border-border last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-xs">
                {(r.user?.name ?? r.username).slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{r.user?.name ?? r.username}</p>
                <p className="text-xs text-muted-foreground truncate">@{r.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getBestIdx(architects: (Architect | null)[], key: keyof Architect): number {
  let best = -1;
  let bestVal = -Infinity;
  architects.forEach((a, i) => {
    if (!a) return;
    const v = Number(a[key] ?? 0);
    if (v > bestVal) { bestVal = v; best = i; }
  });
  return best;
}

/** A single horizontal comparison row: label column + 3 value columns */
function CompareRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr_1fr_1fr] border-t border-border min-h-[64px]">
      <div className="flex items-center gap-2 px-5 py-4 text-sm font-semibold text-slate-600 bg-slate-50 border-r border-border">
        <span className="text-primary shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function CellText({ value, truncate = false }: { value: string | null; truncate?: boolean }) {
  return (
    <div className="flex items-center justify-center px-4 py-4 border-r border-border last:border-r-0">
      {value ? (
        <span className={`text-sm text-slate-700 text-center ${truncate ? "line-clamp-2" : ""}`}>{value}</span>
      ) : null}
    </div>
  );
}

function CellCustom({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-4 py-4 border-r border-border last:border-r-0 ${highlight ? "bg-emerald-50" : ""}`}>
      {children}
    </div>
  );
}

function ComparePageInner() {
  const searchParams = useSearchParams();
  const [architects, setArchitects] = useState<(Architect | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const slots = [
    searchParams.get("a"),
    searchParams.get("b"),
    searchParams.get("c"),
  ];

  useEffect(() => {
    const usernames = slots.filter(Boolean) as string[];
    if (usernames.length === 0) return;

    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select(`
          id, username, bio, tagline, city, specialization,
          averageRating, totalReviews, totalProjects, isAvailable, avatarImage,
          user:users!userId(name)
        `)
        .in("username", usernames);

      const result = slots.map((slug) => {
        if (!slug) return null;
        return (data ?? []).find((p: any) => p.username === slug) as unknown as Architect ?? null;
      });
      setArchitects(result);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const navigate = (newSlots: (string | null)[]) => {
    const keys = ["a", "b", "c"];
    const params = new URLSearchParams();
    newSlots.forEach((u, i) => { if (u) params.set(keys[i], u); });
    window.location.search = params.toString();
  };

  const handleAdd = (slotIdx: number, username: string) => {
    const current = slots.map((s) => s ?? null);
    current[slotIdx] = username;
    navigate(current);
  };

  const handleRemove = (slotIdx: number) => {
    const current = slots.map((s) => s ?? null);
    current[slotIdx] = null;
    // Compact so empty slots shift to the end
    const filled = current.filter(Boolean) as string[];
    const padded: (string | null)[] = [...filled, null, null, null].slice(0, 3);
    navigate(padded);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bestRatingIdx = getBestIdx(architects, "averageRating");
  const bestReviewsIdx = getBestIdx(architects, "totalReviews");
  const bestProjectsIdx = getBestIdx(architects, "totalProjects");
  const hasAny = architects.some(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">Memar Müqayisəsi</h1>
          <p className="text-white/70 text-lg max-w-xl">
            Maksimum 3 memarı yan-yana müqayisə edin
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-x-auto">
        {/* Share Button */}
        {hasAny && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-slate-700 hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopyalandı!" : "Müqayisəni Paylaş"}
            </button>
          </div>
        )}

        {/* Comparison Panel */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden min-w-[680px]">

          {/* ── Header row: avatar + name ── */}
          <div className="grid grid-cols-[160px_1fr_1fr_1fr] border-b border-border">
            <div className="px-5 py-4 bg-slate-50 border-r border-border flex items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Memar</span>
            </div>
            {architects.map((arch, idx) => (
              <div key={idx} className="p-5 text-center border-r border-border last:border-r-0">
                {loading ? (
                  <SkeletonColumn />
                ) : arch ? (
                  <div className="flex flex-col items-center gap-2">
                    {arch.avatarImage ? (
                      <img
                        src={arch.avatarImage}
                        alt={arch.username}
                        className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-border"
                      />
                    ) : (
                      <AvatarPlaceholder name={arch.user?.name ?? arch.username} size="lg" />
                    )}
                    <div>
                      <p className="font-heading font-bold text-slate-900 text-sm leading-snug">
                        {arch.user?.name ?? arch.username}
                      </p>
                      <p className="text-xs text-muted-foreground">@{arch.username}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                ) : (
                  <AddSlot onAdd={(u) => handleAdd(idx, u)} />
                )}
              </div>
            ))}
          </div>

          {/* ── Row: Specialization ── */}
          <CompareRow label="İxtisas" icon={<Briefcase className="w-4 h-4" />}>
            {architects.map((arch, idx) => (
              <CellText
                key={idx}
                value={arch ? (SPECIALIZATION_LABELS[arch.specialization ?? ""] ?? arch.specialization ?? "—") : null}
              />
            ))}
          </CompareRow>

          {/* ── Row: City ── */}
          <CompareRow label="Şəhər" icon={<MapPin className="w-4 h-4" />}>
            {architects.map((arch, idx) => (
              <CellText key={idx} value={arch?.city ?? null} />
            ))}
          </CompareRow>

          {/* ── Row: Rating ── */}
          <CompareRow label="Reytinq" icon={<Star className="w-4 h-4" />}>
            {architects.map((arch, idx) => (
              <CellCustom key={idx} highlight={idx === bestRatingIdx && !!arch?.averageRating}>
                {arch ? (
                  arch.averageRating ? (
                    <StarRating value={arch.averageRating} />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )
                ) : null}
              </CellCustom>
            ))}
          </CompareRow>

          {/* ── Row: Total Reviews ── */}
          <CompareRow label="Rəy sayı" icon={<Star className="w-4 h-4" />}>
            {architects.map((arch, idx) => (
              <CellCustom key={idx} highlight={idx === bestReviewsIdx && !!arch}>
                {arch ? (
                  <span className={`text-sm font-bold ${idx === bestReviewsIdx ? "text-emerald-700" : "text-slate-700"}`}>
                    {arch.totalReviews ?? 0}
                  </span>
                ) : null}
              </CellCustom>
            ))}
          </CompareRow>

          {/* ── Row: Total Projects ── */}
          <CompareRow label="Layihə sayı" icon={<Briefcase className="w-4 h-4" />}>
            {architects.map((arch, idx) => (
              <CellCustom key={idx} highlight={idx === bestProjectsIdx && !!arch}>
                {arch ? (
                  <span className={`text-sm font-bold ${idx === bestProjectsIdx ? "text-emerald-700" : "text-slate-700"}`}>
                    {arch.totalProjects ?? 0}
                  </span>
                ) : null}
              </CellCustom>
            ))}
          </CompareRow>

          {/* ── Row: Availability ── */}
          <CompareRow label="Mövcudluq" icon={<CheckCircle className="w-4 h-4" />}>
            {architects.map((arch, idx) => (
              <CellCustom key={idx}>
                {arch ? (
                  arch.isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Mövcuddur
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Məşğul
                    </span>
                  )
                ) : null}
              </CellCustom>
            ))}
          </CompareRow>

          {/* ── Row: Bio / Tagline ── */}
          <CompareRow label="Haqqında" icon={<Briefcase className="w-4 h-4" />}>
            {architects.map((arch, idx) => (
              <CellText
                key={idx}
                value={arch ? (arch.tagline ?? arch.bio ?? "—") : null}
                truncate
              />
            ))}
          </CompareRow>

          {/* ── Footer row: Profile buttons ── */}
          <div className="grid grid-cols-[160px_1fr_1fr_1fr] border-t border-border bg-slate-50">
            <div className="px-5 py-4 border-r border-border" />
            {architects.map((arch, idx) => (
              <div key={idx} className="flex items-center justify-center px-4 py-5 border-r border-border last:border-r-0">
                {arch ? (
                  <Link
                    href={`/memarlar/${arch.username}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Profili Gör
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        {hasAny && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            Ən yüksək dəyər
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageInner />
    </Suspense>
  );
}
