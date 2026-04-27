import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { PushNotificationSetup } from "@/components/layout/PushNotificationSetup";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Manrope — close visual match to Adobe Clean (Behance's headline font).
// Geometric sans with full weight range and latin-ext for Azerbaijani.
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ArchiLink – Azərbaycanın Memarlıq Platforması",
    template: "%s | ArchiLink",
  },
  description:
    "Azərbaycanın aparıcı memarlıq və dizayn platforması. Memarlar, dizaynerlər, studiyalar və müştərilər üçün professional şəbəkə.",
  keywords: [
    "memar",
    "memarlıq",
    "dizayn",
    "interyer",
    "landşaft",
    "Azərbaycan",
    "Bakı",
    "portfolio",
  ],
  authors: [{ name: "ArchiLink" }],
  creator: "ArchiLink",
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "ArchiLink – Azərbaycanın Memarlıq Platforması",
    description:
      "Azərbaycanın aparıcı memarlıq və dizayn platforması.",
    siteName: "ArchiLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchiLink",
    description: "Azərbaycanın aparıcı memarlıq və dizayn platforması.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-868406741"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-868406741');
            function gtag_report_conversion(url) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              gtag('event', 'conversion', {
                'send_to': 'AW-868406741/deWFCP7y-o4cENWri54D',
                'transaction_id': '',
                'event_callback': callback
              });
              return false;
            }
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased bg-background`}
      >
        <Providers>
          {children}
          <Toaster />
          <CookieConsent />
          <PushNotificationSetup />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
