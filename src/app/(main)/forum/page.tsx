import type { Metadata } from "next";
import {
  Building2,
  Palette,
  Hammer,
  Briefcase,
  Lock,
  MessageCircle,
  Users,
  Bell,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Memarlıq Forumu | ArchiLink",
  description:
    "Azərbaycanın memarlıq icması üçün forum. Memarlıq trendləri, interyer dizayn, tikinti materialları və karyera məsləhətləri haqqında müzakirələrə qoşulun.",
};

const CATEGORIES = [
  {
    title: "Memarlıq Trendləri",
    description:
      "Müasir memarlıq yanaşmaları, davamlı dizayn və innovativ texnologiyalar haqqında müzakirələr.",
    icon: Building2,
    topics: 24,
    color: "from-teal-500 to-emerald-600",
  },
  {
    title: "İnteryer Dizayn",
    description:
      "Rəng palitrasından mebel seçiminə qədər interyer dizaynın bütün aspektləri.",
    icon: Palette,
    topics: 18,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Tikinti Materialları",
    description:
      "Yeni materiallar, keyfiyyət standartları və təchizatçılar haqqında təcrübə mübadiləsi.",
    icon: Hammer,
    topics: 15,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Karyera Məsləhətləri",
    description:
      "Peşəkar inkişaf, portfolyo hazırlığı və iş bazarı haqqında faydalı məlumatlar.",
    icon: Briefcase,
    topics: 12,
    color: "from-sky-500 to-blue-600",
  },
];

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            Memarlıq Forumu
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Azərbaycanın ən böyük memarlıq icmasına qoşulun. Fikirlərinizi
            bölüşün, suallarınızı verin və peşəkarlardan öyrənin.
          </p>
          <div className="flex items-center gap-6 mt-8 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              1,200+ üzv
            </span>
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              350+ müzakirə
            </span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="relative rounded-2xl border border-border bg-white overflow-hidden group"
              >
                {/* Locked overlay */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
                    <Lock className="w-4 h-4" />
                    Tezliklə...
                  </div>
                </div>

                <div className="p-6 flex gap-5">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-lg font-bold text-slate-900">
                        {category.title}
                      </h3>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-3">
                      {category.description}
                    </p>
                    <span className="text-xs text-slate-400 font-medium">
                      {category.topics} mövzu gözlənilir
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA — Get Notified */}
        <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D9488]/10 flex items-center justify-center mx-auto mb-5">
            <Bell className="w-7 h-7 text-[#0D9488]" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Forum tezliklə açılacaq!
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-8">
            İlk müzakirələrdən xəbərdar olmaq üçün e-poçt ünvanınızı qeyd edin.
            Forum açılan kimi sizə bildiriş göndərəcəyik.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-poçt ünvanınız"
              className="flex-1 px-5 py-3 rounded-xl border border-border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
              disabled
            />
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] text-white font-semibold text-sm hover:bg-[#0D9488]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Bildiriş al
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
