import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, ChevronRight } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Əlaqə | ArchiLink",
  description: "ArchiLink ilə əlaqə saxlayın. Bakı, Azərbaycan.",
};

const CONTACT_CARDS = [
  {
    icon: Phone,
    label: "Telefon",
    value: "+994 99 110 66 00",
    href: "tel:+994991106600",
    sub: "İş günləri 09:00–18:00",
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300",
  },
  {
    icon: Mail,
    label: "E-poçt",
    value: "info@archilink.az",
    href: "mailto:info@archilink.az",
    sub: "24 saat ərzində cavab",
    color: "bg-primary/10",
    iconColor: "text-primary",
    hoverBorder: "hover:border-primary/40",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@archilink.az",
    href: "https://instagram.com/archilink.az",
    sub: "instagram.com/archilink.az",
    color: "bg-rose-100",
    iconColor: "text-rose-500",
    hoverBorder: "hover:border-rose-300",
  },
  {
    icon: MapPin,
    label: "Ünvan",
    value: "Bakı, Azərbaycan",
    href: "https://maps.google.com/?q=Baku,Azerbaijan",
    sub: "Baş ofis",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-300",
  },
];

export default function ContactPage() {
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
            <span className="text-white/80">Əlaqə</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
              <Mail className="w-7 h-7 text-sky-300" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
                Əlaqə
              </h1>
              <p className="text-white/60 text-sm">
                Bizimlə əlaqə saxlamaqdan çəkinməyin
              </p>
            </div>
          </div>
          <p className="mt-6 text-white/70 text-base leading-relaxed max-w-2xl">
            Sualınız, təklifiniz və ya rəyiniz varsa, komandamız sizə kömək
            etməyə həmişə hazırdır. Aşağıdakı kanallardan hər hansı biri ilə
            bizimlə əlaqə saxlaya bilərsiniz.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        {/* Contact info cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {CONTACT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.label}
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  card.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`group flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl ${card.hoverBorder} hover:shadow-sm transition-all`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                    {card.label}
                  </p>
                  <p className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Contact Form — client component */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 sm:p-10">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
