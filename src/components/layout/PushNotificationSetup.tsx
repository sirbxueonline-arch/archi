"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { requestPushPermission } from "@/lib/push";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CONSENT_KEY = "archilink_push_consent";

export function PushNotificationSetup() {
  const [showBanner, setShowBanner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth status
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!("Notification" in window)) return;

    // If user already made a decision, don't show the banner
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) return;

    // If browser already granted or denied, record it and skip banner
    if (Notification.permission === "granted") {
      localStorage.setItem(CONSENT_KEY, "granted");
      return;
    }
    if (Notification.permission === "denied") {
      localStorage.setItem(CONSENT_KEY, "denied");
      return;
    }

    // Show banner for "default" state
    setShowBanner(true);
  }, [isAuthenticated]);

  const handleAllow = async () => {
    setShowBanner(false);
    const granted = await requestPushPermission();
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  };

  const handleLater = () => {
    setShowBanner(false);
    // Don't set localStorage so user can be asked again on next session
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(CONSENT_KEY, "later");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-background border border-border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="text-xl shrink-0" aria-hidden>🔔</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">Bildirişlər üçün icazə verin</p>
          <p className="text-xs text-muted-foreground mt-0.5">Yeni mesaj və təkliflər barədə xəbər alın</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" className="h-8 text-xs px-3" onClick={handleAllow}>
            İcazə ver
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs px-3" onClick={handleLater}>
            Sonra
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors ml-1"
            aria-label="Bağla"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
