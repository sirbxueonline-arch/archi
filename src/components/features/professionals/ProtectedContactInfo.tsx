"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Phone, Instagram, Linkedin, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface ProtectedContactInfoProps {
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  variant?: "inline" | "list";
}

export function ProtectedContactInfo({
  phone,
  website,
  instagram,
  linkedin,
  variant = "list",
}: ProtectedContactInfoProps) {
  const pathname = usePathname();
  const [sessionKnown, setSessionKnown] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const hasAnyContact = useMemo(
    () => Boolean(phone || website || instagram || linkedin),
    [phone, website, instagram, linkedin]
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(Boolean(session));
      setSessionKnown(true);
    });
  }, []);

  if (!hasAnyContact) return null;
  if (!sessionKnown) return null;

  const signInHref = `/giris?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  if (!isSignedIn) {
    if (variant === "inline") {
      return (
        <div className="mt-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            Əlaqə məlumatlarını görmək üçün{" "}
            <Link href={signInHref} className="text-primary hover:underline font-medium">
              daxil olun
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span className="blur-sm select-none">https://example.com</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span className="blur-sm select-none">+994 50 000 00 00</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Instagram className="w-4 h-4" />
            <span className="blur-sm select-none">@username</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Linkedin className="w-4 h-4" />
            <span className="blur-sm select-none">linkedin-profile</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Əlaqə məlumatlarını görmək üçün{" "}
          <Link href={signInHref} className="text-primary hover:underline font-medium">
            daxil olun
          </Link>
          .
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        {instagram && (
          <a
            href={`https://instagram.com/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Instagram className="w-4 h-4" />@{instagram}
          </a>
        )}
        {linkedin && (
          <a
            href={`https://linkedin.com/in/${linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            {linkedin}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Globe className="w-4 h-4" />
          Veb sayt
        </a>
      )}
      {phone && (
        <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          {phone}
        </span>
      )}
      {instagram && (
        <a
          href={`https://instagram.com/${instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Instagram className="w-4 h-4" />
          @{instagram}
        </a>
      )}
      {linkedin && (
        <a
          href={`https://linkedin.com/in/${linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          {linkedin}
        </a>
      )}
    </div>
  );
}
