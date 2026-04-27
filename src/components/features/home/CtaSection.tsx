import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D9488] via-[#14B8A6] to-[#115E59] p-10 sm:p-14 lg:p-20">
          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-5">
              Hazırsınızsa, sadəcə bir tıkla başlayın
            </h2>
            <p className="text-base sm:text-lg text-white/85 mb-8 leading-relaxed">
              Qeydiyyat tamamilə pulsuzdur. İstər müştəri kimi memar axtarın,
              istər peşəkar kimi yeni layihələr qazanın — ArchiLink-də sizin
              üçün doğru yer var.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/qeydiyyat"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold bg-white text-[#0D9488] hover:bg-white/95 transition-colors shadow-xl"
              >
                <UserPlus className="w-4 h-4" />
                İndi qeydiyyatdan keç
              </Link>
              <Link
                href="/memarlar"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
              >
                Memarları kəşf et
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
