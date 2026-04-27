"use client";

import Link from "next/link";
import { FileText, ChevronRight, Mail } from "lucide-react";

const SECTIONS = [
  { id: "qəbul", title: "1. Şərtlərin Qəbulu" },
  { id: "hesab", title: "2. Hesab Qeydiyyatı" },
  { id: "xidmətlər", title: "3. Xidmətlər" },
  { id: "istifadəçi", title: "4. İstifadəçi Öhdəlikləri" },
  { id: "ödəniş", title: "5. Ödəniş Şərtləri" },
  { id: "məzmun", title: "6. Məzmun Siyasəti" },
  { id: "məsuliyyət", title: "7. Məsuliyyətin Məhdudlaşdırılması" },
  { id: "fəsih", title: "8. Hesabın Dayandırılması" },
  { id: "əlaqə", title: "9. Əlaqə" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">ArchiLink</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">İstifadə Şərtləri</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
              <FileText className="w-7 h-7 text-violet-300" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">İstifadə Şərtləri</h1>
              <p className="text-white/60 text-sm">Son yenilənmə: 15 Yanvar 2025</p>
            </div>
          </div>
          <p className="mt-6 text-white/70 text-base leading-relaxed max-w-2xl">
            Bu sənəd ArchiLink platformasından istifadə şərtlərini müəyyən edir. Platformadan istifadə etməklə bu şərtləri qəbul etmiş sayılırsınız.
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

            <section id="qəbul">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">1</span>
                Şərtlərin Qəbulu
              </h2>
              <p className="mb-3">ArchiLink platformasına daxil olmaqla və ya istifadə etməklə bu İstifadə Şərtlərini və Gizlilik Siyasətimizi qəbul etmiş sayılırsınız.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Vacib:</strong> Bu şərtləri qəbul etmirsinizsə, platformadan istifadə etməyi dayandırın.
                </p>
              </div>
            </section>

            <section id="hesab">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">2</span>
                Hesab Qeydiyyatı
              </h2>
              <p className="mb-4">Platforma xidmətlərindən tam istifadə etmək üçün hesab yaratmalısınız. Hesab yaradarkən:</p>
              <div className="space-y-2">
                {[
                  "Düzgün və dəqiq məlumat daxil etməlisiniz",
                  "18 yaşından yuxarı olmalısınız",
                  "Hər şəxs yalnız bir hesab yarada bilər",
                  "Hesab məlumatlarınızı (şifrə) gizli saxlamalısınız",
                  "Hesabınızdakı bütün fəaliyyətlərə görə məsuliyyət daşıyırsınız",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section id="xidmətlər">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">3</span>
                Xidmətlər
              </h2>
              <p className="mb-4">ArchiLink aşağıdakı xidmətləri təqdim edir:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { emoji: "👤", title: "Profil Yaratma", desc: "Memarlıq sahəsindəki peşəkarlar üçün peşəkar profil" },
                  { emoji: "📁", title: "Portfolio", desc: "Tamamlanmış layihələrin paylaşılması" },
                  { emoji: "🔍", title: "Axtarış", desc: "Müştərilərin memar tapması üçün axtarış sistemi" },
                  { emoji: "💬", title: "Mesajlaşma", desc: "Memar və müştəri arasında birbaşa əlaqə" },
                  { emoji: "📋", title: "Layihə Bazarı", desc: "Müştərilərin layihə elanı yerləşdirməsi" },
                  { emoji: "⭐", title: "Rəy Sistemi", desc: "Tamamlanan işlər üçün reytinq və rəylər" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="istifadəçi">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">4</span>
                İstifadəçi Öhdəlikləri
              </h2>
              <p className="mb-4">Platformadan istifadə edərkən aşağıdakılar qadağandır:</p>
              <div className="space-y-2">
                {[
                  "Yalan, yanıltıcı və ya saxta məlumat yerləşdirmək",
                  "Başqalarının hüquqlarını pozmaq (müəllif hüququ, ticarət markası və s.)",
                  "Spam, arzuolunmaz mesajlar göndərmək",
                  "Platformanın texniki infrastrukturuna hücum etmək",
                  "Qeyri-qanuni fəaliyyətlər üçün platformadan istifadə etmək",
                  "Digər istifadəçiləri aldatmaq və ya narahat etmək",
                  "Avtomatik botlar vasitəsilə məlumat toplamaq (scraping)",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
                    <span className="text-red-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="ödəniş">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">5</span>
                Ödəniş Şərtləri
              </h2>
              <p className="mb-4">ArchiLink hazırda pulsuz xidmət kimi fəaliyyət göstərir. Gələcəkdə premium funksiyalar əlavə olunarsa:</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800">
                  Premium funksiyaların qiymətləndirilməsi haqqında istifadəçilər ən azı 30 gün öncədən e-poçt vasitəsilə məlumatlandırılacaq.
                </p>
              </div>
            </section>

            <section id="məzmun">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">6</span>
                Məzmun Siyasəti
              </h2>
              <p className="mb-3">Platformaya yüklədiginiz bütün məzmuna görə siz məsuliyyət daşıyırsınız. Yüklədiyiniz şəkil, mətn, layihə kimi materiallar:</p>
              <div className="space-y-2">
                {[
                  ["✓", "emerald", "Həqiqi və sizə məxsus olmalıdır"],
                  ["✓", "emerald", "Başqalarının müəllif hüquqlarını pozmamalıdır"],
                  ["✓", "emerald", "Memarlıq/dizayn mövzusu ilə əlaqəli olmalıdır"],
                  ["✗", "red", "Zorakılıq, nifrət, diskriminasiya məzmunu daxil edilə bilməz"],
                  ["✗", "red", "Reklam məqsədli spam məzmun daxil edilə bilməz"],
                ].map(([sign, color, text]) => (
                  <div key={text} className={`flex items-start gap-2 text-sm p-3 rounded-lg bg-${color}-50 border border-${color}-100`}>
                    <span className={`text-${color}-500 font-bold shrink-0`}>{sign}</span>
                    <span className={`text-${color}-700`}>{text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="məsuliyyət">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">7</span>
                Məsuliyyətin Məhdudlaşdırılması
              </h2>
              <p className="mb-3">ArchiLink bir platforma olaraq memar və müştəri arasında vasitəçilik edir. Buna görə:</p>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-sm">
                <p>• ArchiLink memar və müştəri arasında bağlanan müqavilənin tərəfi deyil.</p>
                <p>• İstifadəçilər arasındakı mübahisələr üçün birbaşa məsuliyyət daşımırıq.</p>
                <p>• Üçüncü tərəflərin xidmətlərindən (ödəniş sistemləri, xəritə xidmətləri) irəli gələn problemlər üçün məsuliyyət daşımırıq.</p>
                <p>• Platformadakı məlumatların dəqiqliyi üçün istifadəçilər özləri məsuliyyət daşıyır.</p>
              </div>
            </section>

            <section id="fəsih">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">8</span>
                Hesabın Dayandırılması
              </h2>
              <p className="mb-3">Aşağıdakı hallarda hesabınız xəbərdarlıq olmadan dayandırıla bilər:</p>
              <div className="space-y-2">
                {[
                  "İstifadə şərtlərinin ciddi şəkildə pozulması",
                  "Saxta məlumat və ya identifikasiya",
                  "Digər istifadəçilərə qarşı ziyanverici fəaliyyət",
                  "Qeyri-qanuni fəaliyyətlər",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500">Hesabınızı özünüz silmək üçün Parametrlər bölməsindən istifadə edə bilərsiniz.</p>
            </section>

            <section id="əlaqə">
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">9</span>
                Əlaqə
              </h2>
              <div className="bg-gradient-to-br from-violet-500/5 to-primary/5 rounded-2xl border border-violet-100 p-6">
                <p className="text-sm text-slate-600 mb-4">Bu şərtlərlə bağlı suallarınız üçün:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">legal@archilink.az</p>
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
