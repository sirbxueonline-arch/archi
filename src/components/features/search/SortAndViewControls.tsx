"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, List, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "uygun", label: "Ən uyğun" },
  { value: "reytinq", label: "Ən yüksək reytinq" },
  { value: "rey", label: "Ən çox rəy" },
  { value: "qiymet_asagi", label: "Ən aşağı qiymət" },
  { value: "qiymet_yuxari", label: "Ən yüksək qiymət" },
  { value: "yeni", label: "Ən yeni" },
];

export type ViewMode = "grid" | "list";

interface SortAndViewControlsProps {
  totalCount?: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function SortAndViewControls({
  totalCount,
  viewMode,
  onViewModeChange,
}: SortAndViewControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("siralama") ?? "uygun";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "uygun") {
      params.delete("siralama");
    } else {
      params.set("siralama", value);
    }
    params.delete("sehife");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        {totalCount !== undefined && (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCount}</span> nəticə
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title="Şəbəkə görünüşü"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title="Siyahı görünüşü"
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
