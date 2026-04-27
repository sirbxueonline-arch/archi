import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Users,
  Star,
  Briefcase,
  ShieldCheck,
  Lightbulb,
  Award,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Haqqımızda | ArchiLink",
  description:
    "ArchiLink - Azərbaycanın memar və dizaynerlərini müştərilərlə birləşdirən platforma.",
};

const OFFERINGS = [
  {
    icon: Users,
    title: "Peşəkar Profillər",
    description:
      "Azərbaycanın ən yaxşı memar və dizaynerləri bir platformada. Hər peşəkarın detallı profili, ixtisas sahəsi, təcrübəsi və əlaqə məlumatları mövcuddur.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Briefcase,
    title: "Portfolio Vitrinası",
    description:
      "Memarlar tamamladıqları layihələri rəsmi portfolio kimi təqdim edə bilir. Müştərilər işin keyfiyyətini öncəki layihələr əsasında qiymətləndirə bilir.",
    color: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    icon: Building2,
    title: "Layihə Bazarı",
    description:
      "Müştərilər layihə elanı yerləşdirərək uyğun memar tapa bilir. Memarlar isə maraqlandıqları elanlarla əlaqə saxlayaraq yeni müştərilər qazana bilir.",
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Etibar",
    description:
      "Platforma üzərindəki hər professional həqiqi məlumatları ilə qeydiyyatdan keçir. Müştəri rəyləri və reytinqlər şəffaf şəkildə paylaşılır.",
    color: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    icon: Award,
    title: "Keyfiyyət",
    description:
      "Platformada yalnız peşəkar memar və dizaynerlərin profili yer alır. Portfolio keyfiyyəti və müştəri məmnuniyyəti ön planda tutulur.",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Lightbulb,
    title: "İnnovasiya",
    description:
      "Azərbaycanda memarlıq sektoru üçün rəqəmsal çevrilməni sürətləndiririk. Platforma daim yeni funksiyalar və imkanlarla inkişaf edir.",
    color: "bg-rose-100",
    iconColor: "text-rose-600",
  },
];

const STATS = [
  { value: "500+", label: "Qeydiyyatdan keçmiş professional" },
  { value: "1200+", label: "Tamamlanmış layihə" },
  { value: "50+", label: "Şəhər üzrə əhatə" },
  { value: "4.8★", label: "Orta istifadəçi reytinqi" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              ArchiLink
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">Haqqımızda</span>
          </div>
          <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
              <Building2 className="w-7 h-7 text-violet-300" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
                ArchiLink Haqqında
              </h1>
              <p className="text-white/60 text-sm">
                Azərbaycanın memar platforması
              </p>
            </div>
          </div>
          <p className="text-white/75 text-lg leading-relaxed max-w-2xl">
            ArchiLink Azərbaycanın ən istedadlı memar və dizaynerlərini
            müştərilərlə birləşdirən rəqəmsal platformadır. Biz memarlıq
            sektorunda şəffaflığı, keyfiyyəti və əlçatanlığı artırmaq üçün
            yaradılmışıq.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-3xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-white/50 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            Missiyamız
          </span>
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">
            Azərbaycanın ən yaxşı memarları ilə<br className="hidden sm:block" /> müştəriləri birləşdiririk
          </h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-2xl mx-auto">
            Hər layihə bir arzunun həyata keçməsidir. ArchiLink bu prosesi
            asanlaşdırmaq, şəffaf etmək və hər iki tərəf üçün faydalı qılmaq
            üçün yaradılıb. Memarlar üçün yeni müştəri imkanı, müştərilər üçün
            isə etibarlı peşəkar — bu bizim missiyamızdır.
          </p>
        </div>

        {/* What we offer */}
        <h3 className="font-heading text-2xl font-bold text-slate-900 mb-6 text-center">
          Nə təklif edirik?
        </h3>
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {OFFERINGS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h4 className="font-heading font-bold text-slate-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Values */}
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-slate-500 bg-slate-200 px-4 py-1.5 rounded-full mb-4">
              Dəyərlərimiz
            </span>
            <h3 className="font-heading text-2xl font-bold text-slate-900">
              Nəyə inanırıq?
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {VALUES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-5 border border-slate-100"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <h4 className="font-heading font-bold text-slate-900 mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Star className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="font-heading text-3xl font-bold mb-4">
            Sualınız var?
          </h2>
          <p className="text-white/60 text-base mb-8 max-w-lg mx-auto">
            Komandamız sizə kömək etməyə həmişə hazırdır. Bizimlə əlaqə
            saxlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/elaqe"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Əlaqə saxla
            </Link>
            <Link
              href="/memarlar"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Memarları kəşf et
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
