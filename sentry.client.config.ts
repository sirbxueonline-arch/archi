import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay captures 10% of all sessions, 100% on error
  integrations: [
    Sentry.replayIntegration(),
  ],

  tracesSampleRate: 0.1,        // 10% of transactions for performance
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // Always capture replay on error

  // Don't send errors in development
  enabled: process.env.NODE_ENV === "production",

  // Ignore common non-actionable errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Network request failed",
    "Failed to fetch",
    "ChunkLoadError",
    /^Loading chunk \d+ failed/,
  ],
});
