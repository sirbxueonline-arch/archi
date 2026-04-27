"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface TrackViewProfile {
  username: string;
  name: string;
  specialization: string | null;
  avatarImage: string | null;
  city: string | null;
}

export function TrackView({ profile }: { profile: TrackViewProfile }) {
  useEffect(() => {
    try {
      // Recently viewed - localStorage only
      const key = "archilink_recently_viewed";
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = stored.filter((p: any) => p.username !== profile.username);
      filtered.unshift(profile);
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 6)));

      // Profile view counter — once per day per profile
      const viewKey = `archilink_view_${profile.username}_${new Date().toDateString()}`;
      if (!localStorage.getItem(viewKey)) {
        localStorage.setItem(viewKey, "1");
        // Increment in DB
        const supabase = createClient();
        supabase
          .from("profiles")
          .select("id, profileViews")
          .eq("username", profile.username)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.id) {
              supabase
                .from("profiles")
                .update({ profileViews: (data.profileViews ?? 0) + 1 })
                .eq("id", data.id)
                .then(() => {});
            }
          });
      }
    } catch {
      // localStorage not available
    }
  }, [profile.username]);

  return null;
}
