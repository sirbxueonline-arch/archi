"use client";

import Link from "next/link";
import { Cookie, ChevronRight, Mail, Settings } from "lucide-react";

const SECTIONS = [
  { id: "ne-dir", title: "1. Kuki Nədir?" },
  { id: "novleri", title: "2. Kuki Növləri" },
  { id: "istifade", title: "3. Necə İstifadə Edirik?" },
  { id: "ucuncu", title: "4. Üçüncü Tərəf Kukiləri" },
  { id: "idareetme", title: "5. Kukiləri İdarə Etmək" },
  { id: "deyisiklik", title: "6. Siyasətin Dəyişdirilməsi" },
  { id: "elaqe", title: "7. Əlaqə" },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">ArchiLink</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">Kuki Siyasəti</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
              <Cookie className="w-7 h-7 text-primary/50" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">Kuki Siyasəti</h1>
              <p className="text-white/60 text-sm">Son yenilənmə: 15 Yanvar 2025</p>
            </div>
          </div>
          <p className="mt-6 text-white/70 text-base leading-relaxed max-w-2xl">
            Bu sənəd ArchiLink platformasının veb-saytında kukilərin necə istifadə edildiyi barədə məlumat verir.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">

          {/* Sticky ToC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">İçindəkilər</p>
              <nav className="space-y-1">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-slate-500 hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-10 text-slate-700 leading-relaxed">

            <section id="ne-dir">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                Kuki Nədir?
              </h2>
              <p className="mb-3">Kuki (cookie) — veb-saytın sizin cihazınıza (kompüter, telefon, planşet) yerləşdirdiyi kiçik mətn faylıdır. Kukiler saytın düzgün işləməsinə, sizin üstünlüklərinizin yadda saxlanmasına və istifadə təcrübənizin yaxşılaşdırılmasına kömək edir.</p>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-sm text-primary/80">
                  Kukiler heç bir zərərli proqram deyil — onlar sadəcə saytın sizinlə "tanışlığını" saxlayan məlumat parçacıqlarıdır.
                </p>
              </div>
            </section>

            <section id="novleri">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                Kuki Növləri
              </h2>
              <p className="mb-4">ArchiLink aşağıdakı kuki növlərindən istifadə edir:</p>
              <div className="space-y-3">
                {[
                  {
                    color: "blue",
                    title: "Zəruri Kukiler",
                    desc: "Saytın əsas funksiyaları üçün mütləq lazımdır. Giriş sessiyaları, təhlükəsizlik tokenleri və dil seçimləri bu qrupa daxildir. Bu kukilər deaktiv edilə bilməz.",
                  },
                  {
                    color: "emerald",
                    title: "Funksional Kukiler",
                    desc: "Sizin üstünlüklərinizi (dil, görünüş parametrləri) yadda saxlayır. Bu kukiler olmadan hər ziyarətdə parametrlərinizi yenidən qurmaq lazım gələcək.",
                  },
                  {
                    color: "amber",
                    title: "Analitik Kukiler",
                    desc: "Saytın necə istifadə edildiyini başa düşmək üçün anonim statistika toplayır. Bu məlumatlar saytı daha yaxşı etmək üçün istifadə olunur.",
                  },
                  {
                    color: "slate",
                    title: "Üçüncü Tərəf Kukiləri",
                    desc: "Google Maps, ödəniş sistemləri kimi xarici xidmətlərin kukiləri. Bu kukilər müvafiq xidmətlərin siyasətinə tabedir.",
                  },
                ].map((item) => (
                  <div key={item.title} className={`p-4 rounded-xl bg-${item.color}-50 border border-${item.color}-100`}>
                    <p className={`font-semibold text-sm text-${item.color}-800 mb-1`}>{item.title}</p>
                    <p className={`text-xs text-${item.color}-700`}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="istifade">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                Necə İstifadə Edirik?
              </h2>
              <p className="mb-4">ArchiLink-də kukilər aşağıdakı məqsədlər üçün istifadə edilir:</p>
              <div className="space-y-2">
                {[
                  "Hesabınıza giriş sessiyasını aktiv saxlamaq",
                  "Seçdiyiniz dili (AZ, EN, RU) yadda saxlamaq",
                  "Axtarış filtrlərinizi və üstünlüklərinizi qorumaq",
                  "Saytın hansı hissələrinin daha çox istifadə edildiyini anlamaq",
                  "Xəritə xidmətlərinin düzgün işləməsini təmin etmək",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section id="ucuncu">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">4</span>
                Üçüncü Tərəf Kukiləri
              </h2>
              <p className="mb-4">Platformamız aşağıdakı xarici xidmətlərdən istifadə edir ki, bunlar da öz kukilərini yerləşdirə bilər:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: "Google Maps", desc: "Memar yerləşmə xəritəsi üçün" },
                  { name: "Supabase", desc: "Autentifikasiya və verilənlər bazası" },
                  { name: "Vercel Analytics", desc: "Performans monitorinqi" },
                  { name: "Stripe / ödəniş", desc: "Gələcək premium ödənişlər üçün" },
                ].map((item) => (
                  <div key={item.name} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500">Bu xidmətlərin kuki siyasəti onların öz saytlarında mövcuddur.</p>
            </section>

            <section id="idareetme">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">5</span>
                Kukiləri İdarə Etmək
              </h2>
              <p className="mb-4">Kukiləri brauzerinizin parametrləri vasitəsilə idarə edə və ya silə bilərsiniz:</p>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-sm">
                <p>• <strong>Chrome:</strong> Parametrlər → Gizlilik → Kukiler</p>
                <p>• <strong>Firefox:</strong> Parametrlər → Gizlilik → Kuki idarəetməsi</p>
                <p>• <strong>Safari:</strong> Parametrlər → Gizlilik → Veb-sayt məlumatlarını idarə et</p>
                <p>• <strong>Edge:</strong> Parametrlər → Kukiler və sayt icazələri</p>
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Diqqət:</strong> Zəruri kukiləri deaktiv etsəniz, platforma düzgün işləməyə bilər. Giriş sessiyaları pozula bilər.
                </p>
              </div>
            </section>

            <section id="deyisiklik">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">6</span>
                Siyasətin Dəyişdirilməsi
              </h2>
              <p className="mb-3">Bu Kuki Siyasəti vaxtaşırı yenilənə bilər. Əhəmiyyətli dəyişikliklər baş verdikdə:</p>
              <div className="space-y-2">
                {[
                  "Saytda bildiriş göstəriləcək",
                  "Qeydiyyatlı istifadəçilərə e-poçt göndəriləcək",
                  "Siyasətin yuxarı hissəsindəki tarix yenilənəcək",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section id="elaqe">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">7</span>
                Əlaqə
              </h2>
              <div className="bg-gradient-to-br from-primary/5 to-teal-50 rounded-2xl border border-primary/10 p-6">
                <p className="text-sm text-slate-600 mb-4">Kuki siyasəti ilə bağlı suallarınız üçün:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">privacy@archilink.az</p>
                    <p className="text-xs text-slate-500">İş günlərində 24 saat ərzində cavab veririk</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
