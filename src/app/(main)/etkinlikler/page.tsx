"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Clock, Users, Tag, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type EventType = "seminar" | "exhibition" | "workshop" | "conference";

interface ArchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: EventType;
  organizer: string;
  isFree: boolean;
  price?: number;
  description: string;
}

const EVENTS: ArchEvent[] = [
  {
    id: "1",
    title: "Müasir Memarlıqda Davamlılıq Simpozumu",
    date: "2025-04-05",
    time: "10:00",
    location: "Bakı Konqres Mərkəzi, Bakı",
    type: "conference",
    organizer: "Azərbaycan Memarlar İttifaqı",
    isFree: false,
    price: 40,
    description: "Davamlı memarlıq, yaşıl bina sertifikatlaşdırması və enerji effektivliyi mövzularında beynəlxalq ekspertlərin çıxışları.",
  },
  {
    id: "2",
    title: "BIM & Rəqəmsal Memarlıq Workshopu",
    date: "2025-04-12",
    time: "09:00",
    location: "Texnologiya Parkı, Bakı",
    type: "workshop",
    organizer: "ArchiLink & Autodesk Azerbaijan",
    isFree: false,
    price: 60,
    description: "Revit, BIM Collaborate Pro və Dynamo alətlərinin praktiki tətbiqi üzrə sertifikat proqramı. Yalnız 20 iştirakçı üçün.",
  },
  {
    id: "3",
    title: "Azərbaycan Memarlığı: Keçmişdən Gələcəyə Sərgi",
    date: "2025-04-18",
    time: "11:00",
    location: "Milli İncəsənət Muzeyi, Bakı",
    type: "exhibition",
    organizer: "Mədəniyyət Nazirliyi",
    isFree: true,
    description: "XX əsrin əvvəlindən bu günə qədər Azərbaycan memarlığının inkişafını sənədləşdirən fotolar, planlar və maketlər.",
  },
  {
    id: "4",
    title: "Şəhər Planlaşdırması və İctimai Məkan Seminari",
    date: "2025-04-25",
    time: "14:00",
    location: "ADA Universiteti, Bakı",
    type: "seminar",
    organizer: "ADA Urban Studies Institute",
    isFree: true,
    description: "Bakının 2040 master planı, yaşayış sıxlığı, nəqliyyat korridorları və yaşıl məkanların gələcəyi haqqında açıq müzakirə.",
  },
  {
    id: "5",
    title: "Interyer Dizayn Trendləri 2025 Seminarı",
    date: "2025-05-03",
    time: "16:00",
    location: "Hilton Baku, Bakı",
    type: "seminar",
    organizer: "Design Week Azerbaijan",
    isFree: false,
    price: 25,
    description: "Aparıcı interyer dizaynerləri 2025-ci ilin ən vacib trendlərini, material yeniliklərini və müştəri gözləntiləri haqqında danışır.",
  },
  {
    id: "6",
    title: "Gəncə Memarlıq Festivalı",
    date: "2025-05-17",
    time: "10:00",
    location: "Heydar Əliyev Parkı, Gəncə",
    type: "exhibition",
    organizer: "Gəncə Şəhər İcra Hakimiyyəti",
    isFree: true,
    description: "İki günlük festival: sərgi, mühazirələr, canlı eskiz yarışmaları və şəhər turları. Bütün yaş qrupları üçün açıqdır.",
  },
];

const TYPE_LABELS: Record<EventType, string> = {
  seminar: "Seminar",
  exhibition: "Sərgi",
  workshop: "Workshop",
  conference: "Konfrans",
};

const TYPE_COLORS: Record<EventType, string> = {
  seminar: "bg-primary/10 text-primary",
  exhibition: "bg-emerald-100 text-emerald-700",
  workshop: "bg-teal-100 text-teal-700",
  conference: "bg-amber-100 text-amber-700",
};

