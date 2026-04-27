"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** "dark" = black text (on white bg), "light" = white text (on dark bg) */
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: { ring: 22, dot: 5, text: "text-lg" },
  md: { ring: 28, dot: 6, text: "text-2xl" },
  lg: { ring: 36, dot: 8, text: "text-3xl" },
  xl: { ring: 48, dot: 10, text: "text-4xl" },
};

export function Logo({ className, variant = "dark", size = "md" }: LogoProps) {
  const { ring, dot, text } = sizes[size];
  const textColor = variant === "light" ? "#ffffff" : "#111111";
  const brandGreen = "#6DC9A8"; // matches the mint in the actual logo

  return (
    <Link href="/" className={cn("flex items-center gap-2 select-none", className)}>
      {/* Ring icon */}
      <svg width={ring} height={ring} viewBox="0 0 48 48" fill="none">
        {/* Outer ring arc — gap at ~4-5 o'clock (30°–70° in SVG coords) */}
        <path
          d="M30.5 41.86 A19 19 0 1 1 40.45 33.5"
          stroke={textColor}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Green dot — inside ring at ~7 o'clock */}
        <circle cx="16.5" cy="36.5" r={dot * 0.55} fill={brandGreen} />
      </svg>

      {/* Text */}
      <span className={cn("font-heading font-bold leading-none tracking-tight", text)} style={{ color: textColor }}>
        archi<span style={{ color: brandGreen }}>link</span>
      </span>
    </Link>
  );
}
