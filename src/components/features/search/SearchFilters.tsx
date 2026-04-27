"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, Filter, Bookmark, BookmarkCheck, Trash2, Star, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { SPECIALIZATION_LABELS, CITIES } from "@/lib/utils";

interface SavedSearch {
  id: string;
  label: string;
  params: string;
  savedAt: number;
}

const EXPERIENCE_RANGES = [
  { value: "1-3", label: "1-3 il" },
  { value: "3-5", label: "3-5 il" },
  { value: "5-10", label: "5-10 il" },
  { value: "10+", label: "10+ il" },
];

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("archilink_saved_searches");
      if (stored) setSavedSearches(JSON.parse(stored));
    } catch {}
  }, []);

  const persistSavedSearches = (searches: SavedSearch[]) => {
    setSavedSearches(searches);
    localStorage.setItem("archilink_saved_searches", JSON.stringify(searches));
  };

  const saveCurrentSearch = () => {
    const params = searchParams.toString();
    if (!params) return;
    const parts: string[] = [];
    if (searchParams.get("axtaris")) parts.push(searchParams.get("axtaris")!);
    if (searchParams.get("ixtisas")) parts.push(SPECIALIZATION_LABELS[searchParams.get("ixtisas")!] ?? searchParams.get("ixtisas")!);
    if (searchParams.get("seher")) parts.push(searchParams.get("seher")!);
    const label = parts.join(" · ") || "Axtarış";
    const newSearch: SavedSearch = { id: Date.now().toString(), label, params, savedAt: Date.now() };
    persistSavedSearches([newSearch, ...savedSearches.slice(0, 4)]);
  };

  const deleteSavedSearch = (id: string) => {
    persistSavedSearches(savedSearches.filter((s) => s.id !== id));
  };

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("sehife");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters =
    searchParams.has("ixtisas") ||
    searchParams.has("seher") ||
    searchParams.has("axtaris") ||
    searchParams.has("min_reytinq") ||
    searchParams.has("tecrube") ||
    searchParams.has("tesdiqlenib");

  const currentMinRating = parseInt(searchParams.get("min_reytinq") ?? "0", 10);

  return (
    <div className="sticky top-24 space-y-6">
      {/* Mobile toggle button */}
      <button
        className="lg:hidden w-full flex items-center justify-between bg-white border border-border rounded-2xl px-5 py-4 font-heading font-semibold text-sm"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          Filterlər {hasFilters && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
        </span>
        {mobileOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <div className={`space-y-6 ${mobileOpen ? "block" : "hidden"} lg:block`}>
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="hidden lg:flex items-center gap-2 font-heading font-semibold text-sm">
            <Filter className="w-4 h-4 text-primary" />
            Filterlər
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <>
                <button
                  onClick={saveCurrentSearch}
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  title="Axtarışı saxla"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Saxla
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Təmizlə
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Axtarış
          </Label>
          <Input
            placeholder="Ad, ixtisas..."
            startIcon={<Search className="w-4 h-4" />}
            defaultValue={searchParams.get("axtaris") ?? ""}
            onChange={(e) => {
              clearTimeout((window as Window & { _st?: ReturnType<typeof setTimeout> })._st);
              (window as Window & { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
                updateFilter("axtaris", e.target.value);
              }, 500);
            }}
          />
        </div>

        <Separator className="my-4" />

        {/* Specialization */}
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            İxtisas
          </Label>
          <Select
            value={searchParams.get("ixtisas") ?? "all"}
            onValueChange={(v) => updateFilter("ixtisas", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bütün ixtisaslar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün ixtisaslar</SelectItem>
              {Object.entries(SPECIALIZATION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Şəhər
          </Label>
          <Select
            value={searchParams.get("seher") ?? "all"}
            onValueChange={(v) => updateFilter("seher", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bütün şəhərlər" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün şəhərlər</SelectItem>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-4" />

        {/* Minimum Rating */}
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Minimum reytinq
          </Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() =>
                  updateFilter("min_reytinq", currentMinRating === star ? "" : String(star))
                }
                className="p-0.5 transition-transform hover:scale-110"
                title={`${star} ulduz və yuxarı`}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= currentMinRating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-none text-gray-300 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
            {currentMinRating > 0 && (
              <span className="text-xs text-muted-foreground ml-1.5">
                {currentMinRating}+
              </span>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Years of Experience */}
        <div className="space-y-1.5 mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Təcrübə
          </Label>
          <Select
            value={searchParams.get("tecrube") ?? "all"}
            onValueChange={(v) => updateFilter("tecrube", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bütün səviyyələr" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün səviyyələr</SelectItem>
              {EXPERIENCE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-4" />

        {/* Verified Only */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <Label className="text-sm cursor-pointer" htmlFor="verified-toggle">
              Yalnız təsdiqlənmiş
            </Label>
          </div>
          <Switch
            id="verified-toggle"
            checked={searchParams.get("tesdiqlenib") === "true"}
            onCheckedChange={(checked) =>
              updateFilter("tesdiqlenib", checked ? "true" : "")
            }
          />
        </div>

        <Separator className="my-4" />

        {/* Availability */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Müsaidlik
          </Label>
          <div className="space-y-2">
            {[
              { value: "true", label: "Onlayn" },
              { value: "false", label: "Oflayn" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="radio"
                  name="musaid"
                  value={opt.value}
                  className="accent-primary"
                  checked={searchParams.get("musaid") === opt.value}
                  onChange={() => updateFilter("musaid", opt.value)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 font-heading font-semibold text-sm mb-3">
            <BookmarkCheck className="w-4 h-4 text-primary" />
            Saxlanılan Axtarışlar
          </div>
          <div className="space-y-1">
            {savedSearches.map((s) => (
              <div key={s.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => router.push(`${pathname}?${s.params}`)}
                  className="flex-1 text-left text-sm py-1.5 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {s.label}
                </button>
                <button
                  onClick={() => deleteSavedSearch(s.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick category links */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <p className="font-heading font-semibold text-sm mb-4">Kateqoriyalar</p>
        <div className="space-y-1">
          {Object.entries(SPECIALIZATION_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => updateFilter("ixtisas", value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                searchParams.get("ixtisas") === value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
