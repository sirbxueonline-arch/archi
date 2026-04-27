"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight } from "lucide-react";
import { SPECIALIZATION_LABELS, getInitials } from "@/lib/utils";

interface RecentProfile {
  username: string;
  name: string;
  specialization: string | null;
  avatarImage: string | null;
  city: string | null;
}

export function RecentlyViewed() {
  const [profiles, setProfiles] = useState<RecentProfile[]>([]);

  useEffect(() => {
    try {
      const key = "archilink_recently_viewed";
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      setProfiles(stored);
    } catch {
      // localStorage may not be available
    }
  }, []);

  if (profiles.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-heading font-semibold text-sm">Son baxılanlar</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {profiles.map((profile) => (
          <Link
            key={profile.username}
            href={`/memarlar/${profile.username}`}
            className="flex-shrink-0 w-[140px] group"
          >
            <div className="bg-white rounded-xl border border-border p-3 text-center hover:shadow-md hover:border-primary/20 transition-all duration-200">
              <div className="w-14 h-14 rounded-full mx-auto mb-2 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                {profile.avatarImage ? (
                  <Image
                    src={profile.avatarImage}
                    alt={profile.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-heading font-bold text-primary">
                    {getInitials(profile.name)}
                  </span>
                )}
              </div>
              <p className="font-medium text-xs truncate">{profile.name}</p>
              {profile.specialization && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {SPECIALIZATION_LABELS[profile.specialization] ?? profile.specialization}
                </p>
              )}
              {profile.city && (
                <p className="text-[10px] text-muted-foreground truncate">
                  {profile.city}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
