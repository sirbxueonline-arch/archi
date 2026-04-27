import type { Metadata } from "next";
import {
  Layers,
  Lightbulb,
  Sofa,
  Paintbrush,
  Droplets,
  Zap,
  ArrowRight,
  Store,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tikinti Materialları | ArchiLink",
  description:
    "Layihəniz üçün ən yaxşı tikinti materiallarını tapın. Döşəmə, işıqlandırma, mebel, boya, santexnika və daha çox.",
};

const categories = [
  {
    name: "Döşəmə",
    subtitle: "Flooring",
    icon: Layers,
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
  },
  {
    name: "İşıqlandırma",
    subtitle: "Lighting",
    icon: Lightbulb,
    gradient: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-50",
  },
  {
    name: "Mebel",
    subtitle: "Furniture",
    icon: Sofa,
    gradient: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
  },
  {
    name: "Boya və Örtüklər",
    subtitle: "Paint & Coatings",
    icon: Paintbrush,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    name: "Santexnika",
    subtitle: "Plumbing",
    icon: Droplets,
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
  },
  {
    name: "Elektrik",
    subtitle: "Electrical",
    icon: Zap,
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
  },
];

export default function MateriallarPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Tezliklə
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#111111] mb-4">
            Tikinti Materialları
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Layihəniz üçün ən yaxşı materiallar. Etibarlı satıcılardan keyfiyyətli
            məhsullar, bir platformada.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-heading text-xl font-semibold text-[#111111] mb-6">
          Kateqoriyalar
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Gradient accent strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.gradient}`}
              />

              <div
                className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-4`}
              >
                <cat.icon className="w-6 h-6 text-[#111111]/70" />
              </div>

              <h3 className="font-heading font-semibold text-[#111111] text-lg mb-1">
                {cat.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {cat.subtitle}
              </p>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                Tezliklə...
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Become a Seller CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111111] via-slate-800 to-[#0D9488]/80 p-8 sm:p-10 text-white text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-14 right-20 w-56 h-56 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Store className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
              Satıcı ol
            </h2>
            <p className="text-white/70 max-w-md mx-auto mb-6">
              Tikinti materiallarınızı minlərlə memar və müştəriyə çatdırın.
              ArchiLink bazarında yerinizi tutun.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#111111] font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-black/20">
              Müraciət et
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
