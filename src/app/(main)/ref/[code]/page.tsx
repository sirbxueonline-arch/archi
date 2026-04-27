import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Users, Star, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArchiLink-ə dəvət olundunuz",
  description: "Azərbaycanın ən böyük memarlıq platformasına qoşulun. 500+ peşəkar memar.",
};

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ReferralLandingPage({ params }: PageProps) {
  const { code } = await params;

  const features = [
    { icon: Users, title: "500+ Peşəkar Memar", desc: "Azərbaycanın ən yaxşı memarları bir platformada" },
    { icon: Star, title: "Təsdiqlənmiş profillər", desc: "Hər memar ətraflı portfolio ilə təqdim olunur" },
    { icon: Zap, title: "0% Komissiya", desc: "Peşəkarlar qazandıqlarının hamısını alır" },
    { icon: CheckCircle, title: "Sürətli əlaqə", desc: "Birbaşa mesajlaşma və görüş planlaması" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20">
      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto px-6 py-6">
        <Link href="/">
          <img src="/logoemail.png" alt="ArchiLink" className="h-8 w-auto brightness-0 invert" />
        </Link>
        <Link href={`/giris`}>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            Giriş et
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center text-white">
        {/* Invite chip */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Sizi dəvət etdilər</span>
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-mono">{code}</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Azərbaycanın<br />
          <span className="text-primary">Memarlıq Platforması</span>
        </h1>
        <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
          Ən yaxşı memarlar, interyer dizaynerlər və landşaft memarları ilə əlaqə qurun. Layihənizi həyata keçirin.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href={`/qeydiyyat?ref=${code}`}>
            <Button size="lg" variant="gradient" className="gap-2 text-base px-8 py-6 shadow-xl shadow-primary/30">
              Qeydiyyatdan keç
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/memarlar">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-8 py-6">
              Memarlara bax
            </Button>
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {features.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            "ArchiLink vasitəsilə 2 həftə ərzində 3 potensial müştəri tapdım. Platforma çox rahat və peşəkardır."
          </p>
          <p className="text-xs text-white/40">— Kənan M., İnteryer Dizayner · Bakı</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/30">
        © 2026 ArchiLink · <Link href="/gizlilik" className="hover:text-white/60">Məxfilik</Link> · <Link href="/sertler" className="hover:text-white/60">Şərtlər</Link>
      </footer>
    </div>
  );
}
