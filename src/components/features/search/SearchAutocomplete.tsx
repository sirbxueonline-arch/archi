"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { SPECIALIZATION_LABELS, getInitials } from "@/lib/utils";

interface Suggestion {
  id: string;
  username: string | null;
  specialization: string | null;
  city: string | null;
  avatarImage: string | null;
  user: { name: string | null; image: string | null } | null;
}

interface SearchAutocompleteProps {
  /** Placeholder text */
  placeholder?: string;
  /** Additional class for the outer wrapper */
  className?: string;
  /** Input class override */
  inputClassName?: string;
  /** When true, pressing Enter navigates to /memarlar?axtaris=... */
  navigateOnEnter?: boolean;
  /** Initial value */
  defaultValue?: string;
  /** Called when the value changes (for controlled usage) */
  onValueChange?: (value: string) => void;
}

export function SearchAutocomplete({
  placeholder = "Memar axtar...",
  className = "",
  inputClassName = "",
  navigateOnEnter = true,
  defaultValue = "",
  onValueChange,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const pattern = `%${searchTerm}%`;

      const { data } = await supabase
        .from("profiles")
        .select(`
          id, username, specialization, city, avatarImage,
          user:users!userId!inner(name, image, role)
        `)
        .eq("users.role", "professional")
        .or(`city.ilike.${pattern},specialization.ilike.${pattern},bio.ilike.${pattern},tagline.ilike.${pattern}`)
        .limit(5);

      // Also search by user name
      const { data: nameResults } = await supabase
        .from("profiles")
        .select(`
          id, username, specialization, city, avatarImage,
          user:users!userId!inner(name, image, role)
        `)
        .eq("users.role", "professional")
        .ilike("users.name", pattern)
        .limit(5);

      // Merge and deduplicate
      const allResults = [...(data ?? []), ...(nameResults ?? [])];
      const seen = new Set<string>();
      const unique = allResults.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });

      setSuggestions(unique.slice(0, 5) as unknown as Suggestion[]);
      setIsOpen(unique.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onValueChange?.(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const navigateToProfile = (username: string | null) => {
    if (!username) return;
    setIsOpen(false);
    router.push(`/memarlar/${username}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && navigateOnEnter) {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
          router.push(`/memarlar?axtaris=${encodeURIComponent(trimmed)}`);
        } else {
          router.push("/memarlar");
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          navigateToProfile(suggestions[activeIndex].username);
        } else if (navigateOnEnter) {
          setIsOpen(false);
          const trimmed = query.trim();
          if (trimmed) {
            router.push(`/memarlar?axtaris=${encodeURIComponent(trimmed)}`);
          } else {
            router.push("/memarlar");
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition ${inputClassName}`}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-border shadow-lg overflow-hidden">
          <ul role="listbox" className="py-1">
            {suggestions.map((s, idx) => {
              const name = s.user?.name ?? "İsimsiz";
              const avatar = s.avatarImage ?? s.user?.image;
              return (
                <li
                  key={s.id}
                  id={`suggestion-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    idx === activeIndex
                      ? "bg-primary/5 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => navigateToProfile(s.username)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-bold text-xs">
                        {getInitials(name)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.specialization
                        ? SPECIALIZATION_LABELS[s.specialization] ?? s.specialization
                        : ""}
                      {s.specialization && s.city ? " · " : ""}
                      {s.city ?? ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
