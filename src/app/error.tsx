"use client";

import Link from "next/link";
import { Building2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-red-500/40" />
        </div>
        <h1 className="font-heading text-7xl font-bold text-red-500 mb-3">
          500
        </h1>
        <h2 className="font-heading text-2xl font-semibold mb-3">
          Xəta baş verdi
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Gözlənilməz bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin və
          ya bizimlə{" "}
          <Link href="/elaqe" className="text-primary underline underline-offset-2">
            əlaqə saxlayın
          </Link>
          .
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Yenidən cəhd et
          </Button>
          <Link href="/">
            <Button variant="gradient" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Ana Səhifəyə Qayıt
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
