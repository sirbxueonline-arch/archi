import Link from "next/link";
import { HelpCircle, ChevronRight, Mail, Phone } from "lucide-react";
import { FaqAccordion } from "./FaqAccordion";

export const metadata = {
  title: "Yardım Mərkəzi | ArchiLink",
  description: "ArchiLink haqqında tez-tez verilən suallar və yardım mərkəzi.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              ArchiLink
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">Yardım Mərkəzi</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
              <HelpCircle className="w-7 h-7 text-sky-300" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
                Yardım Mərkəzi
              </h1>
              <p className="text-white/60 text-sm">
                Tez-tez verilən suallar və cavablar
              </p>
            </div>
          </div>
          <p className="mt-6 text-white/70 text-base leading-relaxed max-w-2xl">
            ArchiLink haqqında ən çox soruşulan suallara cavabları burada tapa
            bilərsiniz. Cavab tapa bilmədiyiniz halda dəstək komandamızla
            əlaqə saxlaya bilərsiniz.
          </p>
        </div>
      </div>

      {/* FAQ accordion — client component */}
      <div className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-slate-900 mb-8 text-center">
          Tez-tez Verilən Suallar
        </h2>
        <FaqAccordion />
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-slate-50 to-sky-50/40 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
              Hələ də sualınız var?
            </h2>
            <p className="text-slate-500 text-sm">
              Dəstək komandamız sizə kömək etməyə hazırdır
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:info@archilink.az"
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  E-poçt dəstəyi
                </p>
                <p className="text-primary text-sm font-medium mt-0.5">
                  info@archilink.az
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  24 saat ərzində cavab
                </p>
              </div>
            </a>
            <a
              href="tel:+994991106600"
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  Telefon dəstəyi
                </p>
                <p className="text-emerald-600 text-sm font-medium mt-0.5">
                  +994 99 110 66 00
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  İş günləri 09:00–18:00
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
