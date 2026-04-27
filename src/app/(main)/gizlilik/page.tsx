"use client";

import Link from "next/link";
import { Shield, ChevronRight, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const SECTIONS = [
  { id: "toplanan", title: "1. Toplanan Məlumatlar" },
  { id: "istifade", title: "2. Məlumatların İstifadəsi" },
  { id: "paylaşma", title: "3. Məlumatların Paylaşılması" },
  { id: "saxlama", title: "4. Məlumatların Saxlanması" },
  { id: "hüquqlar", title: "5. İstifadəçi Hüquqları" },
  { id: "cookies", title: "6. Kuki Faylları" },
  { id: "dəyişikliklər", title: "7. Siyasətin Dəyişdirilməsi" },
  { id: "əlaqə", title: "8. Bizimlə Əlaqə" },
];

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">ArchiLink</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">Gizlilik Siyasəti</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
              <Shield className="w-7 h-7 text-primary/50" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">Gizlilik Siyasəti</h1>
              <p className="text-white/60 text-sm">Son yenilənmə: 15 Yanvar 2025</p>
            </div>
          </div>
          <p className="mt-6 text-white/70 text-base leading-relaxed max-w-2xl">
            ArchiLink olaraq istifadəçilərimizin məxfiliyini qorumağı ən yüksək prioritet hesab edirik. Bu siyasət, platformamızda toplanan məlumatların necə işlənildiyini izah edir.
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

            <section id="toplanan">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                Toplanan Məlumatlar
              </h2>
              <p className="mb-3">ArchiLink platformasına qeydiyyatdan keçdikdə aşağıdakı məlumatları toplayırıq:</p>
              <ul className="space-y-2 pl-4">
                {[
                  "Ad, soyad və e-poçt ünvanı",
                  "Profil şəkli (ixtiyari)",
                  "Peşə məlumatları (ixtisas, təcrübə, portfelo)",
                  "Əlaqə məlumatları (telefon, veb sayt, sosial media)",
                  "Platforma istifadə məlumatları (log faylları, IP ünvanı)",
                  "Ödəniş məlumatları (şifrəli şəkildə)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section id="istifade">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                Məlumatların İstifadəsi
              </h2>
              <p className="mb-3">Topladığımız məlumatları aşağıdakı məqsədlər üçün istifadə edirik:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "Hesab idarəetməsi", desc: "Qeydiyyat, giriş və profil xidmətlərinin təmin edilməsi" },
                  { title: "Platforma funksiyaları", desc: "Mesajlaşma, layihə idarəetməsi və axtarış imkanları" },
                  { title: "Kommunikasiya", desc: "Bildirişlər, yenilik xəbərləri və dəstək mesajları" },
                  { title: "Təhlükəsizlik", desc: "Fırıldaqçılıq və sui-istifadə hallarının qarşısının alınması" },
                  { title: "Analitika", desc: "Platformanın inkişafı üçün istifadə statistikası" },
                  { title: "Hüquqi öhdəliklər", desc: "Qanunvericiliyin tələblərinə uyğun fəaliyyət" },
                ].map((item) => (
                  <div key={item.title} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="font-semibold text-sm text-slate-800 mb-1">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="paylaşma">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                Məlumatların Paylaşılması
              </h2>
              <p className="mb-4">Şəxsi məlumatlarınızı üçüncü tərəflərə satmırıq. Məlumatlarınızı yalnız aşağıdakı hallarda paylaşa bilərik:</p>
              <div className="space-y-3">
                {[
                  { label: "Xidmət təminatçıları", text: "Hosting, ödəniş emalı, e-poçt xidmətləri kimi texniki tərəfdaşlarımız." },
                  { label: "Hüquqi tələblər", text: "Məhkəmə qərarı və ya qanuni tələb olduqda müvafiq dövlət orqanlarına." },
                  { label: "Biznes transferi", text: "Şirkətin birləşmə və ya alınması halında yeni sahiblərə." },
                  { label: "Razılıqla", text: "Siz açıq razılıq verdikdə digər tərəflərə." },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3 p-4 rounded-xl border border-slate-100 bg-white">
                    <span className="font-semibold text-sm text-primary shrink-0 w-36">{item.label}</span>
                    <span className="text-sm text-slate-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="saxlama">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">4</span>
                Məlumatların Saxlanması
              </h2>
              <p className="mb-3">Məlumatlarınızı hesabınız aktiv olduğu müddətdə saxlayırıq. Hesabınızı silmək istədikdə bütün şəxsi məlumatlarınız 30 gün ərzində sistemimizdən silinəcək.</p>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-sm text-primary/80">
                  <strong>Qeyd:</strong> Bəzi məlumatlar maliyyə hesabatları üçün qanunvericiliyin tələb etdiyi müddət ərzində (adətən 5 il) saxlanıla bilər.
                </p>
              </div>
            </section>

            <section id="hüquqlar">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">5</span>
                İstifadəçi Hüquqları
              </h2>
              <p className="mb-4">Şəxsi məlumatlarınızla bağlı aşağıdakı hüquqlara sahibsiniz:</p>
              <div className="grid gap-2">
                {[
                  ["Giriş hüququ", "Saxladığımız məlumatlarınızın surətini tələb edə bilərsiniz"],
                  ["Düzəliş hüququ", "Yanlış məlumatların düzəldilməsini tələb edə bilərsiniz"],
                  ["Silinmə hüququ", "Məlumatlarınızın silinməsini tələb edə bilərsiniz"],
                  ["Məhdudlaşdırma hüququ", "Məlumatlarınızın işlənməsini müvəqqəti dayandıra bilərsiniz"],
                  ["Portabillik hüququ", "Məlumatlarınızı maşın oxunaqlı formatda ala bilərsiniz"],
                  ["Etiraz hüququ", "Məlumatlarınızın müəyyən məqsədlər üçün istifadəsinə etiraz edə bilərsiniz"],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="cookies">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">6</span>
                Kuki Faylları
              </h2>
              <p className="mb-3">Platformamız sessiya, funksionallıq və analitika kukiərindən istifadə edir. Daha ətraflı məlumat üçün <Link href="/kukiler" className="text-primary hover:underline font-medium">Kuki Siyasəti</Link> səhifəmizə baxın.</p>
            </section>

            <section id="dəyişikliklər">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">7</span>
                Siyasətin Dəyişdirilməsi
              </h2>
              <p>Bu Gizlilik Siyasəti zaman-zaman yenilənə bilər. Əhəmiyyətli dəyişikliklər olduqda sizi e-poçt vasitəsilə məlumatlandıracağıq. Dəyişikliyin tarixindən sonra platformadan istifadəniz yeni siyasəti qəbul etdiyiniz kimi qiymətləndiriləcək.</p>
            </section>

            <section id="əlaqə">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">8</span>
                Bizimlə Əlaqə
              </h2>
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-6">
                <p className="text-sm text-slate-600 mb-4">Gizlilik siyasəti ilə bağlı suallarınız üçün bizimlə əlaqə saxlaya bilərsiniz:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">privacy@archilink.az</p>
                    <p className="text-xs text-slate-500">24 saat ərzində cavab veririk</p>
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
