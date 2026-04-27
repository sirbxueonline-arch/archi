import type { Metadata } from "next";
import {
  GraduationCap,
  BookOpen,
  Clock,
  BarChart3,
  Lock,
  Play,
  Award,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Memarlıq Kursları | ArchiLink",
  description:
    "Peşəkar memarlıq kursları. AutoCAD, 3D vizualizasiya, davamlı memarlıq və digər sahələrdə bilik və bacarıqlarınızı artırın.",
};

const COURSES = [
  {
    title: "AutoCAD Əsasları",
    description:
      "AutoCAD proqramının əsaslarından peşəkar səviyyəyə qədər addım-addım öyrənin. 2D və 3D çertyoj hazırlama bacarıqları.",
    lessons: 12,
    level: "Başlanğıc səviyyə",
    levelBg: "bg-emerald-100 text-emerald-700",
    duration: "6 həftə",
    color: "from-teal-500 to-emerald-600",
  },
  {
    title: "3D Vizualizasiya",
    description:
      "3ds Max və V-Ray ilə fotorealistik render texnikaları. Müştəri təqdimatları üçün professional vizualizasiya.",
    lessons: 8,
    level: "Orta səviyyə",
    levelBg: "bg-sky-100 text-sky-700",
    duration: "4 həftə",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Davamlı Memarlıq",
    description:
      "Yaşıl bina standartları, enerji effektivliyi və ekoloji dizayn prinsipləri. LEED sertifikasiyasına hazırlıq.",
    lessons: 10,
    level: "İrəliləmiş",
    levelBg: "bg-amber-100 text-amber-700",
    duration: "5 həftə",
    color: "from-amber-500 to-orange-600",
  },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            Peşəkar Kurslar
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Azərbaycanın ən yaxşı memarlarından öyrənin. Peşəkar inkişafınız
            üçün hazırlanmış sertifikatlı kurslarla bacarıqlarınızı artırın.
          </p>
          <div className="flex items-center gap-6 mt-8 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              10+ kurs gözlənilir
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Sertifikat verilir
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((course) => (
            <div
              key={course.title}
              className="relative rounded-2xl border border-border bg-white overflow-hidden group h-full flex flex-col"
            >
              {/* Locked overlay */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
                  <Lock className="w-4 h-4" />
                  Tezliklə...
                </div>
              </div>

              {/* Gradient placeholder image */}
              <div
                className={`h-44 bg-gradient-to-br ${course.color} flex items-center justify-center relative`}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${course.levelBg}`}
                  >
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {course.title}
                  </h3>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-4 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.lessons} dərs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — Get Notified */}
        <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0D9488]/10 flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-7 h-7 text-[#0D9488]" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Kurslar tezliklə başlayacaq!
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-8">
            İlk kurslardan xəbərdar olmaq və erkən qeydiyyat endirimi əldə
            etmək üçün e-poçt ünvanınızı qeyd edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-poçt ünvanınız"
              className="flex-1 px-5 py-3 rounded-xl border border-border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
              disabled
            />
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] text-white font-semibold text-sm hover:bg-[#0D9488]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Xəbərdar ol
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
