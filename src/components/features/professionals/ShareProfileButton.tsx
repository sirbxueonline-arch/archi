"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export function ShareProfileButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link kopyaland\u0131");
    } catch {
      toast.error("Link kopyalana bilm\u0259di");
    }
    setOpen(false);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Bu memar\u0131n profilin\u0259 bax\u0131n: ${currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen((o) => !o)}
      >
        <Share2 className="w-4 h-4" />
        Paylaş
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-border bg-white shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
          <button
            onClick={handleCopy}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
            Linki kopyala
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            WhatsApp il\u0259 payla\u015f
          </button>
        </div>
      )}
    </div>
  );
}
