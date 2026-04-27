"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { SortAndViewControls, type ViewMode } from "./SortAndViewControls";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { ViewModeContext } from "./ViewModeContext";

interface ResultsToolbarProps {
  totalCount?: number;
  children: ReactNode;
}

export function ResultsToolbar({ totalCount, children }: ResultsToolbarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("archilink_view_mode");
      if (stored === "grid" || stored === "list") {
        setViewMode(stored);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("archilink_view_mode", mode);
    } catch {}
  };

  return (
    <ViewModeContext.Provider value={viewMode}>
      <ActiveFilterChips />
      <SortAndViewControls
        totalCount={totalCount}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      {children}
    </ViewModeContext.Provider>
  );
}
