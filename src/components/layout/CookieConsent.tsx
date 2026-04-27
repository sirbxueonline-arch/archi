"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "archilink_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-border rounded-2xl shadow-premium p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Bu sayt təcrübənizi yaxşılaşdırmaq üçün kukilərdən istifadə edir.
          Saytımızdan istifadə etməyə davam etməklə{" "}
          <span className="font-medium text-foreground">kuki siyasətimizi</span>{" "}
          qəbul etmiş olursunuz.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Rədd et
          </Button>
          <Button variant="gradient" size="sm" onClick={handleAccept}>
            Qəbul et
          </Button>
        </div>
      </div>
    </div>
  );
}
