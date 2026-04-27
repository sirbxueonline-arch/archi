"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";

const LOCALES: { value: Locale; label: string; flagCode: string }[] = [
  { value: "az", label: "Azərbaycan", flagCode: "az" },
  { value: "en", label: "English", flagCode: "gb" },
  { value: "ru", label: "Русский", flagCode: "ru" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/${current.flagCode}.svg`}
          alt={current.label}
          width={22}
          height={16}
          className="rounded object-cover shadow-sm"
        />
        <span className="text-[11px] font-bold tracking-wide">{current.value.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-popover border border-border rounded-xl shadow-xl py-1.5 z-50">
          {LOCALES.map((l) => (
            <button
              key={l.value}
              onClick={() => { setLocale(l.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${
                locale === l.value ? "text-primary font-semibold" : "text-foreground"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/${l.flagCode}.svg`}
                alt={l.label}
                width={26}
                height={18}
                className="rounded object-cover shadow-sm flex-shrink-0"
              />
              {l.label}
              {locale === l.value && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
