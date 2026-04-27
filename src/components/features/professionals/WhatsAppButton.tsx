"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface WhatsAppButtonProps {
  phone: string;
}

export function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(Boolean(session));
      setReady(true);
    });
  }, []);

  if (!ready || !isSignedIn) return null;

  // Normalize phone: remove spaces, dashes; ensure starts with country code
  const normalized = phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const waUrl = `https://wa.me/${normalized}`;

  return (
    <a href={waUrl} target="_blank" rel="noopener noreferrer">
      <Button
        size="sm"
        className="gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white border-0"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </Button>
    </a>
  );
}
