import type { Metadata } from "next";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Lock,
  Search,
  Plus,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "İş Elanları | ArchiLink",
  description:
    "Azərbaycanda memarlıq sahəsində iş imkanları. Baş memar, interyer dizayner, landşaft memarı və digər vakansiyaları kəşf edin.",
};

const JOBS = [
  {
    title: "Baş Memar",
    company: "Bakı İnşaat MMC",
    location: "Bakı",
    type: "Tam ştat",
    typeBg: "bg-emerald-100 text-emerald-700",
    salary: "2500 - 4000 AZN",
    posted: "2 gün əvvəl",
    color: "from-teal-500 to-emerald-600",
  },
  {
    title: "İnteryer Dizayner",
    company: "Design Studio",
    location: "Bakı",
    type: "Yarım ştat",
    typeBg: "bg-sky-100 text-sky-700",
    salary: "1200 - 2000 AZN",
    posted: "5 gün əvvəl",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Landşaft Memarı",
    company: "Green Space",
    location: "Bakı",
    type: "Frilanser",
    typeBg: "bg-amber-100 text-amber-700",
    salary: "Layihə əsaslı",
    posted: "1 həftə əvvəl",
    color: "from-amber-500 to-orange-600",
  },
];

export default function JobBoardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            Memarlıq İş Elanları
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Azərbaycanın aparıcı memarlıq şirkətlərindən ən son iş
            imkanlarını kəşf edin və karyeranızı irəli aparın.
          </p>
          <div className="flex items-center gap-6 mt-8 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              50+ vakansiya gözlənilir
            </span>
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              30+ şirkət
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search bar (non-functional) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Vəzifə, şirkət və ya açar söz axtar..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
              disabled
            />
          </div>
          <button
            disabled
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] text-white font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            Axtar
          </button>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {JOBS.map((job) => (
            <div
              key={job.title}
              className="relative rounded-2xl border border-border bg-white overflow-hidden group"
            >
              {/* Locked overlay */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
                  <Lock className="w-4 h-4" />
                  Tezliklə...
                </div>
              </div>

              <div className="p-6 flex flex-col sm:flex-row gap-5">
                {/* Color accent */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${job.color} flex items-center justify-center shrink-0`}
                >
                  <Briefcase className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      {job.title}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${job.typeBg}`}
                    >
                      {job.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {job.posted}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#0D9488]">
                    {job.salary}
                  </p>
                </div>

                <div className="flex items-center shrink-0">
                  <Lock className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — Post a Job */}
        <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D9488]/10 flex items-center justify-center mx-auto mb-5">
            <Plus className="w-7 h-7 text-[#0D9488]" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            İş elanı yerləşdirmək istəyirsiniz?
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-8">
            Tezliklə şirkətlər öz vakansiyalarını ArchiLink platformasında
            paylaşa biləcəklər. Xəbərdar olmaq üçün bizimlə əlaqə saxlayın.
          </p>
          <button
            disabled
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#111111] text-white font-semibold text-sm hover:bg-[#111111]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            İş elanı yerləşdir
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
