"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck, Trash2, ChevronDown } from "lucide-react";

const STORAGE_KEY = "archilink_saved_searches";

interface SavedSearch {
  label: string;
  params: string;
}

function buildLabel(params: URLSearchParams): string {
  const parts: string[] = [];
  const ixtisas = params.get("ixtisas");
  const seher = params.get("seher");
  const axtaris = params.get("axtaris");
  if (ixtisas) parts.push(ixtisas);
  if (seher) parts.push(seher);
  if (axtaris) parts.push(`"${axtaris}"`);
  return parts.length > 0 ? parts.join(" · ") : "Axtarış";
}

function hasActiveFilters(params: URLSearchParams): boolean {
  return !!(params.get("ixtisas") || params.get("seher") || params.get("axtaris"));
}

export function SavedSearches() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as SavedSearch[]);
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFilters = hasActiveFilters(searchParams);

  const handleSave = () => {
    if (!activeFilters) return;

    const paramsString = searchParams.toString();
    const label = buildLabel(searchParams);

    // Avoid duplicates
    const alreadyExists = saved.some((s) => s.params === paramsString);
    if (alreadyExists) {
      setOpen(true);
      return;
    }

    const updated: SavedSearch[] = [{ label, params: paramsString }, ...saved].slice(0, 5);
    setSaved(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    setOpen(true);
  };

  const handleDelete = (index: number) => {
    const updated = saved.filter((_, i) => i !== index);
    setSaved(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleRestore = (params: string) => {
    router.push(`/memarlar?${params}`);
    setOpen(false);
  };

  const isSavedAlready =
    activeFilters && saved.some((s) => s.params === searchParams.toString());

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        {/* Bookmark / save button */}
        <button
          onClick={handleSave}
          disabled={!activeFilters}
          title={
            !activeFilters
              ? "Saxlamaq üçün əvvəlcə filtr seçin"
              : isSavedAlready
              ? "Bu axtarış artıq saxlanılıb"
              : "Bu axtarışı saxla"
          }
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
            isSavedAlready || justSaved
              ? "bg-primary/10 border-primary/30 text-primary"
              : activeFilters
              ? "bg-white border-border text-muted-foreground hover:border-primary hover:text-primary"
              : "bg-muted border-border text-muted-foreground opacity-50 cursor-not-allowed"
          }`}
        >
          {isSavedAlready || justSaved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {justSaved ? "Saxlanıldı!" : "Saxla"}
          </span>
        </button>

        {/* Dropdown toggle — only show if there are saved searches */}
        {saved.length > 0 && (
          <button
            onClick={() => setOpen((prev) => !prev)}
            title="Saxlanılmış axtarışlar"
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-border bg-white text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all duration-150"
          >
            <span className="hidden sm:inline text-xs font-medium">
              {saved.length}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Dropdown panel */}
      {open && saved.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-2xl shadow-premium z-40 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Saxlanılmış axtarışlar
            </p>
          </div>
          <ul className="divide-y divide-border max-h-64 overflow-y-auto">
            {saved.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                <button
                  onClick={() => handleRestore(s.params)}
                  className="flex-1 text-left text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
                >
                  {s.label}
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  title="Sil"
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-0.5 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
          {saved.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Hələ heç nə saxlanılmayıb
            </p>
          )}
        </div>
      )}
    </div>
  );
}
