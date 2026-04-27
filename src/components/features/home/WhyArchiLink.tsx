import { ShieldCheck, Zap, Award, MessageCircle, Eye, MapPin } from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Yoxlanılmış peşəkarlar",
    desc: "Hər bir memar identifikasiyadan keçir. Real təcrübə, real layihələr — heç bir uydurma profil yoxdur.",
  },
  {
    icon: Zap,
    title: "Sürətli birbaşa əlaqə",
    desc: "Vasitəçi olmadan birbaşa peşəkarla mesajlaşın, fayl paylaşın və layihəni saatlar içində başladın.",
  },
  {
    icon: Award,
    title: "Şəffaf rəylər",
    desc: "Yalnız tamamlanmış layihələrdən sonra verilən real müştəri rəyləri — şişirdilmiş reytinqlər yoxdur.",
  },
  {
    icon: MessageCircle,
    title: "0% komissiya",
    desc: "Qeydiyyat və əsas xidmətlər tamamilə pulsuzdur. İşinizdən qazandığınız hər manat sizin qalır.",
  },
  {
    icon: Eye,
    title: "Layihə portfoliosu",
    desc: "Memarın əvvəlki işlərini detallı şəkildə görün — Behance üslubunda təmiz, peşəkar görüntü.",
  },
  {
    icon: MapPin,
    title: "Bütün Azərbaycan",
    desc: "Bakıdan Naxçıvana qədər 20+ şəhərdə fəaliyyət göstərən peşəkarlar bir platformada.",
  },
];

export function WhyArchiLink() {
  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold text-[#0D9488] uppercase tracking-widest mb-4">
            Niyə ArchiLink?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Memarlıq və dizayn üçün düşünülmüş bir yer
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Hər tərəfdən şəffaflıq, etibar və sürət — ArchiLink bu üç prinsip üzərində qurulub.
          </p>
        </div>

        {/* Value props grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#0D9488]/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-5 group-hover:bg-[#0D9488] transition-colors duration-300">
                <v.icon className="w-5 h-5 text-[#0D9488] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
