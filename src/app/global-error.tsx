"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center">
            <h1 className="text-7xl font-bold text-red-500 mb-3">500</h1>
            <h2 className="text-2xl font-semibold mb-3">Xəta baş verdi</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Gözlənilməz bir xəta baş verdi. Komandamıza bildirilib.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-muted transition-colors"
              >
                Yenidən cəhd et
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors"
              >
                Ana Səhifəyə Qayıt
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
