"use client";

import { createContext, useContext } from "react";
import type { ViewMode } from "./SortAndViewControls";

export const ViewModeContext = createContext<ViewMode>("grid");

export function useViewMode() {
  return useContext(ViewModeContext);
}
