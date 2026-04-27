import dns from "dns";
import { withSentryConfig } from "@sentry/nextjs";

// Force IPv4 DNS resolution process-wide — must be here (next.config.mjs)
// so it runs before any module is loaded or connection is attempted.
dns.setDefaultResultOrder("ipv4first");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "azerbaijan.travel" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  serverExternalPackages: ["bcryptjs", "@supabase/supabase-js"],
};

export default withSentryConfig(nextConfig, {
  org: "kg-y0",
  project: "javascript-nextjs",

  // Silent during builds
  silent: !process.env.CI,

  // Upload source maps to Sentry for readable stack traces
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Automatically instrument Next.js data fetching
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
});
