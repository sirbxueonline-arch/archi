import Link from "next/link";
import { ArrowRight, Building2, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="max-w-3xl mb-14">
          <span className="inline-block text-xs font-bold text-[#0D9488] uppercase tracking-widest mb-4">
            ArchiLink haqqında
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-gray-900 leading-[1.1] mb-5">
            Azərbaycanın memarları və müştəriləri arasında körpü
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            ArchiLink — peşəkar memarlıq və dizayn xidmətlərini bir yerə toplayan
            Azərbaycanın ilk platformasıdır. Müştərilər üçün doğru mütəxəssisi
            tapmaq, peşəkarlar üçün isə yeni müştərilər qazanmaq heç vaxt bu qədər
            asan olmayıb.
          </p>
        </div>

        {/* Audience split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Clients */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#115E59] p-9 sm:p-10 text-white">
            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">
                Müştərilər üçün
              </h3>
              <p className="text-white/85 leading-relaxed mb-6 text-sm">
                İdeal evinizi, ofisinizi və ya kommersiya layihənizi həyata keçirmək
                üçün yoxlanılmış memarları və dizaynerləri tapın. Portfoliolara
                baxın, qiymətləri müqayisə edin, birbaşa əlaqə saxlayın.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-white/85">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">✓</span>
                  Yüzlərlə yoxlanılmış peşəkar
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">✓</span>
                  Şəffaf qiymət təklifləri
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">✓</span>
                  Real müştəri rəyləri və portfolio
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">✓</span>
                  Vasitəçi yoxdur, komissiya 0%
                </li>
              </ul>
              <Link
                href="/qeydiyyat?rol=client"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white text-[#0D9488] hover:bg-white/95 transition-colors shadow-lg"
              >
                Müştəri kimi qeydiyyat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Professionals */}
          <div className="group relative overflow-hidden rounded-2xl bg-[#0F1115] p-9 sm:p-10 text-white">
            <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#0D9488]/20 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center mb-6">
                <Building2 className="w-5 h-5 text-[#6DC9A8]" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3">
                Memarlar üçün
              </h3>
              <p className="text-white/70 leading-relaxed mb-6 text-sm">
                İşinizi dünyaya göstərin, yeni müştərilər qazanın və karyeranızı
                növbəti səviyyəyə qaldırın. Bazardakı açıq layihələrə təklif verin,
                portfolio yaradın, brendinizi gücləndirin.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0D9488]/30 flex items-center justify-center text-[10px] font-bold text-[#6DC9A8]">✓</span>
                  Pulsuz portfolio və profil
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0D9488]/30 flex items-center justify-center text-[10px] font-bold text-[#6DC9A8]">✓</span>
                  Real layihə bazarına çıxış
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0D9488]/30 flex items-center justify-center text-[10px] font-bold text-[#6DC9A8]">✓</span>
                  Birbaşa müştəri ilə mesajlaşma
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0D9488]/30 flex items-center justify-center text-[10px] font-bold text-[#6DC9A8]">✓</span>
                  Reytinq, rəy və axtarış görünürlüyü
                </li>
              </ul>
              <Link
                href="/qeydiyyat?rol=professional"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors shadow-lg"
              >
                Memar kimi qeydiyyat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
