import type { Metadata } from "next";

export const dynamic = "force-dynamic"; // always fetch fresh counts from Supabase
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/features/home/HeroSection";
import { FeaturedProfessionals } from "@/components/features/home/FeaturedProfessionals";
import { FeaturedProjects } from "@/components/features/home/FeaturedProjects";
import { HowItWorks } from "@/components/features/home/HowItWorks";
import { FeaturedMarketplace } from "@/components/features/home/FeaturedMarketplace";
import { AboutSection } from "@/components/features/home/AboutSection";
import { WhyArchiLink } from "@/components/features/home/WhyArchiLink";
import { CtaSection } from "@/components/features/home/CtaSection";

export const metadata: Metadata = {
  title: "ArchiLink – Azərbaycanın Memar Platforması",
  description: "Azərbaycanın ən yaxşı memarları, interyer dizaynerləri və dizayn studiyaları ilə tanış olun. Portfolio, layihə bazarı və daha çox.",
  openGraph: {
    title: "ArchiLink – Azərbaycanın Memar Platforması",
    description: "Azərbaycanın ən yaxşı memarları ilə əlaqə saxlayın.",
    type: "website",
  },
};

export default async function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ArchiLink",
    url: "https://archilink.az",
    description: "Azərbaycanın memarlıq və dizayn platforması",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bakı",
      addressCountry: "AZ",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        {/* 1. Entry — hero */}
        <HeroSection />

        {/* 2. Visual showcase — projects + architects on top */}
        <FeaturedProjects />
        <FeaturedProfessionals />

        {/* 3. Explanation — what ArchiLink is + who it's for */}
        <AboutSection />

        {/* 4. Why us — value props */}
        <WhyArchiLink />

        {/* 5. How the platform works */}
        <HowItWorks />

        {/* 6. Active jobs from clients */}
        <FeaturedMarketplace />

        {/* 7. Final CTA */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