const TYPE_BADGE_COLORS: Record<EventType, string> = {
  seminar: "bg-primary",
  exhibition: "bg-emerald-500",
  workshop: "bg-teal-500",
  conference: "bg-amber-500",
};

const FILTERS = ["Hamısı", "Seminar", "Sərgi", "Workshop", "Konfrans"];

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("az-AZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDayNumber(dateStr: string) {
  return new Date(dateStr).getDate();
}

function getMonthShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("az-AZ", { month: "short" });
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

function EventCard({ event, past = false }: { event: ArchEvent; past?: boolean }) {
  const { t } = useI18n();

  return (
    <div
      className={`rounded-2xl border border-border bg-white overflow-hidden flex flex-col sm:flex-row transition-shadow ${
        past ? "opacity-60 grayscale" : "hover:shadow-md"
      }`}
    >
      {/* Date Badge */}
      <div
        className={`flex flex-col items-center justify-center px-6 py-5 min-w-[90px] ${
          past ? "bg-slate-400" : TYPE_BADGE_COLORS[event.type]
        }`}
      >
        <span className="text-4xl font-heading font-bold text-white leading-none">
          {getDayNumber(event.date)}
        </span>
        <span className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-1">
          {getMonthShort(event.date)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[event.type]}`}>
            {TYPE_LABELS[event.type]}
          </span>
          {event.isFree ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {t("events.free")}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {event.price} AZN
            </span>
          )}
          {past && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
              {t("events.past")}
            </span>
          )}
        </div>

        <h3 className="font-heading font-bold text-slate-900 text-base leading-snug">
          {event.title}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{event.description}</p>

        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {event.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {formatEventDate(event.date)} · {event.time}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {event.organizer}
          </span>
        </div>
      </div>

      {/* Register Button */}
      <div className="flex items-center justify-center px-5 py-4 border-t sm:border-t-0 sm:border-l border-border">
        {past ? (
          <span className="text-xs text-slate-400 font-medium text-center">{t("events.ended")}</span>
        ) : (
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
            <ExternalLink className="w-3.5 h-3.5" />
            {t("events.register")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState("Hamısı");

  const filterByType = (event: ArchEvent) => {
    if (activeFilter === "Hamısı") return true;
    return TYPE_LABELS[event.type] === activeFilter;
  };

  const upcoming = EVENTS.filter((e) => isUpcoming(e.date) && filterByType(e));
  const past = EVENTS.filter((e) => !isUpcoming(e.date) && filterByType(e));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">{t("events.title")}</h1>
          <p className="text-white/70 text-lg max-w-xl">
            {t("events.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeFilter === f
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-border hover:border-primary hover:text-primary"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              {f}
            </button>
          ))}
        </div>

        {/* Upcoming Events */}
        <section>
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {t("events.upcoming")}
            <span className="text-sm font-normal text-muted-foreground ml-1">({upcoming.length})</span>
          </h2>

          {upcoming.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-border bg-white">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-slate-500">Bu kateqoriyada gələcək etkinlik tapılmadı</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        {past.length > 0 && (
          <section className="mt-14">
            <h2 className="font-heading text-xl font-bold text-slate-700 mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              {t("events.past")}
              <span className="text-sm font-normal text-muted-foreground ml-1">({past.length})</span>
            </h2>
            <div className="space-y-4">
              {past.map((event) => (
                <EventCard key={event.id} event={event} past />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E2D4D] to-[#1E1040] text-white p-8 text-center">
          <h3 className="font-heading text-2xl font-bold mb-2">Etkinlik Keçirmək İstəyirsiniz?</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto text-sm">
            Memarlıq icması üçün seminar, sərgi və ya workshop təşkil etmək istəyirsinizsə, bizimlə əlaqə saxlayın.
          </p>
          <Link
            href="/elaqe"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Bizimlə Əlaqə
          </Link>
        </div>
      </div>
    </div>
  );
}
