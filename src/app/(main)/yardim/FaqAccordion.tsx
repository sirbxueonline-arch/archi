"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    id: 1,
    question: "ArchiLink nədir?",
    answer:
      "ArchiLink Azərbaycanın aparıcı memar və dizaynerləri ilə müştəriləri birləşdirən rəqəmsal platformadır. Platforma vasitəsilə peşəkar memar profillərini araşdıra, portfellərini nəzərdən keçirə, layihə üçün əlaqə saxlaya və layihə bazarına elan yerləşdirə bilərsiniz.",
  },
  {
    id: 2,
    question: "Platforma pulsuz istifadə olunurmu?",
    answer:
      "Bəli, ArchiLink hazırda tam pulsuz xidmət kimi fəaliyyət göstərir. Həm memar/professional kimi qeydiyyat, həm də müştəri kimi memar axtarışı və layihə elanı yerləşdirmək tamamilə pulsuz və limitsizdir. Gələcəkdə premium funksiyalar əlavə olunarsa, istifadəçilər ən azı 30 gün öncədən məlumatlandırılacaq.",
  },
  {
    id: 3,
    question: "Professional kimi necə qeydiyyatdan keçmək olar?",
    answer:
      "Professional kimi qeydiyyatdan keçmək üçün: 1) Saytın yuxarı sağ küncündəki «Qeydiyyat» düyməsini sıxın. 2) «Professional» seçimini işarələyin. 3) Ad, soyad, e-poçt, şifrə, ixtisas sahənizi daxil edin. 4) Profil məlumatlarınızı (bio, bacarıqlar, əlaqə) doldurun. 5) Portfelinizdən nümunə layihələri yükləyin. Qeydiyyatdan sonra profiliniz dərhal aktiv olur.",
  },
  {
    id: 4,
    question: "Müştəri kimi necə memar tapa bilərəm?",
    answer:
      "Memar tapmaq üçün «Memarlar» bölməsinə keçin. Orada ixtisas sahəsinə, şəhərə, reytinqə görə filterləyə bilərsiniz. Hər memar profilini açaraq portfelini, rəyləri və əlaqə məlumatlarını görə bilərsiniz. Xoşunuza gəldiyi memar ilə birbaşa mesaj vasitəsilə əlaqə saxlaya bilərsiniz.",
  },
  {
    id: 5,
    question: "Portfolio necə əlavə edilir?",
    answer:
      "Portfolio əlavə etmək üçün hesabınıza daxil olun və «Profil» bölməsinə keçin. «Portfolio əlavə et» düyməsini sıxın, layihənin adını, təsvirini daxil edin və şəkillər yükləyin. Hər layihə üçün istifadə olunan üslub, yer və müddəti də göstərə bilərsiniz. Portfolio nə qədər zəngin olsa, müştəri cəlb etmə imkanınız bir o qədər artır.",
  },
  {
    id: 6,
    question: "Reytinq sistemi necə işləyir?",
    answer:
      "Reytinq sistemi 5 ulduz üzərindən hesablanır. Müştərilər memar ilə iş tamamlandıqdan sonra rəy bildirə bilər. Ulduz sayı ilə birlikdə yazılı şərh də əlavə edilə bilər. Rəylər profilin ictimai hissəsindən hamıya görünür. Yüksək reytinq memar profilini axtarışda yuxarıya qaldırır.",
  },
  {
    id: 7,
    question: "Layihə bazarına necə elan yerləşdirilir?",
    answer:
      "Layihə bazarına elan yerləşdirmək üçün «Bazar» bölməsinə keçin və «Elan yerləşdir» düyməsini sıxın. Layihənin adı, təsviri, büdcə diapazonu, yerləşdiyi şəhər və tələb olunan ixtisas sahəsini doldurun. Elan aktiv olduqdan sonra uyğun memarlar sizinlə əlaqə saxlaya bilər.",
  },
  {
    id: 8,
    question: "Hesabımı necə silə bilərəm?",
    answer:
      "Hesabınızı silmək üçün «Parametrlər» bölməsinə keçin, «Hesabı sil» seçimini tapın və təsdiqləyin. Hesab silindikdən sonra bütün şəxsi məlumatlarınız 30 gün ərzində sistemdən tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz, buna görə silmədən əvvəl vacib məlumatlarınızı yedəkləyin.",
  },
];

function FaqItem({ faq }: { faq: (typeof FAQS)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
            {faq.id}
          </span>
          <span className="font-semibold text-slate-800 text-sm sm:text-base">
            {faq.question}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="pl-10 text-sm text-slate-600 leading-relaxed">
            {faq.answer}
          </div>
        </div>
      )}
    </div>
  );
}

export function FaqAccordion() {
  return (
    <div className="space-y-3">
      {FAQS.map((faq) => (
        <FaqItem key={faq.id} faq={faq} />
      ))}
    </div>
  );
}
