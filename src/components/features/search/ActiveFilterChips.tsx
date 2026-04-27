"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { SPECIALIZATION_LABELS, CITIES } from "@/lib/utils";

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  "1-3": "1-3 il",
  "3-5": "3-5 il",
  "5-10": "5-10 il",
  "10+": "10+ il",
};

export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: FilterChip[] = [];

  const axtaris = searchParams.get("axtaris");
  if (axtaris) chips.push({ key: "axtaris", label: "Axtarış", value: axtaris });

  const ixtisas = searchParams.get("ixtisas");
  if (ixtisas) chips.push({ key: "ixtisas", label: "İxtisas", value: SPECIALIZATION_LABELS[ixtisas] ?? ixtisas });

  const seher = searchParams.get("seher");
  if (seher) chips.push({ key: "seher", label: "Şəhər", value: seher });

  const qiymetMin = searchParams.get("qiymet_min");
  if (qiymetMin) chips.push({ key: "qiymet_min", label: "Min qiymət", value: `${qiymetMin} AZN` });

  const qiymetMax = searchParams.get("qiymet_max");
  if (qiymetMax) chips.push({ key: "qiymet_max", label: "Max qiymət", value: `${qiymetMax} AZN` });

  const minReytinq = searchParams.get("min_reytinq");
  if (minReytinq) chips.push({ key: "min_reytinq", label: "Reytinq", value: `${minReytinq}+` });

  const tecrube = searchParams.get("tecrube");
  if (tecrube) chips.push({ key: "tecrube", label: "Təcrübə", value: EXPERIENCE_LABELS[tecrube] ?? tecrube });

  const tesdiqlenib = searchParams.get("tesdiqlenib");
  if (tesdiqlenib === "true") chips.push({ key: "tesdiqlenib", label: "Təsdiqlənmiş", value: "Bəli" });

  const musaid = searchParams.get("musaid");
  if (musaid) chips.push({ key: "musaid", label: "Müsaidlik", value: musaid === "true" ? "Müsaid" : "Məşğul" });

  const siralama = searchParams.get("siralama");
  // Don't show sort as a chip - it's visible in the sort dropdown

  if (chips.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("sehife");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    // Preserve only siralama (sort)
    const params = new URLSearchParams();
    if (siralama) params.set("siralama", siralama);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-sm text-foreground"
        >
          <span className="text-muted-foreground text-xs">{chip.label}:</span>
          <span className="font-medium">{chip.value}</span>
          <button
            onClick={() => removeFilter(chip.key)}
            className="ml-0.5 p-0.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={`${chip.label} filtri sil`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-1"
        >
          Hamısını təmizlə
        </button>
      )}
    </div>
  );
}
