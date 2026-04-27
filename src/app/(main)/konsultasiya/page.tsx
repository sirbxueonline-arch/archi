import type { Metadata } from "next";
import {
  Search,
  CalendarDays,
  Video,
  Bell,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Konsultasiya Sifariş Et | ArchiLink",
  description:
    "Peşəkar memarlarla onlayn görüş keçirin. Layihənizi müzakirə edin, məsləhət alın.",
};

const steps = [
  {
    number: "01",
    title: "Memar seçin",
    description:
      "İxtisas, reytinq və portfolio əsasında özünüzə uyğun memarı tapın.",
    icon: Search,
    gradient: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    number: "02",
    title: "Vaxt seçin",
    description:
      "Memarın mövcud vaxtlarından sizə uyğun olanı seçin və rezerv edin.",
    icon: CalendarDays,
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    number: "03",
    title: "Görüş keçirin",
    description:
      "Video zəng vasitəsilə layihənizi müzakirə edin və peşəkar məsləhət alın.",
    icon: Video,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Tezliklə
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#111111] mb-4">
            Peşəkar Konsultasiya
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Memarlarla onlayn görüş keçirin. Layihənizi rahat şəkildə
            peşəkarlarla müzakirə edin.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-heading text-xl font-semibold text-[#111111] mb-2 text-center">
          Necə işləyir?
        </h2>
        <p className="text-muted-foreground text-center mb-10 text-sm">
          Üç sadə addımda peşəkar məsləhət alın
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-2xl border border-border p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Step number */}
              <div
                className={`absolute -top-3 left-6 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${step.gradient} text-white text-xs font-bold`}
              >
                {step.number}
              </div>

              <div
                className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mx-auto mt-3 mb-4`}
              >
                <step.icon className={`w-7 h-7 ${step.iconColor}`} />
              </div>

              <h3 className="font-heading font-semibold text-[#111111] text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connecting lines for desktop (decorative) */}
        <div className="hidden md:flex items-center justify-center gap-4 mt-3">
          <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
          <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      {/* Email Notification CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111111] via-slate-800 to-violet-900/80 p-8 sm:p-10 text-white text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-14 right-20 w-56 h-56 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
              Bildiriş al
            </h2>
            <p className="text-white/70 max-w-md mx-auto mb-6">
              Konsultasiya xidməti hazır olduqda sizə bildiriş göndərək.
              E-poçt ünvanınızı daxil edin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-poçt ünvanınız"
                className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#111111] font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/20 whitespace-nowrap">
                Bildiriş al
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
