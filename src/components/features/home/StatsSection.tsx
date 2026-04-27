import { Users, Building2, Star, MapPin } from "lucide-react";

interface StatCounts {
  professionals: number;
  portfolios: number;
}

export function StatsSection({ counts }: { counts: StatCounts }) {
  const stats = [
    {
      icon: Users,
      value: counts.professionals > 0 ? `${counts.professionals}` : "—",
      label: "Peşəkar",
      description: "Qeydiyyatdan keçmiş memarlıq professionalları",
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      icon: Building2,
      value: counts.portfolios > 0 ? `${counts.portfolios}` : "—",
      label: "Portfolio Layihəsi",
      description: "Platforma üzərindəki layihə işləri",
      color: "text-accent",
      bg: "bg-accent/8",
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Ortalama Reytinq",
      description: "Müştəri rəylərinə əsaslanan ortalama qiymət",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: MapPin,
      value: "20+",
      label: "Şəhər",
      description: "Azərbaycanda xidmət göstərilən şəhərlər",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center p-6"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-heading font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="font-semibold text-foreground text-sm mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
